# NEXORA Admin & Operations Update

This update adds the operational/security improvements requested:

- Admin system health dashboard.
- Admin login activity with success/failure events.
- Administrator 2FA using standard TOTP authenticator apps.
- Admin session invalidation (“sign out other sessions”).
- Member session invalidation from Profile & Security.
- Country payment configuration/readiness console.
- User profile timeline including transactions, support events, notifications and admin actions.
- Referral visibility remains available in the user profile, including “referred by” and direct referrals.
- Existing CSV exports, support tickets, notifications, wallet history, payment verification and audit logging remain intact.

## Database

Run after deployment:

```bash
npx prisma db push --schema prisma/schema.prisma
npx prisma generate --schema prisma/schema.prisma
```

The schema adds token-version fields, admin 2FA fields, payment configuration metadata, and administrator login events.

## 2FA

A Super Admin/Admin can open **Admin → Security center → Set up 2FA**. Scan the displayed QR with a TOTP authenticator, enter the six-digit code, and verify. Once enabled, administrator login requires the password plus the authenticator code.

## Payment configuration

The payment configuration screen controls readiness metadata only. Do not enable a country until the corresponding provider credentials and server integration are actually configured. Kenya remains the active Co-op Paybill route in the current project.
