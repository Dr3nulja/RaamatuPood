import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.AUTH0_BASE_URL,
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, ''),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  signInReturnToPath: '/',
  session: {
    rolling: true,
    absoluteDuration: 60 * 60 * 24 * 7,
    inactivityDuration: 60 * 60 * 24,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  },
  onCallback: async (error, context, session) => {
    const baseUrl = context.appBaseUrl || process.env.AUTH0_BASE_URL || 'http://localhost:3000';

    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=callback_failed', baseUrl));
    }

    if (session?.user) {
      await createUserIfNotExists(session.user);
    }

    return NextResponse.redirect(new URL(context.returnTo || '/', baseUrl));
  },
});
