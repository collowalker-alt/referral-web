# NEXORA — Real Member Platform Upgrade

NEXORA is structured as a member workspace plus an administrator console. The member experience now includes dashboard intelligence, package comparison, progressive package-earning rules, referral analytics, a marketing center, QR sharing, Academy lessons, leaderboard, monthly challenges and achievements, wallet/transactions, support tickets, profile/security controls and payment recovery visibility.

## Member platform rules
- Starter is eligible for Starter package purchases.
- Growth is eligible for Starter + Growth purchases.
- Pro is eligible for Starter + Growth + Pro purchases.
- Elite is eligible for Starter + Growth + Pro + Elite purchases.
- Premium is eligible for Starter + Growth + Pro + Elite + Premium purchases.
- The commission amount comes from the package purchased by the referral.
- A package upgrade charges only the price difference.
- The member UI must describe commissions as eligibility/recorded commissions, never guaranteed income.

## New platform areas
1. Dashboard: profile strength, monthly progress, activity and sharing.
2. Achievements: first connection, network builder, consistent promoter and community leader.
3. Leaderboard: top recorded referral commissions, first-name display only.
4. Marketing Center: referral link, QR code, share actions and ready-to-share messages.
5. Referral Analytics: conversion, direct/Level 2 network and monthly commission metrics.
6. Smart notifications: surfaced through dashboard state, payment records and support status.
7. Monthly Challenges: activity goals that do not promise earnings.
8. NEXORA Academy: short lessons on platform use, marketing and safety.
9. Help & Support: member support tickets plus WhatsApp support.
10. Payment Center: transaction history and pending-payment checking.
11. Profile Strength: completeness meter and security checklist.
12. Security Center: update profile and change password.

## Admin
Admin tools include users, balance correction, payment repair, withdrawals, package configuration, activity/audit log and CSV exports.

## Deployment
Frontend and backend are deployed from the same repository. The Render build generates the Prisma client before building the Vite client. The backend creates/updates required additive database columns/tables at startup so the Free Render plan does not require Shell access.

Frontend settings:
- Root Directory: blank
- Build Command: `npm install --prefix client && npm run build --prefix client`
- Publish Directory: `client/dist`
- `VITE_API_URL=https://nexora-api-shxf.onrender.com/api`
- SPA rewrite: `/*` → `/index.html`

Backend required environment variables remain in `.env.example`.

## Important production note
Before taking real money at scale, review the referral/membership model with appropriate Kenyan legal, tax, payments and consumer-protection professionals. Keep package benefits and commission rules transparent and avoid guaranteed-income claims.

## NEXORA Real Platform additions

This build includes a public marketing website, responsive member workspace, profile card, visual referral network map, notification center, Community & Updates feed, configurable admin announcements, NEXORA Academy, achievements, challenges, leaderboard, referral analytics, marketing center, support tickets, security center, membership comparison, package upgrade rules, CSV exports, payment repair, balance correction, audit logging and a PWA install shell.

### Public pages
- `/` — NEXORA public landing page with login/register modal
- `/terms` — Terms of Service summary
- `/privacy` — Privacy Policy summary
- `/membership` — Membership & Referral Rules summary
- `/admin` — Administrator console

### Member experience
The member navigation includes Dashboard, Packages, My Referrals, Analytics, Marketing Center, Community, Notifications, NEXORA Academy, Leaderboard, Challenges, Wallet, Transactions, Help & Support and Security.

### Package earning hierarchy
Starter can earn from Starter purchases; Growth from Starter + Growth; Pro from Starter + Growth + Pro; Elite from Starter + Growth + Pro + Elite; Premium from all five. Eligibility is determined by the package `tier`, not merely by package price.

### Important deployment note
The package uses Prisma generation during the root build and also creates/repairs selected support, announcement, admin-audit and package-settings database structures at API startup. Keep `DATABASE_URL`, `JWT_SECRET`, Paystack keys and the admin environment variables configured on the Render API service.

### Responsible platform language
NEXORA UI intentionally avoids guaranteed-income claims. Referral commissions are described as recorded platform outcomes subject to package eligibility and qualifying purchases. Before taking real money at scale, have the membership, referral, payment, consumer-protection and tax model reviewed for the jurisdictions in which NEXORA operates.


## Premium advertising marketplace
- Starter, Growth, Pro and Elite: referral earning only, subject to configured referral rules.
- Premium: referral earning plus access to Products & Advertising.
- Advertising products are visible only to Premium members.
- Premium members submit post links and performance figures for approved campaigns on WhatsApp Status, TikTok, Instagram, X or another approved platform.
- Advertising payout is calculated from verified views and engagements using campaign-configured rates.
- Approved advertising payouts are scheduled for Friday processing; no fixed income is guaranteed.
- Admin endpoints are available under `/api/admin/ad-products` and `/api/admin/ad-submissions`.

### Database update
After deploying, run `npx prisma db push --schema prisma/schema.prisma` and restart the API service.

## Advertising manager & member campaign uploads
- Premium-only Products & Advertising marketplace is available to active Premium members.
- Members submit the public social post/status URL, upload the exact image/video creative they published (max 8 MB), and enter current views/engagements.
- Admins can manage campaigns and rates from **Admin → Advertising** and review submitted creatives before approving or marking payouts paid.
- Advertising submissions use a configurable KSh-per-1,000-views and KSh-per-engagement model and are intended for Friday payout processing after review.
- The server JSON body limit is 12 MB to accommodate base64 campaign creatives. For large-scale production use, move media storage to object storage (S3/Cloudinary/etc.) rather than keeping media in PostgreSQL.

### Database update
After deploying the new version, run:
`npx prisma db push --schema prisma/schema.prisma`
Then restart the API.

### Recommended campaign controls
- Require a public post URL and the exact published creative.
- Use admin verification before any payout is marked PAID.
- Keep campaign rates configurable instead of hard-coding them.
- Consider adding platform API verification/object storage before scaling to large video uploads.


UI reliability fixes in this revision: payment/package modals now use dedicated touch scroll containers with sticky actions, all long-form modals have bounded scroll areas, and the service worker prefers fresh JS/CSS after deployments.

## Latest wallet/payment updates
- Tapping **M-Pesa Paybill** in the package payment selector now immediately opens the Paybill payment details/code step without requiring a second Continue click.
- Wallet now has **Balance / Deposit / Withdraw** tabs.
- Deposit uses the configured NEXORA M-Pesa Paybill, creates a pending DEPOSIT transaction, accepts the M-Pesa confirmation code, and requires admin verification before crediting the member balance.
- Admin console includes **Wallet deposits** for approving/rejecting deposits and checking the submitted amount/code.
- After deployment, run `npx prisma db push --schema prisma/schema.prisma` (or your normal migration workflow) and `npx prisma generate --schema prisma/schema.prisma` before starting the server.

## NEXORA Marketplace
This version adds a member-to-member marketplace alongside referrals, Premium advertising, wallet and Academy features.

### Marketplace capabilities
- Browse active member listings by search, category and location.
- Product/service listings with title, detailed description, KSh price, stock, seller phone and location.
- Up to six product photos per listing (small web-optimized uploads).
- Member cart stored locally in the browser.
- One-seller-at-a-time checkout to keep delivery and seller fulfillment simple.
- Cash/M-Pesa-on-delivery and NEXORA Wallet checkout.
- Buyer delivery name, phone, address and notes.
- Stock is reserved/decremented transactionally when an order is placed.
- Buyer purchase history and seller order management.
- Order lifecycle: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED, plus cancellation.
- Seller can hide/publish their own listings.
- Admin API for marketplace product moderation and order oversight.

### Recommended production architecture
The current implementation is a functional marketplace foundation. Before large-scale launch, move product media out of PostgreSQL/base64 storage into object storage (Cloudflare R2, S3, Cloudinary or equivalent), add M-Pesa checkout callbacks for marketplace orders, add delivery/shipping integrations, seller verification/KYC, buyer/seller ratings, refunds/disputes, product moderation UI in the Admin panel, and marketplace notifications/email/SMS.

### Database update
Run:

`npx prisma db push --schema prisma/schema.prisma`

`npx prisma generate --schema prisma/schema.prisma`

Then restart the API.

## Marketplace expansion

The marketplace now includes wishlists, post-purchase reviews, verified-seller profiles, coupon validation, buyer dispute submission, and an admin Marketplace Manager for listing moderation, seller verification and order monitoring. Seller verification is an admin-controlled trust signal; it is not a guarantee of product quality.

After deployment run:
`npx prisma db push --schema prisma/schema.prisma`
`npx prisma generate --schema prisma/schema.prisma`

For production, configure object storage for product media before scaling large catalogs, and add an order-specific M-Pesa payment/verification flow before enabling direct mobile-money checkout for marketplace orders.


## Co-operative Bank M-Pesa Paybill configuration

NEXORA now uses Co-operative Bank M-Pesa Paybill instead of an M-Pesa Till for manual package payments and wallet deposits.

Co-operative Bank's official guidance states that **Paybill 400200** is used to send money into a Co-op Bank account. The customer enters the destination Co-op account number, then the amount and M-Pesa PIN.

Set these API environment variables on Render:
- `MPESA_PAYBILL_NUMBER=400200`
- `MPESA_PAYBILL_ACCOUNT=<your NEXORA Co-op Bank account number>`
- `MPESA_PAYBILL_NAME=NEXORA`

The account number is intentionally left blank in `.env.example`; put the real account number in Render's secret environment variables rather than committing it to Git.
