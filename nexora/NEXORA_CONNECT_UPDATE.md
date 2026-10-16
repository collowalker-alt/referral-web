# NEXORA Connect — Kigen Internet Services

## What was added
- New member navigation area, `connect`, and dashboard / quick-action shortcuts.
- Data bundle catalogue divided into daily offers and repeat-purchase offers, plus minutes and SMS tabs.
- Recipient number input and choice between own number and another recipient.
- Payment instructions derived from the supplied Kigen Internet Services poster:
  - Own-number offer: M-PESA Buy Goods & Services Till `3032394`.
  - Offer for another number: Paybill `4576143`, with the recipient phone number as the account reference as shown on the poster.
- Kigen contact buttons from the poster: `0700 004 916` and `0107 763 940`; WhatsApp order message is prefixed to `0700 004 916`.
- Okoa Jahazi offer note, with confirmation that eligibility and availability must be verified with Kigen.
- Bundle amounts, volumes/minutes/SMS and validity are presented from the user-provided poster.

## Important integration boundary
This is a provider hand-off, not live bundle fulfilment. The project did not include Kigen's order API credentials, payment verification API, or Safaricom fulfilment integration. The WhatsApp button pre-fills an enquiry/order message; it does not mark an order paid and does not activate bundles. Payment must be confirmed through Kigen's own process. Do not claim automatic delivery or payment verification until a supported provider API and secure server-side callbacks are configured and tested.

## Verification still required
- Verify Kigen's offer amounts, validity rules, and availability before production release.
- Confirm both helpline numbers and whether `0700 004 916` is an approved WhatsApp contact.
- Test on desktop and mobile, including own-number and friend-number instructions.
- Test production build and the full app after dependencies are installed.
