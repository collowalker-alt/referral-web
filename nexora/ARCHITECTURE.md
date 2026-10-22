# NEXORA active source map and safe maintenance plan

## Source of truth

The active application source used by the current GitHub build workflows is:

- Frontend: `nexora/client/src/main.jsx`, `nexora/client/src/styles.css`
- Frontend entry/config: `nexora/client/index.html`, `nexora/client/package.json`
- Backend: `nexora/server/src/server.js`, `nexora/server/package.json`
- Database schema: `nexora/prisma/schema.prisma`
- PWA service worker: `nexora/client/public/sw.js`
- Android release workflow: `.github/workflows/build-nexora-android-apk.yml`
- Automated checks: `.github/workflows/nexora-checks.yml`

Deployments should be made from these paths unless the hosting configuration is deliberately changed and reviewed.

## Historical snapshots

Directories such as `nexora/app`, `nexora/nexora_current`, `nexora/nexora_multiadmin`, and `nexora/nexora_work` are historical snapshots, not the active source used by the current workflows. They are intentionally retained for recovery until their contents and any external deployment references have been checked. Do not edit a snapshot expecting the live application to change, and do not delete the snapshots until backups and deployment dependencies have been confirmed.

## Refactoring rules

The active frontend and backend are large, so refactor incrementally. Move one cohesive component or service at a time, preserve API contracts, and require CI checks after every extraction. Do not combine a large file split with payment behavior changes in the same release.

Suggested eventual modules:

- Frontend: `components/`, `pages/`, `admin/`, `hooks/`, `services/`, `styles/`
- Backend: `routes/`, `middleware/`, `services/`, `validators/`
- Tests: `nexora/server/test/` plus browser/end-to-end tests in a separate test directory.

## Release safety

A green build proves that configured build checks passed; it does not prove every live payment or member workflow. Use a staging environment and test account before testing sensitive behavior. Do not run live payment, payout, or balance-changing tests against real member records.

## Production environment

- Set a unique random `JWT_SECRET` with at least 32 characters.
- Set `CORS_ORIGINS` to a comma-separated allow-list of real browser origins that need API access.
- Keep API keys and database credentials only in backend secret environment variables.
- Do not expose password-reset tokens in production API responses.
