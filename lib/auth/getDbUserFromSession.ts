import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { hasCompleteProfile } from '@/lib/auth/flow';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';

export async function getDbUserFromSession({
  requireVerifiedEmail = true,
  requireCompleteProfile = true,
}: {
  requireVerifiedEmail?: boolean;
  requireCompleteProfile?: boolean;
} = {}) {
  const session = await auth0.getSession();
  const authUser = session?.user;
  const auth0Id = authUser?.sub;

  if (!auth0Id) {
    return null;
  }

  if (requireVerifiedEmail && authUser.email_verified !== true) {
    return null;
  }

  const user =
    (await prisma.user.findUnique({
      where: { auth0Id },
    })) ?? (await createUserIfNotExists(authUser));

  if (!user) {
    return null;
  }

  if (requireCompleteProfile && !hasCompleteProfile(user)) {
    return null;
  }

  return user;
}
