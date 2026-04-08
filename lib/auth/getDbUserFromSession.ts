import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

export async function getDbUserFromSession() {
  const session = await auth0.getSession();
  const auth0Id = session?.user?.sub;

  if (!auth0Id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
  });

  return user;
}
