import { Link } from 'react-router-dom';

export default function Refund() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Verified Homeowner
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Refund Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-2">
              Summary
            </h2>
            <p className="text-blue-800 dark:text-blue-400">
              Due to the nature of our service (delivery of lead data), all subscription payments are 
              non-refundable. You may cancel your subscription at any time, and you will retain access 
              until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. No Refunds Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All payments made for Verified Homeowner subscriptions are final and non-refundable. This 
              policy exists because:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
              <li>Our service provides immediate access to lead data upon subscription</li>
              <li>Lead data, once delivered, cannot be "returned" or "unused"</li>
              <li>The value of our service is delivered instantly upon payment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Cancellation Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You may cancel your subscription at any time through your account settings or by contacting 
              our support team. When you cancel:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Your subscription will remain active until the end of your current billing period</li>
              <li>You will continue to receive leads until your subscription ends</li>
              <li>You will not be charged for the next billing cycle</li>
              <li>All leads delivered during your subscription remain yours to keep</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How to Cancel
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              To cancel your subscription:
            </p>
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Log in to your account</li>
              <li>Go to "Upgrade Plan" in the sidebar</li>
              <li>Select the "Free" plan to downgrade</li>
              <li>Confirm your cancellation</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Alternatively, you can email us at support@verifiedhomeowner.com to request cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Billing Cycle
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Subscriptions are billed monthly on the same date you originally subscribed. For example, 
              if you subscribed on the 15th, you will be billed on the 15th of each month. If you cancel 
              before your next billing date, you will not be charged again.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Plan Changes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You may upgrade or downgrade your plan at any time. When you change plans:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
              <li><strong>Upgrades:</strong> Take effect immediately, and you will be charged the prorated difference</li>
              <li><strong>Downgrades:</strong> Take effect at the start of your next billing cycle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Exceptional Circumstances
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              While we maintain a strict no-refund policy, we may consider exceptions in rare circumstances, 
              such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
              <li>Duplicate charges due to technical errors</li>
              <li>Unauthorized transactions (with proper verification)</li>
              <li>Extended service outages that significantly impact your ability to use the Service</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Any exceptions are granted at our sole discretion. Please contact support@verifiedhomeowner.com 
              to discuss your situation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Free Trial
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We offer a Free plan that allows you to try our service before committing to a paid 
              subscription. We encourage you to use the Free plan to evaluate our service before upgrading.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have questions about our refund policy or need assistance with your subscription, 
              please contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Email: support@verifiedhomeowner.com
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/refund" className="hover:text-white">Refund Policy</Link>
        </div>
        <div className="text-center mt-6 text-sm">
          © {new Date().getFullYear()} Verified Homeowner. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
