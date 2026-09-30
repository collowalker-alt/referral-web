# NEXORA Admin 2FA Recovery Codes

Recovery codes are now generated when an administrator successfully enables TOTP 2FA.

- 10 one-time recovery codes are generated.
- Only bcrypt hashes are stored in the database; plaintext codes are never persisted.
- Codes are displayed once after setup and can be copied/downloaded by the administrator.
- A recovery code can be used instead of the authenticator code on the 2FA login challenge.
- Once used, the recovery code is removed and cannot be reused.
- Regenerating codes invalidates the previous set and creates 10 new codes.
- Disabling 2FA clears the recovery codes.
- Database schema adds `Admin.recoveryCodes` (JSON).

After deployment, run:

```bash
npx prisma db push --schema prisma/schema.prisma
npx prisma generate --schema prisma/schema.prisma
```

For an existing administrator who already enabled 2FA before this update, use the Security Center's recovery-code regeneration action to create the first set.
