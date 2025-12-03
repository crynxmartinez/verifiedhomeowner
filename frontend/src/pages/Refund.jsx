import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Refund Policy</h1>
          <p className="text-blue-200">Last updated: December 3, 2024</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose max-w-none space-y-8">
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At Verified Homeowner, we strive to provide high-quality verified leads to help you grow your real estate 
              business. We understand that circumstances may arise where you need to request a refund. This policy outlines 
              our approach to refunds and cancellations.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Payment Processing</h2>
            <p className="text-gray-700 leading-relaxed">
              All payments are processed by Paddle.com, our Merchant of Record. Refund requests will be handled through 
              Paddle's payment system. When you request a refund, Paddle will process the return of funds to your original 
              payment method.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Due to the immediate delivery nature of our digital lead data, refunds are evaluated on a case-by-case basis. 
              You may be eligible for a refund if:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You experience technical issues preventing access to the Service</li>
              <li>Leads were not delivered as promised by your subscription plan</li>
              <li>You were charged incorrectly or multiple times</li>
              <li>The Service was significantly unavailable during your billing period</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How to Request a Refund</h2>
            <p className="text-gray-700 leading-relaxed mb-4">To request a refund:</p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Email us at <a href="mailto:support@verifiedhomeowner.com" className="text-purple-600 hover:underline">support@verifiedhomeowner.com</a></li>
              <li>Include your account email and reason for the refund request</li>
              <li>Provide any relevant details or screenshots</li>
              <li>We will respond within 2-3 business days</li>
            </ol>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may cancel your subscription at any time:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Through your account settings dashboard</li>
              <li>Via Paddle's customer portal</li>
              <li>By contacting our support team</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Upon cancellation, you will retain access to your current plan features until the end of your billing period. 
              No partial refunds are provided for unused time within a billing cycle.
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Chargebacks</h2>
            <p className="text-gray-700 leading-relaxed">
              We encourage you to contact us directly before initiating a chargeback with your bank or credit card company. 
              Chargebacks result in additional fees and may lead to account suspension. We are committed to resolving any 
              issues fairly and promptly.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions about this Refund Policy or to request a refund, please contact us at:{' '}
              <a href="mailto:support@verifiedhomeowner.com" className="text-purple-600 hover:underline">
                support@verifiedhomeowner.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Verified Homeowner</h3>
              <p className="text-sm leading-relaxed">Quality verified leads for real estate wholesalers.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><a href="mailto:support@verifiedhomeowner.com" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-white transition">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} Verified Homeowner. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
