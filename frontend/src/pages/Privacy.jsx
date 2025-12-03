import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: December 3, 2024
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Verified Homeowner ("we," "our," or "us") is committed to protecting your privacy. This 
              Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our Software-as-a-Service platform ("Software" or "Service").
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By using our Service, you consent to the data practices described in this policy. If you 
              do not agree with this policy, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.1 Information You Provide
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When you register for an account or use our Service, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
              <li><strong>Profile Information:</strong> Business name, phone number (optional)</li>
              <li><strong>Communication Data:</strong> Support requests, feedback, and correspondence</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.2 Payment Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Payment processing is handled by Paddle.com ("Paddle"), our Merchant of Record. We do not 
              store your credit card details. Paddle collects and processes payment information in 
              accordance with their privacy policy. Please review{' '}
              <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Paddle's Privacy Policy
              </a>{' '}
              for details on how they handle your payment data.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.3 Automatically Collected Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When you access our Software, we automatically collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Device Information:</strong> Device type, operating system, browser type and version</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URLs</li>
              <li><strong>Usage Data:</strong> Features used, actions taken within the Software</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Legal Basis for Processing (GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, 
              we process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Contract Performance:</strong> To provide our Service and fulfill our contractual obligations</li>
              <li><strong>Legitimate Interests:</strong> To improve our Service, prevent fraud, and ensure security</li>
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide, operate, and maintain our Software</li>
              <li>Process your subscription and manage your account</li>
              <li>Send you lead notifications and service updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve and personalize our Software and develop new features</li>
              <li>Analyze usage patterns and optimize performance</li>
              <li>Detect, prevent, and address fraud, abuse, or security issues</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
              <li>Send marketing communications (with your consent, where required)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>We do not sell your personal information.</strong> We may share your information 
              only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Payment Processor:</strong> Paddle.com processes all payments as our Merchant of Record</li>
              <li><strong>Service Providers:</strong> Trusted third parties that help us operate our Software (hosting, analytics, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> For any other purpose with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country 
              of residence, including the United States. These countries may have different data protection 
              laws. When we transfer data internationally, we implement appropriate safeguards such as 
              Standard Contractual Clauses approved by the European Commission to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your 
              personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Secure password hashing</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure cloud infrastructure</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Provide our Service while your account is active</li>
              <li>Comply with legal, accounting, or reporting requirements</li>
              <li>Resolve disputes and enforce our agreements</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              After account deletion, we may retain certain information for up to 90 days for backup 
              purposes and as required by law. Anonymized or aggregated data may be retained indefinitely 
              for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Your Privacy Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              For All Users:
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Additional Rights for EEA/UK Residents (GDPR):
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
              <li><strong>Lodge Complaint:</strong> File a complaint with your local data protection authority</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Additional Rights for California Residents (CCPA):
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Know:</strong> Request disclosure of personal information collected</li>
              <li><strong>Delete:</strong> Request deletion of personal information</li>
              <li><strong>Non-Discrimination:</strong> Not be discriminated against for exercising your rights</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@verifiedhomeowner.com" className="text-blue-600 hover:underline">
                privacy@verifiedhomeowner.com
              </a>. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the Software to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Software</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You can control cookies through your browser settings. Disabling certain cookies may affect 
              the functionality of our Software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Third-Party Links and Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our Software may contain links to third-party websites or services. We are not responsible 
              for the privacy practices of these third parties. We encourage you to review their privacy 
              policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our Software is not intended for individuals under 18 years of age. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately at privacy@verifiedhomeowner.com, and we will 
              take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              13. Changes to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be communicated 
              via email or through a prominent notice on our Software at least 30 days before taking effect. 
              The "Last updated" date at the top of this policy indicates when it was last revised. Your 
              continued use of the Software after changes become effective constitutes acceptance of the 
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              14. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data 
              practices, please contact us:
            </p>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p><strong>Email:</strong> privacy@verifiedhomeowner.com</p>
              <p><strong>General Support:</strong> support@verifiedhomeowner.com</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              For GDPR-related inquiries, you may also contact your local data protection authority.
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
