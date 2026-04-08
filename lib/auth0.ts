import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';
import { createUserIfNotExists } from '@/lib/auth/createUserIfNotExists';

export const auth0Options = {
  appBaseUrl: process.env.AUTH0_BASE_URL,
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, ''),
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  signInReturnToPath: '/',
  logoutStrategy: 'oidc',
  includeIdTokenHintInOIDCLogoutUrl: true,
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
} as const;

export const auth0 = new Auth0Client(auth0Options);
