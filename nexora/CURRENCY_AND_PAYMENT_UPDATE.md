# NEXORA Currency & Payment Update

## What changed
- NEXORA keeps its internal accounting amounts in KES so existing Kenya transactions, commissions, balances and payment records remain consistent.
- Logged-in members now see monetary amounts converted to the currency associated with their stored country.
- Exchange rates are refreshed from the NEXORA API endpoint `/api/currency/rates?base=KES` and cached server-side for one hour.
- A safe fallback rate table is used if the live rate service is unavailable.
- Country currencies include KES, GHS, XOF, NGN, ZAR, EGP, RWF, TZS, UGX, ZMW, BWP, MZN, ZWG, XAF, ETB, MAD, TND and MUR.
- Marketplace prices are displayed in the member's local currency. When a member creates a listing, the entered local price is converted back to NEXORA's KES accounting base before being sent to the server.
- Marketplace local price filters are converted back to KES before filtering the stored product prices.
- Plan prices, commissions, wallet balances, transaction amounts and payment/receipt displays use the member's local currency in the member console.
- Admin console accounting remains in KES to avoid changing financial records or confusing administrative reconciliation.

## Payment rule
- Kenya (`KE`) is the only currently enabled payment country and continues to use Co-op Bank Paybill.
- Every other country now shows `Payment methods coming soon` in the plan-payment modal.
- Non-Kenya wallet deposits, withdrawals and plan purchases remain blocked server-side until a local payment provider is actually configured.
- This is intentionally separate from currency conversion: displaying an amount in local currency does not mean a payment channel is available.

## Important deployment note
The live exchange-rate endpoint uses an external public rate source from the server and falls back safely if it is unavailable. For production accounting, payment amounts and database records remain KES until a country-specific payment integration is activated.

No existing transaction balances are converted in the database by this update.
