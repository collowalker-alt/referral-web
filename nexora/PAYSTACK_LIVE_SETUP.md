# NEXORA Paystack Live — Kenya setup

This integration uses Paystack's server-side Charge API for individual M-PESA STK Push payments. It applies only to **wallet deposits** and **membership plan purchases/upgrades**. NEXORA Connect bundle orders retain their existing separate payment flow.

## Render environment

Add this environment variable to the NEXORA backend service in Render:

- `PAYSTACK_SECRET_KEY` = the **live secret key** from the Paystack dashboard (`sk_live_…`).
- `PAYSTACK_TRANSFERS_ENABLED` = `true` to enable live outbound transfers.
- `PAYSTACK_AUTO_WITHDRAWALS` = `true` to automatically send every accepted member withdrawal request to Paystack without admin approval. If it is `false`, new withdrawals are rejected before wallet funds are reserved; they are not queued for manual approval.
- `PAYSTACK_AUTO_WITHDRAWAL_MAX` = `5000` (maximum total wallet deduction per request in KSh). Requests above this limit are rejected before reservation, not sent to an admin review queue.
- `PAYSTACK_AUTO_WITHDRAWAL_DAILY_LIMIT` = `10000` (maximum total wallet deductions per member over a rolling 24-hour period in KSh). Requests above this limit are rejected before reservation, not queued for admin review.

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

New member withdrawals go directly to Paystack when submitted; there is no admin approval step. Administrators are notified when Paystack confirms whether the transfer succeeded, failed, or was reversed. NEXORA sends a separate configuration alert if Paystack requires per-transfer OTP/approval.

1. In Render, set `PAYSTACK_TRANSFERS_ENABLED=true` and `PAYSTACK_AUTO_WITHDRAWALS=true`. Set the per-request and rolling 24-hour limits to values you intend to allow. Redeploy the backend after saving the variables.
2. In Paystack, confirm outbound transfers are enabled for the live business and the Paystack balance covers the payout amounts plus Paystack fees.
3. In Paystack Transfers settings, disable **Confirm transfers before sending** (or the corresponding manual approval setting) so Paystack can send transfers unattended. NEXORA cannot override a provider-side approval requirement.
4. Configure the webhook URL: `https://nexora-api-shxf.onrender.com/api/paystack/webhook`. Subscribe to `charge.success`, `transfer.success`, `transfer.failed`, and `transfer.reversed`.
5. Test a small live payout to an M-PESA number you control. Confirm that money arrives and NEXORA only marks it paid after the signed `transfer.success` event or server-side verification.

NEXORA uses one stable provider reference for each withdrawal and protects wallet settlement against duplicate webhook delivery. Timeouts stay pending until the outcome can be verified. Requests outside the configured per-request, package, or rolling 24-hour limits are rejected before wallet funds are reserved; they do not wait for admin review.

## Withdrawal amount and fee policy

- Minimum amount entered: **KSh 100 total wallet deduction**.
- The amount entered is the full debit from the member's NEXORA wallet, not the amount received in M-PESA.
- NEXORA fee: **5% of the entered total**, rounded up to the next whole KSh (minimum KSh 1).
- The applicable Paystack M-PESA customer-wallet fee is also deducted from the entered total: current published pricing is KSh 20 for payout amounts up to KSh 1,500; KSh 40 from KSh 1,501 to KSh 20,000; and KSh 60 above KSh 20,000. Verify the current fee schedule with Paystack before enabling the feature for all members.
- Net M-PESA payout = total entered − NEXORA fee − Paystack fee. KSh 100 → KSh 5 + KSh 20 fees → KSh 75 payout. KSh 5,000 → KSh 250 + KSh 40 fees → **KSh 4,710 payout**.
- New requests use `WDNET-` references and store the total debit; older pending withdrawal records continue to use their original calculation. No database schema migration is required.
