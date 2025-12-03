import DodoPayments from 'dodopayments';

// Initialize Dodo Payments client
export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode', // 'test_mode' or 'live_mode'
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
});

// Product IDs from Dodo Dashboard
export const DODO_PRODUCTS = {
  basic: process.env.DODO_PRODUCT_BASIC,   // $29/month - pdt_qTXQ1k6smVMYRHg8KVGdW
  elite: process.env.DODO_PRODUCT_ELITE,   // $99/month - pdt_1BTS07WBCXHXvYiB1zLyT
  pro: process.env.DODO_PRODUCT_PRO,       // $149/month - pdt_TWTOIfMDzrojec58HbqxZ
};

// Map Dodo product IDs back to plan types
export function getPlanFromProductId(productId) {
  for (const [plan, id] of Object.entries(DODO_PRODUCTS)) {
    if (id === productId) return plan;
  }
  return null;
}
