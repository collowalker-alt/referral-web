# NEXORA withdrawal amount and fees — current policy

The amount entered in the withdrawal form is the **total debit from the member's NEXORA wallet**, not the M-PESA payout. The minimum entered amount is KSh 100.

For each accepted new request:

1. NEXORA fee = 5% of the entered total, rounded up to a whole KSh (minimum KSh 1).
2. Paystack M-PESA wallet transfer fee is calculated from the **net amount being sent** using Paystack's currently published Kenya B2C fee bands: KSh 20 for KSh 1–1,500; KSh 40 for KSh 1,501–20,000; KSh 60 above KSh 20,000 (up to the provider limit). Confirm the current tariff with Paystack before changing it.
3. Net M-PESA payout = total entered − NEXORA fee − Paystack fee.

Examples:

| Wallet amount entered | NEXORA 5% fee | Paystack fee | Sent to M-PESA |
|---:|---:|---:|---:|
| KSh 100 | KSh 5 | KSh 20 | **KSh 75** |
| KSh 5,000 | KSh 250 | KSh 40 | **KSh 4,710** |

The UI previews this before submission. The backend independently calculates and validates the same breakdown, reserves only the total entered amount, sends the net payout, and only records success after Paystack confirms the transfer. No database schema migration is required.

Because Paystack charges jump at exact transfer amount thresholds, a small set of entered amounts have no exact fee/payout split under this strict policy. These are rejected before reservation with an instruction to adjust the amount slightly. This avoids overcharging or misrepresenting the provider fee.

New requests use `WDNET-` references, which distinguish the total-debit policy from older pending and historical withdrawal records. Existing records retain their original calculation when reconciled.
