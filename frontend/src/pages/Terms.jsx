import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-blue-200">Last updated: December 3, 2024</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose max-w-none space-y-8">
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using the Verified Homeowner software platform ("Service", "Platform", or "Software"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              please do not use our Service. These Terms constitute a legally binding agreement between you 
              and Verified Homeowner.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Verified Homeowner is a Software-as-a-Service (SaaS) platform designed for real estate professionals. 
              Our software provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Automated lead generation and delivery system</li>
              <li>Lead management dashboard and analytics tools</li>
              <li>Contact organization and note-taking features</li>
              <li>Follow-up tracking and countdown timers</li>
              <li>Access to our proprietary lead marketplace</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All payments are processed by Dodo Payments ("Dodo"), our Merchant of Record for all subscription transactions. 
              By subscribing to a paid plan, you authorize Dodo Payments to charge your payment method on a recurring basis.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Free Plan: 1 lead per week, delivered on Mondays</li>
              <li>Basic Plan ($29/month): 1 lead per day</li>
              <li>Elite Plan ($99/month): 5 leads per day</li>
              <li>Pro Plan ($149/month): 10 leads per day</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Resell, redistribute, or share lead data with third parties</li>
              <li>Attempt to reverse engineer or extract our data sources</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Harass, threaten, or abuse any leads or contacts provided</li>
              <li>Violate any applicable telemarketing or do-not-call regulations</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content, features, and functionality of the Service are owned by Verified Homeowner and are 
              protected by copyright, trademark, and other intellectual property laws. You are granted a limited, 
              non-exclusive, non-transferable license to access and use the Service for your business purposes only.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERIFIED HOMEOWNER SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, 
              DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms 
              or for any other reason at our sole discretion. You may cancel your subscription at any time through 
              your account settings or by contacting support.
            </p>
          </section>

          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, please contact us at:{' '}
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
                <li><Link to="/refund" className="hover:text-white transition">Cancellation Policy</Link></li>
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
