# NEXORA automatic M-PESA withdrawals through Paystack

New eligible withdrawal requests are sent to Paystack directly from the member request endpoint. There is **no admin approval step**. Administrators receive an in-app/push notification when Paystack confirms success, failure, reversal, abandonment, blocking, or rejection. If Paystack says the transfer is waiting for OTP/approval, NEXORA sends an alert that the provider configuration needs attention; it never marks a payout paid without confirmation.

## Member withdrawal rules

- Kenya M-PESA accounts only; payout amount minimum KSh 10.
- A 5% withdrawal fee is rounded up to the next whole KSh (minimum KSh 1). The payout amount is sent to M-PESA and the fee is separately charged to the NEXORA wallet.
- The wallet must cover payout plus fee. NEXORA atomically reserves that full amount before contacting Paystack.
- The request must be under the package limit, the configured per-request automatic limit, and the rolling 24-hour member limit. A request outside these limits is rejected before reservation; it is never left waiting for an administrator to approve it.
- If automatic transfers are not configured or Paystack live transfers are unavailable, NEXORA rejects the new request before reserving funds.

## Render backend environment variables

Set the following on the NEXORA backend service. Keep `PAYSTACK_SECRET_KEY` (`sk_live_...`) server-side only.

- `PAYSTACK_SECRET_KEY` = your live secret key.
- `PAYSTACK_TRANSFERS_ENABLED=true`
- `PAYSTACK_AUTO_WITHDRAWALS=true`
- `PAYSTACK_AUTO_WITHDRAWAL_MAX=5000` (maximum payout amount per request in KSh).
- `PAYSTACK_AUTO_WITHDRAWAL_DAILY_LIMIT=10000` (maximum total payout amount for one member in a rolling 24-hour period in KSh).

Those limits are risk guardrails, not approval queues. Change them deliberately in Render if you want different limits. Restart/redeploy after changing environment variables. If `PAYSTACK_AUTO_WITHDRAWALS` is still explicitly set to `false` in Render, new requests will be rejected without reserving money instead of falling back to admin approval.

## Paystack live setup

1. Confirm live transfers are enabled on your Paystack business and the Paystack balance can cover payout amounts and provider fees.
2. In Paystack Transfers settings, disable **Confirm transfers before sending** (or the equivalent per-transfer approval preference) so Paystack can send transfers without asking an admin to approve each payout. This setting is controlled by Paystack and cannot be bypassed by NEXORA.
3. Configure the webhook URL below, with `charge.success`, `transfer.success`, `transfer.failed`, and `transfer.reversed` subscribed.
4. Test a small payout to an M-PESA number you control. Confirm it arrives and NEXORA records the final result.

Webhook URL: `https://nexora-api-shxf.onrender.com/api/paystack/webhook`

The webhook verifies Paystack's `x-paystack-signature` HMAC-SHA512 signature against the raw request body before applying events. Transfer events are reconciled only against the expected NEXORA transfer reference, KES currency, and payout amount.

## Status and wallet safety

- NEXORA uses one stable Paystack transfer reference per withdrawal. Ambiguous timeouts remain `PROCESSING`; the system never creates a new withdrawal to retry an uncertain result. New automatic requests use `WD5A-` references so a deployment restart before the first provider call can safely resume only new auto-payout requests; older legacy `PENDING` requests are not silently released.
- The member is notified when Paystack confirms success, failure, reversal, abandonment, blocking, or rejection. Administrators receive the same final status notification with member, payout amount, fee, total wallet debit, phone, and reference. A background reconciliation worker rechecks processing records about once per minute and reuses the same reference when the provider has not recorded the transfer yet.
- Success moves the reserved payout-plus-fee out of pending balance and updates `totalWithdrawn`. Confirmed failure returns the full reserve once. Reversal restores the reserve and reverses the withdrawn total.
- Admin tools are status/reconciliation only; the admin UI has no payout-approval action, and an old compatibility endpoint cannot initiate a pending request.
- If Paystack returns OTP/approval-required, the payout remains processing and admins are alerted to fix the provider's transfer-approval setting. NEXORA will not fake a success state.

No real live transfer was executed during code packaging. Do one controlled live test before promoting this flow to members.
