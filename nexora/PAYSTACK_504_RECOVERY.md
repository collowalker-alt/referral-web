# Paystack `/charge` 504 recovery

This patch addresses a production issue where Paystack's `POST /charge` request returned HTTP 504. A 504 is an ambiguous outcome: it does not prove that Paystack failed to create the M-PESA charge, so NEXORA must not mark the transaction conclusively failed or send another charge automatically.

## What changed

- HTTP 504, other upstream 5xx responses, rate limiting, request timeouts, and network errors leave the payment pending/unknown.
- The member sees an instruction not to start another payment until NEXORA checks the original reference.
- After at least 10 seconds, status checks first request Paystack `GET /charge/:reference` and use transaction verification as a fallback.
- If Paystack confirms success, NEXORA checks the reference, KES currency and exact amount before crediting the wallet or activating the plan.
- Payment fulfillment remains idempotent. It can recover a prior Paystack transaction incorrectly marked FAILED by the older timeout handling, but only after a successful Paystack response is verified.
- The Orders & Transactions screen now offers **Check payment** for pending or previously failed Paystack deposits and plan purchases. That action checks the existing reference; it does not send a new STK Push.
- NEXORA Connect bundle ordering and payment handling remain unchanged.

## Recover the transaction from the reported log

Reference from the reported Render log:

`NX-PS-DEP-1792256634987-0D91D25F`

1. Deploy this project update to the same NEXORA backend and frontend services.
2. Sign in to the member account that initiated the deposit and open **Orders & Transactions**.
3. Find the deposit reference above and click **Check payment**. If a result is not yet available, wait and check again; do not immediately create a second deposit for the same amount.
4. If Paystack reports a successful charge with the expected amount in KES, NEXORA will credit the wallet once. If Paystack returns a confirmed failure, NEXORA will show it as failed. If Paystack still cannot confirm the result, it remains pending and must be reconciled rather than blindly retried.

## Paystack documentation

Paystack's Charge API says to wait at least 10 seconds after a pending charge or exception before checking `GET /charge/:reference`. The M-PESA documentation also recommends transaction verification for asynchronous payments and requires webhooks for successful charge events.

- https://paystack.com/docs/api/charge/
- https://paystack.com/docs/payments/payment-channels/
- https://paystack.com/docs/payments/verify-payments/
