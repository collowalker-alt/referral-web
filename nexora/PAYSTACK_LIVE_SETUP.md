# NEXORA Paystack Live — Kenya setup

This integration uses Paystack's server-side Charge API for individual M-PESA STK Push payments. It applies only to **wallet deposits** and **membership plan purchases/upgrades**. NEXORA Connect bundle orders retain their existing separate payment flow.

## Render environment

Add this environment variable to the NEXORA backend service in Render:

- `PAYSTACK_SECRET_KEY` = the **live secret key** from the Paystack dashboard (`sk_live_…`).
- `PAYSTACK_TRANSFERS_ENABLED` = `true` to enable live payout requests from the NEXORA admin withdrawal screen.
- `PAYSTACK_AUTO_WITHDRAWALS` = `false` initially; change to `true` only after a controlled payout test succeeds. This starts eligible withdrawals automatically.
- `PAYSTACK_AUTO_WITHDRAWAL_MAX` = `5000` (default maximum automatic payout per request, in KSh).
- `PAYSTACK_AUTO_WITHDRAWAL_DAILY_LIMIT` = `10000` (default maximum automatic withdrawal amount per member over a rolling 24-hour period, in KSh). Requests exceeding these limits stay in review rather than being auto-sent.

Do not add this secret to the frontend, Vite variables, source code, Git, or a client-facing configuration file. This flow does not require the Paystack public key because the frontend never calls Paystack directly.

Keep the existing `JWT_SECRET`, `DATABASE_URL`, and other production environment variables. Redeploy/restart the backend after changing environment variables.

## Paystack webhook

Configure this webhook URL in the Paystack dashboard:

`https://nexora-api-shxf.onrender.com/api/paystack/webhook`

This is the webhook URL for the backend URL provided for NEXORA. Subscribe to `charge.success`, `transfer.success`, `transfer.failed`, and `transfer.reversed`. The endpoint checks Paystack's `x-paystack-signature` HMAC-SHA512 signature against the raw request body before processing events.

## What the application does

- Starts a KES Paystack M-PESA charge from the server using the member's selected Kenyan phone number.
- Stores a pending transaction and shows the member the amount, phone, and reference.
- Uses signed webhooks plus server-to-server verification/status checks to confirm payment.
- Handles a Paystack `/charge` timeout/HTTP 504 as an **unknown pending result**, not a failed payment. After waiting at least 10 seconds, NEXORA checks `GET /charge/:reference`, then falls back to transaction verification if needed. It never automatically repeats the POST charge request.
- Can recover older Paystack transactions that an earlier deployment incorrectly marked `FAILED` after an ambiguous timeout, but only after Paystack returns a successful charge with matching reference, amount and KES currency.
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


## Automatic M-PESA withdrawals

NEXORA sends payouts from the available **Paystack business balance**, not directly from a member's NEXORA wallet ledger. Keep enough available balance to cover withdrawals and Paystack fees.

1. In Render, first set `PAYSTACK_TRANSFERS_ENABLED=true` and `PAYSTACK_AUTO_WITHDRAWALS=false`, then redeploy. This enables the Admin → Withdrawals **Pay via Paystack** action without auto-paying member requests yet.
2. In Paystack, confirm that transfers are enabled for your live business and the live balance is sufficient. Paystack's transfer recipient type for an individual Kenyan M-PESA wallet is `mobile_money`, `bank_code` `MPESA`, and currency `KES`.
3. Initiate one small payout from Admin → Withdrawals to a phone you control. Confirm that the money actually arrives in M-PESA and NEXORA changes it to `PAID` only after the signed `transfer.success` event or server-side transfer verification.
4. If Paystack requires transfer approval/OTP, complete the approval in Paystack and then use **Check payout status** in NEXORA. Do not manually mark a transfer paid.
5. Only after the controlled payout succeeds, set `PAYSTACK_AUTO_WITHDRAWALS=true` in Render and redeploy. Eligible Kenyan withdrawals within the configured limits will then start automatically; larger or over-limit requests remain pending for admin review.
6. To run fully unattended, follow Paystack's live dashboard guidance for the **Confirm transfers before sending** preference. Disabling that confirmation permits automated sending, so only do this after testing and after accepting the operational risk.

NEXORA generates one stable Paystack transfer reference per withdrawal, verifies the amount/currency, handles signed transfer webhooks, prevents duplicate settlement, keeps uncertain transfer outcomes pending, and returns reserved funds only when a failure is confirmed. Paystack still controls its transfer processing and account eligibility; code changes cannot override account restrictions or fund an empty Paystack balance.
