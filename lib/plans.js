// Plan configurations
export const PLAN_CONFIGS = {
  free: {
    name: 'Free',
    price: 0,
    leadsPerWeek: 1, // 1 lead per week on Mondays
    leadsPerDay: 0,
  },
  basic: {
    name: 'Basic',
    price: 29,
    leadsPerDay: 1,
  },
  elite: {
    name: 'Elite',
    price: 99,
    leadsPerDay: 5,
  },
  pro: {
    name: 'Pro',
    price: 149,
    leadsPerDay: 10,
  },
};

export function getLeadsForPlan(planType) {
  return PLAN_CONFIGS[planType] || PLAN_CONFIGS.free;
}
