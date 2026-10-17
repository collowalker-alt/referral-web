# NEXORA Connect Orders, Wallet Payment and Scoped Connect Admin

## Included
- Adds persisted `ConnectOrder` records for data, minutes and SMS bundle requests.
- Server-side catalogue is authoritative; amount/name/validity supplied by the browser are ignored.
- Supports `WALLET` and `KIGEN_DIRECT` order payment methods.
- Wallet checkout atomically checks and deducts available wallet balance, creates the Connect order and records a `CONNECT_PURCHASE` ledger transaction. An idempotency key prevents repeat charging when the client retries the same request.
- Customer can view Connect order history; user notifications update when order status changes.
- New `CONNECT_ADMIN` role is restricted to `/api/admin/connect/*`, `/api/admin/me`, logout-all and 2FA management. It cannot access the general admin console APIs.
- A Super Admin can create an administrator with the role shown in the interface as **Internet Services Admin — bundles only** (stored internally as `CONNECT_ADMIN`) in Admin Management. The role can access only the Connect order endpoints, its own admin profile/session and 2FA routes; it cannot see the main admin sections.
- Connect Admin can search/filter orders, manually record external M-Pesa payment verification, start fulfilment, mark actual delivery, cancel unpaid orders, or mark orders failed.
- If a wallet-paid order is marked failed before delivery, the backend atomically returns the amount to the wallet and creates one `REFUND` transaction. An externally paid order is not automatically refunded from NEXORA; any refund must be coordinated with Kigen.

## Mandatory database update before using these features
The Prisma schema has new `CONNECT_PURCHASE` and `CONNECT_ADMIN` enum values and a `ConnectOrder` table. Run the project's existing schema push command against the correct NEXORA database before deploying/starting this new code:

```bash
npm run db:push
```

Run this only after confirming `DATABASE_URL` points at the intended existing NEXORA database and database access is restored. Back up the database first where possible. The build command generates Prisma Client but does not run `db:push`. If Neon still reports an exhausted network transfer allowance or the P1001 connection error, the schema update will not complete; restore database access first. Do not create a replacement project or delete existing tables to work around it.

## Create the dedicated bundle administrator
1. Sign in using a Super Admin account.
2. Open **Admin Management**.
3. Create an administrator with a unique email and password of at least 10 characters.
4. Choose **Internet Services Admin — bundles only** as the role.
5. Share the credentials privately and ask that admin to enable two-factor authentication.
6. The new admin sees only **Internet Services** in the sidebar and can review orders, check direct M-Pesa payments against provider records, update fulfilment, and process refunds for wallet-paid orders that fail.

## Operating rules
1. Wallet payment means NEXORA has collected funds; it does not mean Safaricom delivery has occurred. Admin must mark delivered only after delivery is confirmed.
2. Direct-to-Kigen orders remain `AWAITING_PAYMENT` until a Connect Admin independently checks the provider/M-Pesa records and records the M-Pesa transaction code. The UI does not claim automated verification.
3. Never ask a customer for their M-Pesa PIN.
4. If a wallet-paid order cannot be fulfilled, use Mark failed; the backend returns the wallet amount and records a refund transaction.
5. If payment was made directly to Kigen, any refund must be coordinated with Kigen because NEXORA does not hold those funds.

## Verification performed
- Node syntax check of the backend JavaScript passed.
- TypeScript JSX parser check on the frontend passed with zero syntax errors.
- ZIP integrity check passed.
- The full frontend production build and Prisma schema validation were not completed because the dependency install/Prisma CLI were unavailable in this working environment.
- Live wallet deduction, refund, admin permission and database checks have not been exercised against your production database.

A live build and real transaction checks require installed dependencies and a reachable database. Do not claim production readiness until those checks pass.


## UI visibility update
- The dedicated admin role is explicitly labelled **Internet Services Admin — bundles only** instead of relying on the internal name “Connect Admin”.
- The dedicated account sees **Internet Services** as its sidebar item. Super Admin and Admin accounts also have an **Internet Services** sidebar item.
- If an existing account is currently a regular Admin, the Internet Services menu appears after the updated frontend is deployed. For a restricted account, edit its role to **Internet Services Admin — bundles only**, then sign out and sign in again.
