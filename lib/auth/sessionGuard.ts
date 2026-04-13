import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import { auth0 } from '@/lib/auth0';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';

export type AuthenticatedSessionContext = {
  authUser: {
    sub: string;
    email?: string;
    email_verified?: boolean;
  };
  dbUser: User;
};

export async function requireAuthenticatedSession() {
  const session = await auth0.getSession();
  const authUser = session?.user;

  if (!authUser?.sub) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const dbUser = await createUserIfNotExists(authUser);
  if (!dbUser) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    user: {
      authUser: {
        sub: authUser.sub,
        email: authUser.email,
        email_verified: authUser.email_verified,
      },
      dbUser,
    } satisfies AuthenticatedSessionContext,
  };
}

export function withAuthenticatedSession<
  TParams = unknown,
  TRequest extends Request = Request,
>(
  handler: (request: TRequest, context: TParams, auth: AuthenticatedSessionContext) => Promise<Response>
) {
  return async (request: TRequest, context: TParams) => {
    const auth = await requireAuthenticatedSession();
    if (!auth.ok) {
      return auth.response;
    }

    return handler(request, context, auth.user);
  };
}
