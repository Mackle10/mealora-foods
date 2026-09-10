export type SmsResult = { sent: boolean; providerReference?: string; errorMessage?: string };

export function isSmsConfigured(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.SMS_API_URL && env.SMS_API_KEY);
}

export function getOrderNotificationEvent(input: { previousPaymentStatus: string; nextPaymentStatus: string; previousStatus: string; nextStatus: string }) {
  if (input.previousPaymentStatus === "initiated" && input.nextPaymentStatus === "paid") return "paid" as const;
  if (input.previousStatus !== "delivered" && input.nextStatus === "delivered") return "delivered" as const;
  return null;
}

export async function sendSms(input: { to: string; message: string }): Promise<SmsResult> {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID ?? "MEALORA";
  if (!isSmsConfigured() || !apiUrl || !apiKey) return { sent: false, errorMessage: "SMS provider is not configured" };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ to: input.to, from: senderId, message: input.message }),
    });
    if (!response.ok) return { sent: false, errorMessage: `SMS provider returned ${response.status}` };
    const payload = await response.json().catch(() => ({})) as { id?: string; messageId?: string; reference?: string };
    return { sent: true, providerReference: payload.id ?? payload.messageId ?? payload.reference };
  } catch (error) {
    return { sent: false, errorMessage: error instanceof Error ? error.message : "SMS provider request failed" };
  }
}
