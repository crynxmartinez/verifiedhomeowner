import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import useAuthStore from '../../store/authStore';
import { userAPI, dodoAPI, authAPI } from '../../lib/api';
import { CheckCircle, TrendingUp, CreditCard, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import SuccessModal from '../../components/SuccessModal';
import TrialOfferModal from '../../components/TrialOfferModal';

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [loading, setLoading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [trialModal, setTrialModal] = useState(null); // { plan: 'basic' | 'elite' | 'pro' }
  const [canUseTrial, setCanUseTrial] = useState(false);
  const [checkingTrial, setCheckingTrial] = useState(true);

  // Check if email is verified
  const isEmailVerified = user?.email_verified;

  // Handle resend verification email
  const handleResendVerification = async () => {
    setSendingVerification(true);
    try {
      await authAPI.sendVerification();
      setSuccessModal({
        title: 'Verification Email Sent',
        message: `We've sent a verification link to ${user?.email}. Please check your inbox.`,
        actionText: 'Got it!',
        secondaryText: null
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send verification email';
      setSuccessModal({
        title: 'Error',
        message: errorMsg,
        actionText: 'Close',
        secondaryText: null
      });
    } finally {
      setSendingVerification(false);
    }
  };

  // Refresh user data and check trial status on page load
  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
    
    // Check if user can use trial
    const checkTrialStatus = async () => {
      try {
        const response = await userAPI.getTrialStatus();
        setCanUseTrial(response.data.canUseTrial);
      } catch (error) {
        console.error('Failed to check trial status:', error);
        setCanUseTrial(false);
      } finally {
        setCheckingTrial(false);
      }
    };
    checkTrialStatus();
  }, []);

  // Handle Dodo checkout redirect
  useEffect(() => {
    const checkout = searchParams.get('checkout');

    if (checkout === 'success') {
      // Refresh user data to get updated plan
      refreshUser?.();
      setSuccessModal({
        title: 'Payment Successful!',
        message: 'Your plan has been upgraded. New leads will be distributed shortly.',
        actionText: 'View My Leads',
        actionLink: '/leads',
        secondaryText: 'Stay here'
      });
      // Clear URL params
      setSearchParams({});
    } else if (checkout === 'canceled') {
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
      features: ['1 lead every Monday', '1 state coverage', 'Lead tracking', 'Basic analytics'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      leads: '1 lead/day',
      features: ['1 lead delivered daily', '3 states coverage', 'Marketplace (5/month)', 'Hot alerts +4 hours', 'Advanced analytics'],
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$99',
      leads: '5 leads/day',
      features: ['5 leads delivered daily', '5 states coverage', 'Marketplace (15/month)', 'Hot alerts +30 min', 'Advanced analytics'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$149',
      leads: '10 leads/day',
      features: ['10 leads delivered daily', '7 states coverage', 'Unlimited marketplace', 'Instant hot alerts', 'Custom analytics', 'VIP support'],
    },
  ];

  const handleUpgrade = async (planId) => {
    // For paid plans, check if user can use trial first
    if (planId !== 'free') {
      // If user can use trial, show the trial offer modal
      if (canUseTrial && !checkingTrial) {
        setTrialModal({ plan: planId });
        return;
      }
      
      // Otherwise, go directly to checkout
      await proceedToCheckout(planId, false);
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

  // Proceed to Dodo checkout with or without trial
  const proceedToCheckout = async (planId, useTrial) => {
    setLoading(true);
    setTrialModal(null);
    try {
      const response = await dodoAPI.createCheckout(planId, user?.id, useTrial);
      // Redirect to Dodo checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('[DODO] Checkout error:', error);
      setSuccessModal({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to start checkout. Please try again.',
        actionText: 'Close',
        secondaryText: null
      });
      setLoading(false);
    }
  };

  // Handle trial modal selections
  const handleSelectTrial = () => {
    if (trialModal) {
      proceedToCheckout(trialModal.plan, true);
    }
  };

  const handleSelectFull = () => {
    if (trialModal) {
      proceedToCheckout(trialModal.plan, false);
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

        {/* Email Verification Warning */}
        {!isEmailVerified && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-300">Email Verification Required</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Please verify your email address before upgrading your plan. Check your inbox for a verification link.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {sendingVerification ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">Secure Payment</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Payments are processed securely through Dodo Payments. Your subscription will be billed monthly.
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
                  disabled={isCurrentPlan || loading || (plan.id !== 'free' && !isEmailVerified)}
                  className={`w-full py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 mt-auto ${
                    isCurrentPlan
                      ? 'bg-green-600 text-white'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {loading ? 'Changing...' : isCurrentPlan ? 'Current Plan' : (plan.id !== 'free' && !isEmailVerified) ? 'Verify Email First' : 'Select Plan'}
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
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Daily Leads</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">1/week</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">1/day</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">5/day</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">10/day</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">States Coverage</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">1</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">3</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">5</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">7</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Marketplace Purchases</td>
                  <td className="text-center py-3 px-4 text-gray-500 dark:text-gray-500">—</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">5/month</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">15/month</td>
                  <td className="text-center py-3 px-4 text-purple-600 dark:text-purple-400 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">🔥 Hot Lead Alerts</td>
                  <td className="text-center py-3 px-4 text-gray-500 dark:text-gray-500">—</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">+4 hours</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">+30 min</td>
                  <td className="text-center py-3 px-4 text-green-600 dark:text-green-400 font-semibold">Instant</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">🌡️ Warm Lead Alerts</td>
                  <td className="text-center py-3 px-4 text-gray-500 dark:text-gray-500">—</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">+1 hour</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">+15 min</td>
                  <td className="text-center py-3 px-4 text-green-600 dark:text-green-400 font-semibold">Instant</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Analytics</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Basic</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Advanced</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Advanced</td>
                  <td className="text-center py-3 px-4 text-purple-600 dark:text-purple-400 font-semibold">Custom</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Support</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Email</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Priority</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">Premium</td>
                  <td className="text-center py-3 px-4 text-purple-600 dark:text-purple-400 font-semibold">VIP</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Marketplace Info */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center gap-2 mb-2">
                <span>🔥</span>
                <span className="font-bold text-gray-900 dark:text-white">Hot Leads - $100</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Limited to 3 buyers per lead</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <span>🌡️</span>
                <span className="font-bold text-gray-900 dark:text-white">Warm Leads - $80</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Limited to 5 buyers per lead</p>
            </div>
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

      {/* Trial Offer Modal */}
      {trialModal && (
        <TrialOfferModal
          plan={trialModal.plan}
          onSelectTrial={handleSelectTrial}
          onSelectFull={handleSelectFull}
          onClose={() => setTrialModal(null)}
          loading={loading}
        />
      )}
    </Layout>
  );
}
