# NEXORA Currency Display Audit Update

Updated the member-facing currency handling without changing the KES accounting base.

## Fixed
- Dashboard hidden wallet balance now uses the selected country's currency symbol instead of a hardcoded `KSh`.
- Dashboard **Deposit** action is now country-aware.
  - Kenya: existing Co-op Bank Paybill deposit flow remains unchanged.
  - All other supported countries: the deposit modal now shows **Payment methods coming soon** instead of a KSh/KES deposit amount form.
- Existing member-facing balance, plan, commission, transaction, receipt, marketplace and payment displays continue using the selected local currency formatter.

## Intentional KES references
- Admin balance correction and advertising configuration remain KES because NEXORA's internal accounting base is KES.
- Kenya's Co-op Paybill instructions remain KSh/KES because that payment method is Kenya-only.
- Currency-rate API continues to use KES as the conversion base.
