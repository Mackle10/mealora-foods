export function isStripeConfigured(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.STRIPE_SECRET_KEY && env.VITE_STRIPE_PUBLISHABLE_KEY && env.STRIPE_WEBHOOK_SECRET);
}

export function isMobileMoneyPayment(method: string) {
  return method === "mtn_momo" || method === "airtel_money";
}
