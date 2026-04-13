import { NextResponse } from 'next/server';
import { getAuthFlowState } from '@/lib/auth/flow';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await getAuthFlowState();

  return NextResponse.json(
    {
      state: auth.state,
      user: auth.session?.user
        ? {
            email: auth.session.user.email ?? null,
            emailVerified: auth.session.user.email_verified === true,
          }
        : null,
      profile: auth.dbUser
        ? {
            username: auth.dbUser.name,
            avatarUrl: auth.dbUser.picture,
          }
        : null,
    },
    { status: 200 }
  );
}
