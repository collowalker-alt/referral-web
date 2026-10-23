export function isCouponUsable(coupon, subtotal, now = new Date()) {
  const amount = Math.max(0, Math.floor(Number(subtotal) || 0));
  if (!coupon || coupon.active !== true) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= now.getTime()) return false;
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) return false;
  if (amount < Math.max(0, Number(coupon.minOrder) || 0)) return false;
  return true;
}

export function calculateCouponDiscount(coupon, subtotal) {
  const amount = Math.max(0, Math.floor(Number(subtotal) || 0));
  if (!coupon) return 0;
  const percent = Math.max(0, Math.min(100, Math.floor(Number(coupon.percentOff) || 0)));
  const fixed = Math.max(0, Math.floor(Number(coupon.amountOff) || 0));
  const discount = percent > 0 ? Math.floor(amount * percent / 100) : Math.min(fixed, amount);
  return Math.max(0, Math.min(amount, discount));
}
