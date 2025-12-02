import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, CreditCard } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

export default function Pricing() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      leads: '1 lead/week',
      features: [
        '1 lead every Monday',
        'Custom analytics',
        'Notes',
        'Follow up countdown',
      ],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      period: '/month',
      leads: '1 lead/day',
      features: [
        '1 lead delivered daily',
        'Priority lead distribution',
        'Custom analytics',
        'Notes',
        'Follow up countdown',
        'Access to hot lead marketplace',
        'Support tab',
      ],
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$99',
      period: '/month',
      leads: '5 leads/day',
      features: [
        '5 leads delivered daily',
        'Priority lead distribution',
        'Custom analytics',
        'Notes',
        'Follow up countdown',
        'Access to hot lead marketplace',
        'Support tab',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$149',
      period: '/month',
      leads: '10 leads/day',
      features: [
        '10 leads delivered daily',
        'Priority lead distribution',
        'Custom analytics',
        'Notes',
        'Follow up countdown',
        'Access to hot lead marketplace',
        'Support tab',
      ],
    },
  ];

  const faqs = [
    {
      question: 'How do I get my leads?',
      answer: 'Leads are automatically delivered to your dashboard daily (or weekly for Free plan). You\'ll see them in your "My Leads" section with all contact information.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. Your access continues until the end of your current billing period.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment system.',
    },
    {
      question: 'Are there any contracts or commitments?',
      answer: 'No contracts! All plans are month-to-month. Upgrade, downgrade, or cancel whenever you want.',
    },
    {
      question: 'What kind of leads do you provide?',
      answer: 'We provide verified homeowner leads with property information, contact details, and motivation indicators to help you close more deals.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business. No hidden fees, no contracts.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg p-8 relative flex flex-col ${
                  plan.popular ? 'ring-4 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6 font-medium">
                  {plan.leads}
                </p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={isAuthenticated ? '/upgrade' : '/register'}
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition mt-auto ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secure Payment */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CreditCard className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Secure Payment
            </h2>
          </div>
          <p className="text-gray-600">
            All payments are processed securely through Stripe. Your payment information is never stored on our servers.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8">
            Join hundreds of wholesalers who are closing more deals with verified homeowner leads.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Free Plan
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Verified Homeowner</h3>
              <p className="text-sm leading-relaxed">
                Quality verified leads for real estate wholesalers.
              </p>
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
