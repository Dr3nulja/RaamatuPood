import { prisma } from '@/lib/prisma';

type Auth0SessionUser = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

export async function createUserIfNotExists(authUser: Auth0SessionUser | null | undefined) {
  const auth0Id = authUser?.sub?.trim();
  if (!auth0Id) {
    return null;
  }

  const email = authUser?.email?.trim() || `${auth0Id}@auth0.local`;

  const user = await prisma.user.upsert({
    where: { auth0Id },
    update: {
      email,
    },
    create: {
      auth0Id,
      email,
      name: null,
      picture: null,
    },
  });

  return user;
}
