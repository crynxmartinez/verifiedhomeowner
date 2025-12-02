import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Refund() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
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
              7. Free Plan
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
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Verified Homeowner</h3>
              <p className="text-gray-400 max-w-md">
                Connecting real estate professionals with verified homeowner leads. 
                Grow your business with quality contacts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-white transition">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Verified Homeowner. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
