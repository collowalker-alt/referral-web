// Pure, database-independent withdrawal fee calculations. Keep this module covered by tests.
export const MIN_WITHDRAWAL_KES = 100;
export const MIN_M_PESA_PAYOUT_KES = 10;
export const MAX_WITHDRAWAL_KES = 250000;
export const WITHDRAWAL_FEE_RATE = 0.05;

// Published Paystack Kenya M-PESA customer-wallet transfer charges. Verify
// against current provider pricing before changing these fee bands.
export const paystackMpesaTransferFeeForPayout = payout => {
  const n = Math.max(0, Math.round(Number(payout) || 0));
  if (n <= 1500) return 20;
  if (n <= 20000) return 40;
  return 60;
};

export const withdrawalFeeForAmount = amount =>
  Math.max(1, Math.ceil(Math.max(0, Number(amount) || 0) * WITHDRAWAL_FEE_RATE - 1e-9));

export const withdrawalBreakdownForTotal = total => {
  const walletDebit = Math.round(Math.max(0, Number(total) || 0));
  const fee = withdrawalFeeForAmount(walletDebit);
  const candidates = [20, 40, 60].map(paystackFee => ({
    requestedAmount: walletDebit,
    totalDebit: walletDebit,
    fee,
    paystackFee,
    payoutAmount: Math.max(0, walletDebit - fee - paystackFee),
  }));
  const exact = candidates.find(c =>
    c.payoutAmount >= MIN_M_PESA_PAYOUT_KES &&
    paystackMpesaTransferFeeForPayout(c.payoutAmount) === c.paystackFee
  );
  if (exact) return { ...exact, valid: true };
  return { requestedAmount: walletDebit, totalDebit: walletDebit, fee, paystackFee: null, payoutAmount: null, valid: false };
};

export const withdrawalTotalDebit = amount => Math.round(Math.max(0, Number(amount) || 0));
export const withdrawalUsesWalletTotalPolicy = withdrawal => /^WDNET-/i.test(String(withdrawal?.reference || ""));
export const withdrawalHasFeePolicy = withdrawal =>
  withdrawalUsesWalletTotalPolicy(withdrawal) || /^WD5A?-/i.test(String(withdrawal?.reference || ""));
export const withdrawalFeeForRecord = withdrawal =>
  withdrawalUsesWalletTotalPolicy(withdrawal)
    ? withdrawalFeeForAmount(withdrawal.amount)
    : (/^WD5A?-/i.test(String(withdrawal?.reference || "")) ? withdrawalFeeForAmount(withdrawal.amount) : 0);
export const withdrawalPaystackFeeForRecord = withdrawal =>
  withdrawalUsesWalletTotalPolicy(withdrawal) ? withdrawalBreakdownForTotal(withdrawal.amount).paystackFee : 0;
export const withdrawalPayoutForRecord = withdrawal =>
  withdrawalUsesWalletTotalPolicy(withdrawal)
    ? withdrawalBreakdownForTotal(withdrawal.amount).payoutAmount
    : Math.round(Math.max(0, Number(withdrawal?.amount) || 0));
export const withdrawalTotalDebitForRecord = withdrawal =>
  withdrawalUsesWalletTotalPolicy(withdrawal)
    ? Math.round(Math.max(0, Number(withdrawal?.amount) || 0))
    : Math.round(Math.max(0, Number(withdrawal?.amount) || 0)) + withdrawalFeeForRecord(withdrawal);
export const withdrawalPublicRecord = row => ({
  ...row,
  requestedAmount: withdrawalTotalDebitForRecord(row),
  payoutAmount: withdrawalPayoutForRecord(row),
  fee: withdrawalFeeForRecord(row),
  paystackFee: withdrawalPaystackFeeForRecord(row),
  totalDebit: withdrawalTotalDebitForRecord(row),
});
