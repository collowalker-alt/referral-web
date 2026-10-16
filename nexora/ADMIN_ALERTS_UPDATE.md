# NEXORA admin attention alerts

This update adds persistent, per-admin in-app notifications for events that need review. The admin console's bell polls every 10 seconds while an administrator is signed in, shows an unread count and a short toast for alerts received during that session, and opens the relevant workspace when an alert is selected. If browser notification permission was already granted, new arrivals can also create a desktop browser notification. This is not an SMS/WhatsApp push service and does not notify a closed browser session.

## Events covered

- **NEXORA Connect order created:** sent to Super Admin, Admin and Connect Admin. Wallet-paid orders say payment is recorded but fulfilment remains pending; direct-to-Kigen orders say external payment is not verified by NEXORA.
- **Membership-plan payment needs verification:** triggered when a member submits an M-Pesa confirmation code for a pending Paybill plan purchase. Sent to Super Admin, Admin and Finance Admin.
- **Membership plan purchase completed:** triggered after the plan transaction is successfully activated (wallet, verified Paybill or successful Paystack path). Sent to Super Admin, Admin and Finance Admin.
- **Wallet deposit needs verification:** triggered when an M-Pesa code is submitted for a Paybill wallet deposit. Sent to Super Admin, Admin and Finance Admin.
- **New project request:** sent to Super Admin and Admin with the request title/type and a link to the Services queue.
- **Withdrawal request:** sent to Super Admin, Admin and Finance Admin.
- **New support ticket:** sent to Super Admin, Admin and Support Admin.

Notifications are assigned to currently active administrator accounts and are scoped to each admin. A unique `(adminId, dedupeKey)` prevents the same event from creating duplicate alerts for an admin. Connect Admin is only allowed to access their scoped notifications and Connect orders.

## Database deployment

A new `AdminNotification` table and the relation on `Admin` were added to `prisma/schema.prisma`. Apply this additive schema update after Neon connectivity is restored and the target database has been backed up:

```bash
npm run db:push
```

Run this from the project root. Read any Prisma prompt carefully. Do not use `--accept-data-loss` to force the update. The app build must generate the Prisma Client from the updated schema before the backend uses `prisma.adminNotification`.

## Verification notes

- `node --check server/src/server.js` should pass.
- Frontend JSX parses/transpiles with TypeScript's JSX parser.
- Full build and real database/runtime notification delivery still require dependency installation, a reachable Neon database, and browser testing.
- Admin alerts are in-app/browser notifications only. Email, SMS and WhatsApp delivery are not configured by this change.
