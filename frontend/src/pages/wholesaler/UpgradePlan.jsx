import { useState } from 'react';
import Layout from '../../components/Layout';
import useAuthStore from '../../store/authStore';
import { userAPI } from '../../lib/api';
import { CheckCircle, TrendingUp } from 'lucide-react';
import SuccessModal from '../../components/SuccessModal';

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      leads: '1 lead/week',
      features: ['1 lead every Monday', 'Basic support', 'Lead tracking'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      leads: '1 lead/day',
      features: ['Daily lead delivery', 'Priority support', 'Advanced tracking', 'Email notifications'],
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$99',
      leads: '5 leads/day',
      features: ['5 daily leads', 'Premium support', 'Advanced analytics', 'Priority distribution'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$149',
      leads: '10 leads/day',
      features: ['10 daily leads', 'VIP support', 'Custom analytics', 'First in line'],
    },
  ];

  const handleUpgrade = async (planId) => {
    if (!confirm(`Change your plan to ${planId.toUpperCase()}? (MVP - no payment required)`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const planResponse = await userAPI.updatePlan(planId);
      const { oldPlan, newPlan } = planResponse.data;
      
      // Update local state immediately with fresh user data from server
      setUser(planResponse.data.user);
      
      // Check if this is an upgrade
      const planHierarchy = { free: 0, basic: 1, elite: 2, pro: 3 };
      const isUpgrade = planHierarchy[newPlan] > planHierarchy[oldPlan];
      
      if (isUpgrade) {
        // Distribute leads
        try {
          const leadsResponse = await userAPI.distributeLeads();
          const leadsAssigned = leadsResponse.data.leadsAssigned || 0;
          
          // Show success modal with lead count
          setSuccessModal({
            title: 'Plan Upgraded!',
            message: `${leadsAssigned} new leads have been added to your account.`,
            actionText: 'View My Leads',
            actionLink: '/leads',
            secondaryText: 'Stay here'
          });
        } catch (leadError) {
          console.error('[PLAN CHANGE] Lead distribution failed:', leadError);
          // Lead distribution failed, but plan already changed
          setSuccessModal({
            title: 'Plan Upgraded!',
            message: `Your plan is now ${newPlan.toUpperCase()}. Leads will be distributed shortly.`,
            actionText: 'Got it!',
            secondaryText: null
          });
        }
      } else {
        // Not an upgrade (same plan or downgrade)
        setSuccessModal({
          title: 'Plan Changed',
          message: `Your plan is now ${newPlan.toUpperCase()}.`,
          actionText: 'Got it!',
          secondaryText: null
        });
      }
      
    } catch (error) {
      console.error('[PLAN CHANGE] Failed to change plan:', error);
      setSuccessModal({
        title: 'Error',
        message: 'Failed to change plan. Please try again.',
        actionText: 'Close',
        secondaryText: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Current Plan: <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase">{user?.plan_type}</span>
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">MVP Notice</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                This is MVP mode - you can change plans instantly without payment. Payment integration coming soon!
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = user?.plan_type === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 p-6 ${
                  plan.popular ? 'ring-4 ring-blue-600 relative' : ''
                } ${isCurrentPlan ? 'ring-4 ring-green-600' : ''}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{plan.price}</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">{plan.leads}</div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isCurrentPlan
                      ? 'bg-green-600 text-white'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {loading ? 'Changing...' : isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Feature</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-white">Free</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-white">Basic</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-white">Elite</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-white">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Leads per week</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">1</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">7</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">35</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">70</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Lead tracking</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">✓</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">✓</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">✓</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">✓</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Support</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Basic</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Priority</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Premium</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">VIP</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Analytics</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Basic</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Advanced</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Advanced</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <SuccessModal
          title={successModal.title}
          message={successModal.message}
          actionText={successModal.actionText}
          actionLink={successModal.actionLink}
          secondaryText={successModal.secondaryText}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </Layout>
  );
}
