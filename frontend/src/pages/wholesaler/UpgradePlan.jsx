import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import useAuthStore from '../../store/authStore';
import { userAPI, stripeAPI } from '../../lib/api';
import { CheckCircle, TrendingUp, CreditCard } from 'lucide-react';
import SuccessModal from '../../components/SuccessModal';

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');

    if (success === 'true' && plan) {
      // Refresh user data to get updated plan
      refreshUser?.();
      setSuccessModal({
        title: 'Payment Successful!',
        message: `Your plan has been upgraded to ${plan.toUpperCase()}. New leads will be distributed shortly.`,
        actionText: 'View My Leads',
        actionLink: '/leads',
        secondaryText: 'Stay here'
      });
      // Clear URL params
      setSearchParams({});
    } else if (canceled === 'true') {
      setSuccessModal({
        title: 'Payment Canceled',
        message: 'Your payment was canceled. You can try again anytime.',
        actionText: 'Close',
        secondaryText: null
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, refreshUser]);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      leads: '1 lead/week',
      features: ['1 lead every Monday', 'Custom analytics', 'Notes', 'Follow up countdown'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      leads: '1 lead/day',
      features: ['1 lead delivered daily', 'Priority lead distribution', 'Custom analytics', 'Notes', 'Follow up countdown', 'Access to hot lead marketplace', 'Support tab'],
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$99',
      leads: '5 leads/day',
      features: ['5 leads delivered daily', 'Priority lead distribution', 'Custom analytics', 'Notes', 'Follow up countdown', 'Access to hot lead marketplace', 'Support tab'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$149',
      leads: '10 leads/day',
      features: ['10 leads delivered daily', 'Priority lead distribution', 'Custom analytics', 'Notes', 'Follow up countdown', 'Access to hot lead marketplace', 'Support tab'],
    },
  ];

  const handleUpgrade = async (planId) => {
    // For paid plans, redirect to Stripe checkout
    if (planId !== 'free') {
      setLoading(true);
      try {
        const response = await stripeAPI.createCheckout(planId);
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } catch (error) {
        console.error('[STRIPE] Checkout error:', error);
        setSuccessModal({
          title: 'Error',
          message: error.response?.data?.error || 'Failed to start checkout. Please try again.',
          actionText: 'Close',
          secondaryText: null
        });
        setLoading(false);
      }
      return;
    }

    // For free plan, use direct update (downgrade)
    if (!confirm('Downgrade to Free plan? You will lose your current subscription benefits.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const planResponse = await userAPI.updatePlan(planId);
      setUser(planResponse.data.user);
      
      setSuccessModal({
        title: 'Plan Changed',
        message: 'Your plan is now FREE. You will receive 1 lead per week on Mondays.',
        actionText: 'Got it!',
        secondaryText: null
      });
      
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

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">Secure Payment</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Payments are processed securely through Stripe. Your subscription will be billed monthly.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {plans.map((plan) => {
            const isCurrentPlan = user?.plan_type === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 p-6 relative flex flex-col ${
                  plan.popular && !isCurrentPlan ? 'ring-4 ring-blue-600' : ''
                } ${isCurrentPlan ? 'ring-4 ring-green-600' : ''}`}
              >
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Current Plan
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{plan.price}</div>
                <div className="text-gray-600 dark:text-gray-400 mb-6">{plan.leads}</div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 mt-auto ${
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
