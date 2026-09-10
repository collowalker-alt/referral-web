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
