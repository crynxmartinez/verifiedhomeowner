import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Refund() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Refund Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: December 3, 2024
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-2">
              Summary
            </h2>
            <p className="text-blue-800 dark:text-blue-400">
              Due to the nature of our digital software service, subscription payments are generally 
              non-refundable once the service has been accessed. However, we handle refund requests on 
              a case-by-case basis through our payment processor, Paddle. You may cancel your subscription 
              at any time, and you will retain access until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Digital Product Nature
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Verified Homeowner is a Software-as-a-Service (SaaS) platform that provides immediate access 
              to digital services upon subscription activation. Due to the instant delivery nature of our 
              software:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Access to the Software is granted immediately upon successful payment</li>
              <li>Digital services and data delivered cannot be "returned"</li>
              <li>The full value of the subscription is available from the moment of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Payment Processing and Refunds
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              All payments are processed by <strong>Paddle.com</strong>, our Merchant of Record. Paddle 
              handles all billing, invoicing, and refund processing on our behalf.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Refund Requests:</strong> If you believe you are entitled to a refund, please contact 
              us at support@verifiedhomeowner.com. We will review your request and, if approved, process 
              the refund through Paddle. Refund requests are evaluated on a case-by-case basis.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Processing Time:</strong> Approved refunds are typically processed within 5-10 business 
              days. The time for the refund to appear in your account depends on your payment method and 
              financial institution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Cancellation Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You may cancel your subscription at any time. Cancellation is the recommended approach if 
              you no longer wish to use our Software. When you cancel:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Your subscription remains active until the end of your current billing period</li>
              <li>You continue to have full access to all Software features until expiration</li>
              <li>No further charges will be made to your payment method</li>
              <li>Data and leads delivered during your subscription remain accessible until expiration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. How to Cancel
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              To cancel your subscription:
            </p>
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Log in to your Verified Homeowner account</li>
              <li>Navigate to "Upgrade Plan" in the sidebar</li>
              <li>Select the "Free" plan to downgrade</li>
              <li>Confirm your cancellation</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Alternatively, you can:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-2">
              <li>Email us at support@verifiedhomeowner.com to request cancellation</li>
              <li>Manage your subscription directly through Paddle's customer portal (link provided in your receipt emails)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Billing Cycle
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Subscriptions are billed monthly in advance on a recurring basis. Your billing date is 
              determined by the date of your initial subscription. For example, if you subscribed on 
              the 15th, you will be billed on the 15th of each subsequent month.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Important:</strong> To avoid being charged for the next billing cycle, ensure you 
              cancel your subscription before your renewal date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Plan Changes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You may upgrade or downgrade your subscription plan at any time:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Upgrades:</strong> Take effect immediately. You will be charged a prorated amount for the remainder of your current billing period.</li>
              <li><strong>Downgrades:</strong> Take effect at the start of your next billing cycle. You retain access to your current plan's features until then.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Circumstances for Refund Consideration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              While our general policy is that subscriptions are non-refundable after service access, 
              we may consider refunds in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Duplicate Charges:</strong> If you were charged multiple times for the same subscription period due to a technical error</li>
              <li><strong>Unauthorized Transactions:</strong> If a charge was made without your authorization (subject to verification)</li>
              <li><strong>Service Unavailability:</strong> If the Software was significantly unavailable during your subscription period due to issues on our end</li>
              <li><strong>Technical Issues:</strong> If you experienced persistent technical problems that prevented you from using the Software, and our support team was unable to resolve them</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              All refund requests are evaluated at our sole discretion. Please provide relevant details 
              and documentation when submitting a refund request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Free Plan
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We offer a Free plan that allows you to explore our Software before committing to a paid 
              subscription. We strongly encourage you to use the Free plan to evaluate whether our 
              Software meets your needs before upgrading. This helps ensure you make an informed decision 
              and reduces the likelihood of refund requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Chargebacks
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have a billing dispute, please contact us at support@verifiedhomeowner.com before 
              initiating a chargeback with your bank or credit card company. We are committed to resolving 
              issues fairly and promptly. Initiating a chargeback without first contacting us may result 
              in immediate suspension of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have questions about our refund policy, need assistance with your subscription, or 
              wish to submit a refund request, please contact us:
            </p>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p><strong>Email:</strong> support@verifiedhomeowner.com</p>
              <p><strong>Response Time:</strong> We aim to respond to all inquiries within 24-48 business hours</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              When contacting us about a refund, please include:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-2">
              <li>Your account email address</li>
              <li>Date of the charge in question</li>
              <li>Reason for your refund request</li>
              <li>Any relevant screenshots or documentation</li>
            </ul>
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
