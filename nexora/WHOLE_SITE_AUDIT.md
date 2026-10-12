# NEXORA whole-site audit — 12 October 2026

## Fixes applied

1. Added the missing `server/package.json` with the backend runtime dependencies used by `server/src/server.js`. The supplied archive had only an empty server lockfile, so a fresh deployment could not reliably install the server's imports.
2. Removed the stale, empty `server/package-lock.json`; it did not describe the actual server dependencies.
3. Fixed the client build script to run `vite build` directly. The prior script invoked `scripts/postbuild.mjs`, but that file was not present in the supplied project, which would cause the build to fail after Vite completed.
4. Ensured the root package installs `@prisma/client` and `prisma`, which are needed for Prisma client generation and runtime resolution.
5. Fixed account-update popup dismissal. Closing the popup now stores only the IDs actually displayed in that popup, and it no longer marks every notification in the account as read. This prevents unrelated notifications from being silently cleared and prevents dismissed account updates from reopening on reload in the same browser.

## Verification performed

- `node --check server/src/server.js`: passed.
- TypeScript transpilation syntax check for `client/src/main.jsx` with JSX enabled: passed with zero diagnostics.
- Package JSON files parsed successfully after edits.
- Full dependency installation/build could not be completed in this environment: `npm install` timed out twice, so Vite production output, Prisma schema generation, and live runtime/API behavior remain unverified. Do not treat this as a completed production build.

## Recommended deployment validation

1. Install dependencies using the root build script in a network-enabled environment.
2. Run `npx prisma validate --schema prisma/schema.prisma` and generate the Prisma client.
3. Run the Vite production build and deploy to staging.
4. Test login/logout, package purchase and payment status, wallet/deposit/withdrawal, marketplace listing/order, service request submission, notifications and project chat, admin updates, and Academy start/finish lesson.
5. Confirm environment variables and database migrations against the live deployment before replacing production.
