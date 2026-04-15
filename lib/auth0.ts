import { Auth0Client } from '@auth0/nextjs-auth0/server';

type ResolvedAuth0Config = {
  appBaseUrl: string;
  issuerBaseUrl: string;
  callbackUrl: string;
  domain: string;
};

function normalizeBaseUrl(value?: string | null, envName = 'AUTH0_BASE_URL') {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().replace(/\/$/, '');
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Unsupported ${envName} protocol`);
    }
  } catch {
    throw new Error(`[auth0] ${envName} must be an absolute URL, for example http://localhost:3000`);
  }

  return normalized;
}

function normalizeDomain(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function getResolvedAuth0Config(): ResolvedAuth0Config {
  const appBaseUrl = normalizeBaseUrl(
    process.env.AUTH0_BASE_URL ?? process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  ) ?? 'http://localhost:3000';
  const issuerBaseUrl = normalizeBaseUrl(process.env.AUTH0_ISSUER_BASE_URL, 'AUTH0_ISSUER_BASE_URL');

  const issuerDomain = normalizeDomain(issuerBaseUrl);
  const explicitDomain = normalizeDomain(process.env.AUTH0_DOMAIN);
  const domain = explicitDomain ?? issuerDomain;

  if (explicitDomain && issuerDomain && explicitDomain !== issuerDomain) {
    throw new Error('[auth0] AUTH0_DOMAIN and AUTH0_ISSUER_BASE_URL must point to the same Auth0 tenant.');
  }

  if (!domain) {
    throw new Error('[auth0] Missing Auth0 domain. Set AUTH0_DOMAIN or AUTH0_ISSUER_BASE_URL.');
  }

  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('[auth0] AUTH0_CLIENT_ID is missing.');
  }

  const managementClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID?.trim();
  if (managementClientId && clientId === managementClientId) {
    throw new Error(
      '[auth0] AUTH0_CLIENT_ID matches AUTH0_MANAGEMENT_CLIENT_ID. Use a Regular Web Application client for login.'
    );
  }

  if (process.env.NODE_ENV !== 'production' && appBaseUrl !== 'http://localhost:3000') {
    console.warn(`[auth0] Local development expects AUTH0_BASE_URL=http://localhost:3000. Current value: ${appBaseUrl}`);
  }

  const resolvedIssuerBaseUrl = issuerBaseUrl ?? `https://${domain}`;
  const callbackUrl = `${appBaseUrl}/auth/callback`;

  return {
    appBaseUrl,
    issuerBaseUrl: resolvedIssuerBaseUrl,
    callbackUrl,
    domain,
  };
}

export const resolvedAuth0Config = getResolvedAuth0Config();

const configuredScope = process.env.AUTH0_SCOPE?.trim() || 'openid profile email';

export const auth0Options = {
  appBaseUrl: resolvedAuth0Config.appBaseUrl,
  domain: resolvedAuth0Config.domain,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  signInReturnToPath: '/',
  authorizationParameters: {
    scope: configuredScope,
    redirect_uri: resolvedAuth0Config.callbackUrl,
  },
  routes: {
    login: '/auth/login',
    callback: '/auth/callback',
  },
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
