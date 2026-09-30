# NEXORA Africa Country & Payment Readiness

## What changed

- Added an Africa country selector to the public authentication modal for both **Log in** and **Create account**.
- Kenya remains the active payment country and keeps the existing **Co-op Bank M-Pesa Paybill** flow unchanged.
- Ghana and Côte d’Ivoire are identified as Paystack Mobile Money markets, but NEXORA currently shows **Payment methods coming soon** because Paystack is not yet activated for NEXORA.
- Other selected African countries can create accounts, but payment, wallet deposit, and withdrawal actions are shown as coming soon until local payment processing is enabled.
- Non-Kenya registration accepts a broader mobile-number format; Kenya keeps the existing strict `07/01/2547/2541` validation.
- Country selection is stored in the browser as `nexora-country`, so it persists when the member returns to NEXORA on the same browser.
- Added a reusable payment-coming-soon modal and matching wallet states.

## Paystack note

Paystack's current documentation distinguishes Kenya M-PESA mobile-number prompting from Mobile Money in Ghana and Côte d'Ivoire. Do not label the Ghana/Côte d'Ivoire flow as Kenya-style M-PESA STK until the actual Paystack integration is implemented.

## Deployment

This ZIP's existing root build script expects `server/package.json`, but the supplied ZIP does not contain that file. The application source was therefore not restructured around a new server package. The server source passes Node syntax validation.
