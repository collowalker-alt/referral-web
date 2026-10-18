# NEXORA automatic M-PESA withdrawals via Paystack

This project connects the existing NEXORA withdrawal requests to the Paystack Transfers API for Kenyan M-PESA wallets. It does not change the NEXORA Connect bundle-order flow.

## What happens

- The member enters an amount and Kenyan M-PESA number. NEXORA atomically reserves the wallet amount and creates a unique withdrawal request.
- When automatic payouts are enabled and the request is within configured limits, NEXORA creates a Paystack mobile-money recipient (`MPESA`, `KES`) and initiates a transfer from Paystack balance. Otherwise, the request waits for an administrator to use **Pay via Paystack**.
- Every withdrawal uses one stable Paystack reference. Timeouts and non-final results remain pending, and retries use the same reference.
- NEXORA marks a payout `PAID` only after the signed `transfer.success` webhook or a verified final status. Confirmed failures restore the member's reserved amount; a later reversal is reconciled separately.
- Admins cannot manually mark a payout as paid. The **Check payout status** action queries Paystack, and **Continue / retry safely** reuses the same reference. Only a withdrawal still in `PENDING` can be cancelled locally; once a Paystack transfer may have been initiated, reconciliation must use Paystack's status.

## Render environment variables

Keep your existing `PAYSTACK_SECRET_KEY` (`sk_live_...`) private, on the server only. Add these on the NEXORA Render backend service:

- `PAYSTACK_TRANSFERS_ENABLED=true` — allows live payout initiation.
- `PAYSTACK_AUTO_WITHDRAWALS=false` — initial safe mode. Admins can test a small payout manually.
- `PAYSTACK_AUTO_WITHDRAWAL_MAX=5000` — maximum auto-start amount per request, in KSh.
- `PAYSTACK_AUTO_WITHDRAWAL_DAILY_LIMIT=10000` — maximum auto-start total per member in a rolling 24-hour period, in KSh.

After the first real payout has been confirmed to arrive at a phone you control, set `PAYSTACK_AUTO_WITHDRAWALS=true` and redeploy. Keep the limits conservative for the pilot. Requests over the auto limits remain reserved as pending for administrator review.

## Webhook

Configure this URL in Paystack's live dashboard:

`https://nexora-api-shxf.onrender.com/api/paystack/webhook`

Subscribe to `charge.success`, `transfer.success`, `transfer.failed`, and `transfer.reversed`. The code checks the HMAC-SHA512 signature before applying the events.

## Paystack dashboard prerequisites

1. Transfers must be available for the live business and the Paystack balance must cover both the payout and Paystack's fee.
2. If Paystack asks for OTP/approval, complete it through the Paystack dashboard and use **Check payout status** in NEXORA.
3. For fully unattended transfers, Paystack documents that the dashboard's **Confirm transfers before sending** preference needs to be unchecked. Only change this after a successful controlled payout and an explicit decision to allow automated sending.

## Limits and honest validation

This code supports Kenya M-PESA transfer initiation and reconciliation; it cannot enable transfers that Paystack has not approved for the account. It cannot make a transfer succeed if the Paystack balance is insufficient or the recipient number is invalid. A real payout and live webhook have not been run as part of packaging; complete the manual pilot before enabling auto mode.
