# NEXORA Admin Performance Optimization

## Changes included

- The administrator shell is shown after the session is validated, while only the active core-data section is fetched. Users, transactions, withdrawals, plans, advertising records, marketplace data, and Connect orders are loaded on demand rather than all at sign-in.
- The Users endpoint supports server-side pagination, search, and country/status filters. The UI requests 50 rows at a time. The legacy unpaginated response remains for older clients.
- User queries load a limited sample of referral records while using a database count for the total referral count.
- Added database indexes for common user status/country and withdrawal queue sorting/filtering.
- Added server timing diagnostics for `/api/admin/*` requests. Responses include a `Server-Timing` header and requests slower than 500 ms log method, route, status, and duration without logging credentials or request bodies.
- Login and TOTP/recovery-code success audit writes are no longer awaited before the response. Failures are logged server-side. Password verification, active-account checks, TOTP verification, recovery-code consumption, and admin session checks remain in place.
- Admin refresh-event throttling is reduced to avoid repeat work; silent refreshes do not interrupt a foreground section load or a paginated user search.
- Increased the server-sent-event refresh interval from 2.5 seconds to 8 seconds, reducing repeated admin refresh traffic. The current SSE endpoint sends periodic refresh signals rather than precise change payloads, so live refresh is not instant.

## Apply database changes

The new indexes require the Prisma schema to be applied to the existing database. Back up the database and restore Neon connectivity first. When the database is reachable, run from the project root:

```bash
npm run db:push
```

Review Prisma output before confirming any schema changes. Do not reset or recreate the production database.

## Performance diagnostics

The backend adds a `Server-Timing: app;dur=...` header to admin API responses. Requests over 500 ms produce `[SLOW ADMIN REQUEST]` log entries. Use these measurements in Render logs to distinguish application/database delays from frontend rendering.

The password hash check and TOTP verification remain security-sensitive. Do not reduce the password-hashing cost or bypass the database checks just to make login appear faster.

## Verification performed

- `node --check server/src/server.js`: passed.
- TypeScript JSX transpilation check for `client/src/main.jsx`: passed with zero diagnostics.
- Root, client, and server `package.json` JSON parsing: passed.
- Full production build: not verified; dependency installation timed out in this environment.

## Deployment checks still required

1. Restore the Neon database connection/usage and back up the current database.
2. Apply the schema indexes with `npm run db:push`.
3. Deploy to staging and test password login, TOTP, recovery codes, section navigation, user search/pagination, admin actions, and notification navigation.
4. Check Render logs for slow-request measurements before/after deployment.
