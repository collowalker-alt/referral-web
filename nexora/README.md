# NEXORA

Full-stack referral membership dashboard with PostgreSQL and Paystack M-Pesa charging.

## 1. Requirements
- Node.js 20+
- Docker (recommended for PostgreSQL)
- Paystack account enabled for Kenya M-Pesa

## 2. Install
cp .env.example .env
docker compose up -d
npm install
npm run install:all
npm run db:push
npm run db:seed

## 3. Start
npm run dev

Frontend: http://localhost:5173
API: http://localhost:5000

## 4. Paystack
Put your Paystack secret key in `.env` as PAYSTACK_SECRET_KEY.
Never put the secret key in React.

Set your Paystack webhook URL to:
https://YOUR-API-DOMAIN/api/paystack/webhook

The server verifies the webhook signature and only then activates the package and creates commissions.

For Kenya M-Pesa, the server sends a charge request using the customer's phone number. Use +254 format where required.

## 5. Production
- Use HTTPS.
- Use a strong random JWT_SECRET.
- Use production PostgreSQL.
- Use Paystack live keys only after testing.
- Configure the webhook on your public HTTPS API.
- Add KYC/AML, terms, privacy, refund policy and applicable Kenyan regulatory review before taking real customer funds.
- Implement an admin authentication layer before exposing administrative endpoints.

## NEXORA Admin Dashboard

The project now includes a separate administrator console at:

`https://YOUR-FRONTEND-DOMAIN/admin`

Admin authentication is separate from member authentication. Set these **server-side** environment variables before running the seed:

```env
ADMIN_NAME="NEXORA Administrator"
ADMIN_EMAIL="your-admin-email@example.com"
ADMIN_PASSWORD="use-a-long-random-password"
```

Then apply the Prisma schema and seed the admin account:

```bash
npm run db:push
npm run db:seed
```

Do not put the admin password, JWT secret, or Paystack secret key in the React frontend. The admin console provides separate views for Overview, Users, Transactions, Withdrawals, and Packages. It also includes user suspension/reactivation, withdrawal processing, and package configuration.

For Netlify SPA hosting, `client/public/_redirects` is included so `/admin` loads the React application instead of returning a 404.
