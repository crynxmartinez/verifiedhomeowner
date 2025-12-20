import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Refund() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Cancellation Policy</h1>
          <p className="text-blue-200">Last updated: December 4, 2024</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose max-w-none space-y-8">
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At Verified Homeowner, we strive to provide high-quality verified leads to help you grow your real estate 
              business. This policy outlines our approach to subscription cancellations. We offer a generous Free Plan 
              so you can evaluate our service before committing to a paid subscription.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. No Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Due to the immediate delivery nature of our digital lead data, <strong>we do not offer refunds</strong> on 
              subscription payments. Once leads are delivered, they cannot be "returned." We encourage all users to start 
              with our Free Plan to evaluate the service quality before upgrading to a paid subscription.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cancellation Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may cancel your subscription at any time. When you cancel:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Your subscription will remain active until the end of your current billing period</strong></li>
              <li>You will continue to receive leads until your subscription expires</li>
              <li>No partial refunds are provided for unused time within a billing cycle</li>
              <li>Your account will automatically downgrade to the Free Plan after expiration</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How to Cancel</h2>
            <p className="text-gray-700 leading-relaxed mb-4">To cancel your subscription:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Log in to your account dashboard</li>
              <li>Navigate to your account settings or subscription management</li>
              <li>Click "Cancel Subscription"</li>
              <li>Alternatively, contact us at <a href="mailto:support@verifiedhomeowner.com" className="text-purple-600 hover:underline">support@verifiedhomeowner.com</a></li>
            </ol>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Processing</h2>
            <p className="text-gray-700 leading-relaxed">
              All payments are processed securely by Dodo Payments, our Merchant of Record. Dodo Payments handles all 
              billing, subscription management, and payment security. Your payment information is never stored on our servers.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Free Plan</h2>
            <p className="text-gray-700 leading-relaxed">
              We encourage all users to start with our Free Plan to evaluate the Service before committing to a paid 
              subscription. The Free Plan includes 1 lead per week at no cost, allowing you to experience our lead 
              quality firsthand.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disputes and Chargebacks</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any billing concerns, please contact us directly at{' '}
              <a href="mailto:support@verifiedhomeowner.com" className="text-purple-600 hover:underline">support@verifiedhomeowner.com</a>{' '}
              before initiating a chargeback with your bank or credit card company. Chargebacks result in additional fees 
              and may lead to immediate account suspension. We are committed to resolving any issues fairly and promptly.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions about this Cancellation Policy, please contact us at:{' '}
              <a href="mailto:support@verifiedhomeowner.com" className="text-purple-600 hover:underline">
                support@verifiedhomeowner.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
