import { describe, expect, it } from "vitest";
import { getOrderNotificationEvent, isSmsConfigured, sendSms } from "./sms";

describe("SMS notifications", () => {
  it("requires an API URL and API key", () => {
    expect(isSmsConfigured({})).toBe(false);
    expect(isSmsConfigured({ SMS_API_URL: "https://sms.example.test", SMS_API_KEY: "secret" })).toBe(true);
  });

  it("fails safely when the provider is not configured", async () => {
    const originalUrl = process.env.SMS_API_URL;
    const originalKey = process.env.SMS_API_KEY;
    delete process.env.SMS_API_URL;
    delete process.env.SMS_API_KEY;
    await expect(sendSms({ to: "+256700000000", message: "test" })).resolves.toMatchObject({ sent: false, errorMessage: "SMS provider is not configured" });
    if (originalUrl) process.env.SMS_API_URL = originalUrl;
    if (originalKey) process.env.SMS_API_KEY = originalKey;
  });

  it("only emits alerts for payment confirmation and delivery completion", () => {
    expect(getOrderNotificationEvent({ previousPaymentStatus: "initiated", nextPaymentStatus: "paid", previousStatus: "placed", nextStatus: "placed" })).toBe("paid");
    expect(getOrderNotificationEvent({ previousPaymentStatus: "paid", nextPaymentStatus: "paid", previousStatus: "on_the_way", nextStatus: "delivered" })).toBe("delivered");
    expect(getOrderNotificationEvent({ previousPaymentStatus: "pending", nextPaymentStatus: "pending", previousStatus: "placed", nextStatus: "preparing" })).toBeNull();
  });
});
