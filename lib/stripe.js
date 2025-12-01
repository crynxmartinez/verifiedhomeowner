import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs from Stripe Dashboard - YOU MUST CREATE THESE IN STRIPE
// Go to Stripe Dashboard > Products > Create Product for each plan
// Then copy the Price ID (starts with price_)
export const STRIPE_PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC,   // $29/month
  elite: process.env.STRIPE_PRICE_ELITE,   // $99/month
  pro: process.env.STRIPE_PRICE_PRO,       // $149/month
};

// Map Stripe price IDs back to plan types
export function getPlanFromPriceId(priceId) {
  for (const [plan, id] of Object.entries(STRIPE_PRICES)) {
    if (id === priceId) return plan;
  }
  return null;
}
