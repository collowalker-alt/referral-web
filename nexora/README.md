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


## Render deployment (frontend + API)

This project is deployed as two Render services:

- **Frontend static site:** `nexora_referral`
  - URL: `https://nexora-referral.onrender.com`
- **API web service:** `nexora-api`
  - URL: `https://nexora-api-shxf.onrender.com`

### Frontend (`nexora_referral`) settings

Use the repository root as the Root Directory.

**Build Command**
```text
npm install --prefix client && npm run build --prefix client
```

**Publish Directory**
```text
client/dist
```

**Environment variable**
```text
VITE_API_URL=https://nexora-api-shxf.onrender.com/api
```

The repository also contains `render.yaml` with the required SPA rewrite:

```text
/*  ->  /index.html  (Rewrite)
```

Render's static-site documentation confirms that React/Vite SPAs need this rewrite for direct routes such as `/admin`. If the existing static service is not managed by a Render Blueprint, the rewrite must be added in that service's Redirects/Rewrites settings; simply committing `render.yaml` does not retroactively change an unmanaged service.

The build also creates `client/dist/admin/index.html` as an additional fallback.

### Backend (`nexora-api`) settings

Keep the existing API service as a separate Render Web Service. Its public API URL is:

```text
https://nexora-api-shxf.onrender.com
```

Keep the existing server environment variables, including:
```text
DATABASE_URL
JWT_SECRET
PAYSTACK_SECRET_KEY
ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
```

After database/schema setup, seed the admin account:
```bash
npm run db:push
npm run db:seed
```

### Admin

After the frontend deploy succeeds, open:

`https://nexora-referral.onrender.com/admin`

The React application switches to the administrator console when the pathname starts with `/admin`.

