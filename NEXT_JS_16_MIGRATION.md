# Next.js 16 Migration Notes

This document summarizes the migration state and practical guidance for running this project on Next.js 16.

## Current Status

- Project is running on Next.js 16.x
- App Router structure is already in place
- Turbopack is enabled for development in `package.json`

## Known Warnings and Their Meaning

You may see warnings related to legacy middleware configuration or upcoming defaults.
The most common warnings during migration are:

1. Deprecated middleware entry strategy
2. Missing explicit `allowedDevOrigins` (future hardening behavior)
3. Development-only warnings from dependencies not fully updated yet

Warnings are not always blockers, but they should be tracked and resolved before production release.

## Recommended Configuration Review

Check `next.config.ts` and keep the config minimal and explicit.

Suggested checklist:

1. Remove obsolete flags that were valid only for older Next.js versions
2. Keep experimental flags only when needed
3. Make image and remote pattern rules explicit
4. Confirm redirects/headers/rewrites still match current routing

## Middleware Guidance

If the project uses `middleware.ts`:

1. Keep matcher patterns as narrow as possible
2. Avoid running middleware for static assets unless required
3. Ensure auth/session logic in middleware is lightweight

If behavior changed after migration, verify matcher patterns first.

## Development Origin Hardening

Recent Next.js releases continue tightening development origin handling.
If you run into local-origin restrictions in development, configure allowed origins in the current recommended format for your Next.js version.

## Validation Checklist

After migration updates, verify all major flows:

1. Home page rendering
2. Catalog list and product detail pages
3. Cart interactions
4. Checkout creation
5. Stripe webhook processing
6. Auth0 login/callback/logout
7. Account dashboard and orders
8. Admin dashboard and CRUD actions
9. API routes with authentication checks
10. File upload endpoints

## Performance and Build Verification

Run these commands after changes:

```bash
npm run lint
npm run build
npm run start
```

If production build fails, prioritize fixing type and route-segment errors first.

## Notes for Future Upgrades

- Keep dependencies aligned with the Next.js major version
- Re-check middleware behavior on each major upgrade
- Re-test Stripe/Auth0 flows after framework updates
- Keep migration notes short and actionable

## Conclusion

The project is already operational on Next.js 16.
Remaining migration work should focus on warning cleanup, middleware hardening, and full regression checks before production deployment.