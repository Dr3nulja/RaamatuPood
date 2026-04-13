type TokenCache = {
  accessToken: string;
  expiresAt: number;
} | null;

let managementTokenCache: TokenCache = null;

function getAuth0Domain() {
  return process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? '';
}

async function getManagementAccessToken() {
  const now = Date.now();
  if (managementTokenCache && managementTokenCache.expiresAt > now + 30_000) {
    return managementTokenCache.accessToken;
  }

  const domain = getAuth0Domain();
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error('Auth0 Management API env vars are missing');
  }

  const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE || `https://${domain}/api/v2/`;

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to get Auth0 Management token (${response.status})`);
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) {
    throw new Error('Auth0 Management token response did not include access_token');
  }

  managementTokenCache = {
    accessToken: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 3600) * 1000,
  };

  return payload.access_token;
}

export async function updateAuth0ProfileMetadata(input: {
  auth0UserId: string;
  username: string;
  avatarUrl: string;
}) {
  const domain = getAuth0Domain();
  if (!domain) {
    throw new Error('AUTH0_ISSUER_BASE_URL is missing');
  }

  const token = await getManagementAccessToken();

  const response = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(input.auth0UserId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_metadata: {
        username: input.username,
        avatar_url: input.avatarUrl,
      },
      app_metadata: {
        profile_completed: true,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to update Auth0 profile metadata (${response.status})`);
  }
}
