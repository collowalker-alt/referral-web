import test from "node:test";
import assert from "node:assert/strict";
import { calculateCouponDiscount, isCouponUsable } from "../src/marketplace-coupons.js";

const activeCoupon = overrides => ({
  code: "SAVE10",
  active: true,
  percentOff: 10,
  amountOff: 0,
  minOrder: 100,
  expiresAt: null,
  usageLimit: null,
  usedCount: 0,
  ...overrides
});

test("percentage coupon discounts are rounded down to whole shillings", () => {
  assert.equal(calculateCouponDiscount(activeCoupon(), 999), 99);
});

test("fixed coupon discounts cannot exceed the subtotal", () => {
  assert.equal(calculateCouponDiscount(activeCoupon({ percentOff: 0, amountOff: 500 }), 120), 120);
});

test("percentage discount is bounded to 100 percent", () => {
  assert.equal(calculateCouponDiscount(activeCoupon({ percentOff: 150 }), 200), 200);
});

test("coupon validity checks active state, expiry, usage limit and minimum order", () => {
  const now = new Date("2026-10-23T12:00:00Z");
  assert.equal(isCouponUsable(activeCoupon(), 100, now), true);
  assert.equal(isCouponUsable(activeCoupon({ active: false }), 100, now), false);
  assert.equal(isCouponUsable(activeCoupon({ expiresAt: "2026-10-23T11:59:59Z" }), 100, now), false);
  assert.equal(isCouponUsable(activeCoupon({ usageLimit: 2, usedCount: 2 }), 100, now), false);
  assert.equal(isCouponUsable(activeCoupon(), 99, now), false);
});

test("coupon validity permits an unset usage limit and an exact minimum order", () => {
  assert.equal(isCouponUsable(activeCoupon({ usageLimit: null }), 100), true);
});
