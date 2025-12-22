/**
 * Plan Configuration
 * 
 * This file defines the feature limits and capabilities for each subscription tier.
 * Used throughout the application to enforce plan-based restrictions.
 * 
 * Plans: free, basic ($29/mo), elite ($99/mo), pro ($149/mo)
 */

export const PLAN_CONFIG = {
  free: {
    dailyLeads: 1,
    weeklyLeads: 7,
    statesAllowed: 1,
    marketplacePurchasesPerMonth: 0,
    hotLeadDelayMinutes: null, // No access
    warmLeadDelayMinutes: null, // No access
    support: 'email',
    analyticsEnabled: false,
    analyticsDays: 0,
    analyticsExport: false,
  },
  basic: {
    dailyLeads: 5,
    weeklyLeads: 35,
    statesAllowed: 3,
    marketplacePurchasesPerMonth: 5,
    hotLeadDelayMinutes: 240, // 4 hours
    warmLeadDelayMinutes: 60, // 1 hour
    support: 'priority',
    analyticsEnabled: true,
    analyticsDays: 7,
    analyticsExport: false,
  },
  elite: {
    dailyLeads: 10,
    weeklyLeads: 70,
    statesAllowed: 5,
    marketplacePurchasesPerMonth: 15,
    hotLeadDelayMinutes: 30, // 30 minutes
    warmLeadDelayMinutes: 15, // 15 minutes
    support: 'premium',
    analyticsEnabled: true,
    analyticsDays: 30,
    analyticsExport: false,
  },
  pro: {
    dailyLeads: 20,
    weeklyLeads: 140,
    statesAllowed: 7,
    marketplacePurchasesPerMonth: -1, // Unlimited
    hotLeadDelayMinutes: 0, // Instant
    warmLeadDelayMinutes: 0, // Instant
    support: 'vip',
    analyticsEnabled: true,
    analyticsDays: 90,
    analyticsExport: true,
  },
};

// Get plan config by plan type
export function getPlanConfig(planType) {
  return PLAN_CONFIG[planType] || PLAN_CONFIG.free;
}

// Check if user can purchase from marketplace this month
export function canPurchaseFromMarketplace(planType, purchasesThisMonth) {
  const config = getPlanConfig(planType);
  if (config.marketplacePurchasesPerMonth === -1) return true; // Unlimited
  if (config.marketplacePurchasesPerMonth === 0) return false; // No access
  return purchasesThisMonth < config.marketplacePurchasesPerMonth;
}

// Get notification delay in minutes for a lead temperature
export function getNotificationDelay(planType, temperature) {
  const config = getPlanConfig(planType);
  if (temperature === 'hot') {
    return config.hotLeadDelayMinutes;
  }
  return config.warmLeadDelayMinutes;
}

// Check if user has marketplace access
export function hasMarketplaceAccess(planType) {
  const config = getPlanConfig(planType);
  return config.marketplacePurchasesPerMonth !== 0;
}
