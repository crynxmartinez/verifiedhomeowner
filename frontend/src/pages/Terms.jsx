import { Link } from 'react-router-dom';

export default function Terms() {
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
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing or using Verified Homeowner ("Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Verified Homeowner provides lead generation services for real estate professionals. We deliver 
              homeowner contact information and property data to help you grow your business. The accuracy 
              and availability of leads may vary based on market conditions and data sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Account Registration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              To use our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Subscription and Payment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Paid subscriptions are billed monthly in advance. By subscribing, you authorize us to charge 
              your payment method on a recurring basis until you cancel. Prices are subject to change with 
              30 days notice.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You may cancel your subscription at any time. Upon cancellation, you will retain access to 
              the Service until the end of your current billing period. See our <Link to="/refund" className="text-blue-600 hover:underline">Refund Policy</Link> for 
              more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Acceptable Use
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Resell, redistribute, or share lead data with third parties</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws, including telemarketing regulations (TCPA, DNC)</li>
              <li>Harass, spam, or abuse the contacts provided through our Service</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Lead Data and Accuracy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              While we strive to provide accurate and up-to-date information, we do not guarantee the 
              accuracy, completeness, or reliability of any lead data. Contact information may change, 
              and property details may be outdated. You are responsible for verifying information before 
              taking action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Service, including its design, features, and content, is owned by Verified Homeowner 
              and protected by intellectual property laws. You may not copy, modify, or distribute any 
              part of the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Verified Homeowner shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages, including loss of 
              profits, data, or business opportunities, arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, either 
              express or implied. We do not warrant that the Service will be uninterrupted, error-free, 
              or secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of 
              these Terms or for any other reason at our sole discretion. Upon termination, your right 
              to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may modify these Terms at any time. We will notify you of significant changes by email 
              or through the Service. Your continued use of the Service after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have questions about these Terms, please contact us at support@verifiedhomeowner.com.
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
