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
