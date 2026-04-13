/**
 * Auth0 Post Login Action
 *
 * Enforces the authentication flow:
 * 1) Email must be verified
 * 2) Profile must be completed (username + avatar)
 */
exports.onExecutePostLogin = async (event, api) => {
  const appBaseUrl = event.secrets.APP_BASE_URL || 'http://localhost:3000';

  if (event.user.email_verified !== true) {
    api.redirect.sendUserTo(`${appBaseUrl}/verify-email`);
    return;
  }

  const userMetadata = event.user.user_metadata || {};
  const appMetadata = event.user.app_metadata || {};
  const hasUsername = typeof userMetadata.username === 'string' && userMetadata.username.trim().length > 0;
  const hasAvatar = typeof userMetadata.avatar_url === 'string' && userMetadata.avatar_url.trim().length > 0;
  const profileCompleted = appMetadata.profile_completed === true || (hasUsername && hasAvatar);

  // Make profile status available to ID token consumers.
  api.idToken.setCustomClaim('https://raamatupood/profile_completed', profileCompleted);

  if (!profileCompleted) {
    api.redirect.sendUserTo(`${appBaseUrl}/profile-setup`);
  }
};
