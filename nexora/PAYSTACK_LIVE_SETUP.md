# NEXORA Paystack Live — Kenya setup

This integration uses Paystack's server-side Charge API for individual M-PESA STK Push payments. It applies only to **wallet deposits** and **membership plan purchases/upgrades**. NEXORA Connect bundle orders retain their existing separate payment flow.

## Render environment

Add this environment variable to the NEXORA backend service in Render:

- `PAYSTACK_SECRET_KEY` = the **live secret key** from the Paystack dashboard (`sk_live_…`).

Do not add this secret to the frontend, Vite variables, source code, Git, or a client-facing configuration file. This flow does not require the Paystack public key because the frontend never calls Paystack directly.

Keep the existing `JWT_SECRET`, `DATABASE_URL`, and other production environment variables. Redeploy/restart the backend after changing environment variables.

## Paystack webhook

Configure this webhook URL in the Paystack dashboard:

`https://nexora-api-shxf.onrender.com/api/paystack/webhook`

This is the webhook URL for the backend URL provided for NEXORA. Subscribe to successful charge events / `charge.success`. The endpoint checks Paystack's `x-paystack-signature` HMAC-SHA512 signature against the raw request body before processing events.

## What the application does

- Starts a KES Paystack M-PESA charge from the server using the member's selected Kenyan phone number.
- Stores a pending transaction and shows the member the amount, phone, and reference.
- Uses signed webhooks plus server-to-server verification/status checks to confirm payment.
- Credits a wallet deposit once, or activates a plan once, only after a successful KES payment whose amount and reference match the NEXORA transaction.
- Leaves NEXORA Connect bundle payment and fulfillment unchanged.
- Keeps the legacy manual Paybill endpoints for old transactions / fallback deployments; once Paystack is configured, the member payment-method endpoint prefers Paystack STK Push for Kenya.

## Go-live checks

1. Confirm Render shows `PAYSTACK_SECRET_KEY` is set; never share the secret key in chat or a browser screenshot.
2. Confirm the deployment is live and Paystack dashboard points to the backend webhook URL above.
3. Use a small, controlled live payment for a wallet deposit and separately for a plan purchase. Complete each M-PESA prompt.
4. Confirm transaction status becomes `SUCCESS`, the wallet is credited once for a deposit, and the selected plan is activated once for a plan purchase.
5. Confirm a pending/failed payment does not credit the wallet or activate a plan.

No real live payment was initiated as part of this source-code update; it requires the live secret key and deployed environment.
