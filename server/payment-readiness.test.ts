import { describe, expect, it } from "vitest";
import { isMobileMoneyPayment, isStripeConfigured } from "./payment-readiness";

describe("Stripe readiness", () => {
  it("requires all server, client, and webhook secrets", () => {
    expect(isStripeConfigured({ STRIPE_SECRET_KEY: "sk_test_x", VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_x" })).toBe(false);
    expect(isStripeConfigured({ STRIPE_SECRET_KEY: "sk_test_x", VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x" })).toBe(true);
  });

  it("recognizes Uganda Mobile Money methods", () => {
    expect(isMobileMoneyPayment("mtn_momo")).toBe(true);
    expect(isMobileMoneyPayment("airtel_money")).toBe(true);
    expect(isMobileMoneyPayment("cash_on_delivery")).toBe(false);
  });
});
