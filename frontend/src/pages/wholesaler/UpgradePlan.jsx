import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import useAuthStore from '../../store/authStore';
import { userAPI, dodoAPI, authAPI } from '../../lib/api';
import { CheckCircle, TrendingUp, CreditCard, Mail, AlertTriangle, Loader2, XCircle } from 'lucide-react';
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await dodoAPI.cancelSubscription();
      
      // Refresh user data to get updated subscription status
      await refreshUser?.();
      
      setShowCancelModal(false);
      setSuccessModal({
        title: 'Subscription Cancelled',
        message: response.data.details?.accessUntil 
          ? `Your subscription has been cancelled. You will continue to have access until ${new Date(response.data.details.accessUntil).toLocaleDateString()}.`
          : 'Your subscription has been cancelled. You will continue to have access until the end of your billing period.',
        actionText: 'Got it!',
        secondaryText: null
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setShowCancelModal(false);
      setSuccessModal({
        title: 'Error',
        message: error.response?.data?.message || error.response?.data?.error || 'Failed to cancel subscription. Please try again or contact support.',
        actionText: 'Close',
        secondaryText: null
      });
    } finally {
      setCancelling(false);
    }
  };

  // Check if user has an active paid subscription that can be cancelled
  // Show cancel button if user has a paid plan (even if no dodoSubscriptionId - for manual upgrades)
  const canCancelSubscription = user?.plan_type !== 'free' && 
    user?.subscription_status !== 'cancelled';

  // Check if subscription is cancelled but still active
  const isCancelledButActive = user?.subscription_status === 'cancelled' && 
    user?.plan_type !== 'free';

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

        {/* Cancelled Subscription Notice */}
        {isCancelledButActive && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-300">Subscription Cancelled</h3>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Your subscription has been cancelled. You will continue to have access to your {user?.plan_type?.toUpperCase()} plan 
                  {user?.subscription_end_date && (
                    <> until <span className="font-semibold">{new Date(user.subscription_end_date).toLocaleDateString()}</span></>
                  )}.
                  After that, you will be downgraded to the Free plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Subscription - Cancel Option */}
        {canCancelSubscription && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Active Subscription</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You have an active {user?.plan_type?.toUpperCase()} subscription.
                    {user?.subscription_end_date && (
                      <> Next billing date: <span className="font-medium">{new Date(user.subscription_end_date).toLocaleDateString()}</span></>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </button>
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
                  <td className="text-center py-3 px-4 text-gray-500 dark:text-gray-500">—</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">7 days</td>
                  <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">30 days</td>
                  <td className="text-center py-3 px-4 text-purple-600 dark:text-purple-400 font-semibold">90 days + Export</td>
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

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !cancelling && setShowCancelModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Cancel Subscription?
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to cancel your <span className="font-semibold">{user?.plan_type?.toUpperCase()}</span> subscription?
                {user?.subscription_end_date && (
                  <> You will continue to have access until <span className="font-semibold">{new Date(user.subscription_end_date).toLocaleDateString()}</span>.</>
                )}
                {!user?.subscription_end_date && (
                  <> You will continue to have access until the end of your current billing period.</>
                )}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Subscription'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Keep My Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
