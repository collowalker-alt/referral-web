import test from "node:test";
import assert from "node:assert/strict";
import {
  MIN_WITHDRAWAL_KES,
  withdrawalFeeForAmount,
  withdrawalBreakdownForTotal,
  paystackMpesaTransferFeeForPayout,
  withdrawalPublicRecord
} from "../src/withdrawal-fees.js";

test("withdrawal minimum and NEXORA fee are whole-shilling values", () => {
  assert.equal(MIN_WITHDRAWAL_KES, 100);
  assert.equal(withdrawalFeeForAmount(100), 5);
  assert.equal(withdrawalFeeForAmount(101), 6);
  assert.equal(withdrawalFeeForAmount(0), 1);
});

test("Paystack transfer fee bands cover exact boundaries", () => {
  assert.equal(paystackMpesaTransferFeeForPayout(1500), 20);
  assert.equal(paystackMpesaTransferFeeForPayout(1501), 40);
  assert.equal(paystackMpesaTransferFeeForPayout(20000), 40);
  assert.equal(paystackMpesaTransferFeeForPayout(20001), 60);
});

test("KSh 100 total wallet debit discloses fees and payout consistently", () => {
  const result = withdrawalBreakdownForTotal(100);
  assert.equal(result.valid, true);
  assert.equal(result.totalDebit, 100);
  assert.equal(result.fee, 5);
  assert.equal(result.paystackFee, 20);
  assert.equal(result.payoutAmount, 75);
});

test("fee-band edge cases never return a self-contradictory payout split", () => {
  const result = withdrawalBreakdownForTotal(1602);
  assert.equal(result.valid, false);
  assert.equal(result.paystackFee, null);
  assert.equal(result.payoutAmount, null);
});

test("legacy and wallet-total withdrawal records preserve their respective policies", () => {
  const walletTotal = withdrawalPublicRecord({ reference: "WDNET-100", amount: 100 });
  assert.equal(walletTotal.totalDebit, 100);
  assert.equal(walletTotal.payoutAmount, 75);
  assert.equal(walletTotal.fee, 5);
  assert.equal(walletTotal.paystackFee, 20);

  const legacy = withdrawalPublicRecord({ reference: "WD-100", amount: 100 });
  assert.equal(legacy.totalDebit, 100);
  assert.equal(legacy.payoutAmount, 100);
  assert.equal(legacy.fee, 0);
  assert.equal(legacy.paystackFee, 0);
});
