import { X, Zap, CreditCard, Gift } from 'lucide-react';

const PLAN_PRICES = {
  basic: 29,
  elite: 49,
  pro: 149,
};

const PLAN_NAMES = {
  basic: 'Basic',
  elite: 'Elite',
  pro: 'Pro',
};

export default function TrialOfferModal({ plan, onSelectTrial, onSelectFull, onClose, loading }) {
  const price = PLAN_PRICES[plan] || 49;
  const planName = PLAN_NAMES[plan] || 'Plan';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Gift size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Special First-Time Offer!</h2>
              <p className="text-white/80 text-sm">One-time offer for new subscribers</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            You're about to upgrade to <span className="font-semibold text-gray-900 dark:text-white">{planName}</span>. 
            Choose how you'd like to start:
          </p>

          {/* Trial Option */}
          <button
            onClick={onSelectTrial}
            disabled={loading}
            className="w-full p-4 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 dark:text-purple-400 text-lg">Try Free for 3 Days</span>
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">RECOMMENDED</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Get full access to {planName} features. Then ${price}/month after trial.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Cancel anytime during trial - no charge
                </p>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Full Price Option */}
          <button
            onClick={onSelectFull}
            disabled={loading}
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-gray-700 dark:text-gray-300 text-lg">Pay ${price}/month Today</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Start immediately with no trial period
                </p>
              </div>
            </div>
          </button>

          {/* Footer note */}
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
            ⚡ This offer is only available once for new subscribers
          </p>
        </div>
      </div>
    </div>
  );
}
