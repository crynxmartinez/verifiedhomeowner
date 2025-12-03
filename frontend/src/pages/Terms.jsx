import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: December 3, 2024
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing or using the Verified Homeowner software platform ("Service", "Platform", or "Software"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              please do not use our Service. These Terms constitute a legally binding agreement between you 
              and Verified Homeowner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Verified Homeowner is a Software-as-a-Service (SaaS) platform designed for real estate professionals. 
              Our software provides:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Automated lead generation and delivery system</li>
              <li>Lead management dashboard and analytics tools</li>
              <li>Contact organization and note-taking features</li>
              <li>Follow-up tracking and countdown timers</li>
              <li>Access to our proprietary lead marketplace</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Platform aggregates publicly available property data and delivers it through our software 
              interface. Data accuracy and availability may vary based on public record sources and market conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Account Registration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              To access our Software, you must create an account. You represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into binding agreements</li>
              <li>All registration information you provide is accurate and complete</li>
              <li>You will maintain the security of your account credentials</li>
              <li>You will notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities conducted under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Subscription Plans and Billing
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We offer various subscription tiers providing different levels of software access and features. 
              Paid subscriptions are billed monthly in advance on a recurring basis.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Payment Processing:</strong> All payments are processed by Paddle.com ("Paddle"), our 
              authorized Merchant of Record. By subscribing, you agree to Paddle's terms of service and 
              authorize recurring charges to your payment method. Paddle handles all payment processing, 
              invoicing, sales tax, and VAT compliance on our behalf.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Price Changes:</strong> We reserve the right to modify subscription prices with 30 days 
              advance notice. Price changes will take effect at the start of your next billing cycle.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Cancellation:</strong> You may cancel your subscription at any time through your account 
              settings. Upon cancellation, you retain access to the Software until the end of your current 
              billing period. See our <Link to="/refund" className="text-blue-600 hover:underline">Refund Policy</Link> for 
              more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. License Grant
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Subject to your compliance with these Terms and payment of applicable fees, we grant you a 
              limited, non-exclusive, non-transferable, revocable license to access and use the Software 
              for your internal business purposes during your subscription term.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This license does not include the right to sublicense, resell, or redistribute access to 
              the Software or any data obtained through the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Acceptable Use Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You agree to use the Software only for lawful purposes and in accordance with these Terms. 
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Resell, redistribute, or share data obtained through the Platform with third parties</li>
              <li>Use the Software for any illegal, fraudulent, or unauthorized purpose</li>
              <li>Violate any applicable laws, including telemarketing regulations (TCPA, DNC, GDPR)</li>
              <li>Harass, spam, or abuse contacts obtained through our Platform</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Software</li>
              <li>Interfere with or disrupt the Software or its infrastructure</li>
              <li>Use automated scripts or bots to access the Software without authorization</li>
              <li>Circumvent any access controls or usage limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Data Accuracy Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Software aggregates data from various public sources. While we strive to provide accurate 
              and current information, we do not guarantee the accuracy, completeness, or reliability of any 
              data displayed through the Platform. Contact information may change, and property details may 
              become outdated. You are solely responsible for verifying all information before taking any action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The Software, including its design, features, functionality, source code, and all related 
              intellectual property, is owned exclusively by Verified Homeowner and protected by copyright, 
              trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of the Software, nor may you 
              reverse engineer or attempt to extract the source code, unless expressly permitted by law 
              or with our written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, VERIFIED HOMEOWNER AND ITS AFFILIATES, 
              OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Loss of profits, revenue, or business opportunities</li>
              <li>Loss of data or data corruption</li>
              <li>Business interruption</li>
              <li>Any damages arising from your use of data obtained through the Platform</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our total liability for any claims arising from these Terms or your use of the Software 
              shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SOFTWARE 
              WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Verified Homeowner and its officers, 
              directors, employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including reasonable attorneys' fees) arising from: (a) your use of the Software; (b) your 
              violation of these Terms; (c) your violation of any third-party rights; or (d) your use of 
              data obtained through the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account and access to the Software at any 
              time, with or without cause, including for violation of these Terms. Upon termination:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Your license to use the Software immediately terminates</li>
              <li>You must cease all use of the Software</li>
              <li>We may delete your account data after a reasonable retention period</li>
              <li>Sections 8, 9, 10, 11, and 14 shall survive termination</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may modify these Terms at any time. Material changes will be communicated via email or 
              through the Software at least 30 days before taking effect. Your continued use of the Software 
              after changes become effective constitutes acceptance of the revised Terms. If you do not agree 
              to the changes, you must stop using the Software and cancel your subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              14. Governing Law and Disputes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of 
              Delaware, United States, without regard to its conflict of law provisions. Any disputes arising 
              from these Terms or your use of the Software shall be resolved through binding arbitration in 
              accordance with the rules of the American Arbitration Association, except that either party 
              may seek injunctive relief in any court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              15. Severability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall 
              be limited or eliminated to the minimum extent necessary, and the remaining provisions shall 
              remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              16. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> support@verifiedhomeowner.com
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
