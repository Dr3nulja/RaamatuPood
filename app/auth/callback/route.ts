import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse, type NextRequest } from 'next/server';
import { auth0Options } from '@/lib/auth0';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';

export const runtime = 'nodejs';

const auth0Callback = new Auth0Client({
  ...auth0Options,
  onCallback: async (error, context, session) => {
    const baseUrl = context.appBaseUrl || process.env.AUTH0_BASE_URL || 'http://localhost:3000';

    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=callback_failed', baseUrl));
    }

    try {
      await createUserIfNotExists(session?.user);
    } catch (syncError) {
      console.error('Failed to sync Auth0 user during callback', syncError);
    }

    return NextResponse.redirect(new URL(context.returnTo || '/', baseUrl));
  },
});

export async function GET(request: NextRequest) {
  return auth0Callback.middleware(request);
}