# NEXORA — Country, Payments & Admin Update

## What changed
- Added `countryCode`, `countryName`, `countryVerified`, and `countrySource` to `User`.
- Registration asks for an African country and verifies the selected country against the phone country code on the server.
- Kenya keeps Co-op Bank Paybill.
- Non-Kenya accounts cannot initiate Kenya Paybill payments, wallet Paybill deposits, or Kenya M-Pesa withdrawals.
- Ghana and Côte d’Ivoire are marked as Paystack Mobile Money readiness, but remain unavailable until the real Paystack integration is activated.
- Other listed African countries show payment methods as coming soon.
- Admin Users now shows country, phone country, referrer, referral code and country-risk flags.
- Admin Users has country/status filters and search by referrer/country.
- Admin Overview shows country distribution, payment readiness by country and country-review flags.
- Admin login has show/hide controls for the email and password fields.
- Existing audit logging, balance corrections, plan controls, administrator roles and referral details are preserved.
- Server-side payment guards prevent users from bypassing the UI and calling the Kenya Paybill endpoints from a non-Kenyan account.

## How country identification works
1. The member selects their country at registration.
2. They enter their phone number.
3. NEXORA derives the phone country from the international dial code.
4. The server compares the selected country with the phone country.
5. A mismatch is rejected during registration.
6. The account stores the verified country fields and uses them for payment routing and admin reporting.

For Kenyan local numbers beginning with `07` or `01`, NEXORA treats them as Kenya and continues to support the existing Kenyan formats. For non-Kenya registration, the member should include the international country code, e.g. `+233...` for Ghana.

The system deliberately does not use IP geolocation as the authoritative account country. IP location can be wrong because of VPNs, roaming, proxies and shared networks. Phone country code + declared country is a more useful payment-routing signal, while admins can see mismatches for review.

## Database update
The new User columns must be added to the existing database once:

`npx prisma db push --schema prisma/schema.prisma`

Then regenerate the Prisma client if needed:

`npx prisma generate --schema prisma/schema.prisma`

These fields have defaults, so existing users are treated as Kenya unless their records are later corrected.

## Important payment note
Country support in the UI does not mean the corresponding Paystack channel is live. Actual payment activation still depends on the merchant account, supported channel and credentials. Kenya remains the only active payment route in this build.
