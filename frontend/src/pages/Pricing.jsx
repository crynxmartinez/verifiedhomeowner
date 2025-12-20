import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, ChevronDown, ChevronUp, ArrowRight, Star } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Pricing() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [openFaq, setOpenFaq] = useState(null);
  const [annual, setAnnual] = useState(false);

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
        '1 state coverage',
        'Lead tracking dashboard',
        'Notes & follow-ups',
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
        '3 states coverage',
        'Marketplace (5/month)',
        'Hot lead alerts (+4 hours)',
        '7-day analytics',
        'Priority support',
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
        '5 states coverage',
        'Marketplace (15/month)',
        'Hot lead alerts (+30 min)',
        '30-day analytics',
        'Premium support',
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
        '7 states coverage',
        'Unlimited marketplace',
        'Instant hot lead alerts',
        '90-day analytics + Export',
        'VIP support',
      ],
    },
  ];

  const faqs = [
    { q: 'How do I get my leads?', a: 'Leads are automatically delivered to your dashboard daily (or weekly for Free plan). You\'ll see them in your "My Leads" section with all contact information.' },
    { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time. Your access continues until the end of your current billing period.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment system.' },
    { q: 'Are there any contracts?', a: 'No contracts! All plans are month-to-month. Upgrade, downgrade, or cancel whenever you want.' },
    { q: 'What kind of leads do you provide?', a: 'We provide verified homeowner leads with property information, contact details, and motivation indicators to help you close more deals.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-white/90 text-sm">Start with our Free Plan</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your business. No hidden fees, no contracts.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-xl p-8 relative flex flex-col border-2 transition-all hover:shadow-2xl ${
                  plan.popular ? 'border-orange-500 scale-105' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6 font-medium bg-gray-100 rounded-lg py-2 px-3 text-center">
                  {plan.leads}
                </p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={isAuthenticated ? '/upgrade' : '/register'}
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition mt-auto ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30'
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
      <section className="py-12 px-4 bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Secure Payment</h2>
          </div>
          <p className="text-blue-100">
            All payments are processed securely. Your payment information is never stored on our servers.
          </p>
        </div>
      </section>

      {/* Plan Comparison Table */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Compare Plans
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">See what's included in each plan</p>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                  <th className="text-left py-4 px-6 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 font-semibold">Basic</th>
                  <th className="text-center py-4 px-4 font-semibold">Elite</th>
                  <th className="text-center py-4 px-4 font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">Daily Leads</td>
                  <td className="text-center py-4 px-4 text-gray-600">1/week</td>
                  <td className="text-center py-4 px-4 text-gray-600">1/day</td>
                  <td className="text-center py-4 px-4 text-gray-600">5/day</td>
                  <td className="text-center py-4 px-4 text-gray-600">10/day</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">States Coverage</td>
                  <td className="text-center py-4 px-4 text-gray-600">1</td>
                  <td className="text-center py-4 px-4 text-gray-600">3</td>
                  <td className="text-center py-4 px-4 text-gray-600">5</td>
                  <td className="text-center py-4 px-4 text-gray-600">7</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">Marketplace Purchases</td>
                  <td className="text-center py-4 px-4 text-gray-400">—</td>
                  <td className="text-center py-4 px-4 text-gray-600">5/month</td>
                  <td className="text-center py-4 px-4 text-gray-600">15/month</td>
                  <td className="text-center py-4 px-4 text-blue-600 font-semibold">Unlimited</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">🔥 Hot Lead Alerts</td>
                  <td className="text-center py-4 px-4 text-gray-400">—</td>
                  <td className="text-center py-4 px-4 text-gray-600">+4 hours</td>
                  <td className="text-center py-4 px-4 text-gray-600">+30 min</td>
                  <td className="text-center py-4 px-4 text-orange-500 font-semibold">Instant</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">🌡️ Warm Lead Alerts</td>
                  <td className="text-center py-4 px-4 text-gray-400">—</td>
                  <td className="text-center py-4 px-4 text-gray-600">+1 hour</td>
                  <td className="text-center py-4 px-4 text-gray-600">+15 min</td>
                  <td className="text-center py-4 px-4 text-orange-500 font-semibold">Instant</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">Lead Tracking</td>
                  <td className="text-center py-4 px-4 text-blue-600">✓</td>
                  <td className="text-center py-4 px-4 text-blue-600">✓</td>
                  <td className="text-center py-4 px-4 text-blue-600">✓</td>
                  <td className="text-center py-4 px-4 text-blue-600">✓</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">Analytics</td>
                  <td className="text-center py-4 px-4 text-gray-400">—</td>
                  <td className="text-center py-4 px-4 text-gray-600">7 days</td>
                  <td className="text-center py-4 px-4 text-gray-600">30 days</td>
                  <td className="text-center py-4 px-4 text-blue-600 font-semibold">90 days + Export</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">Support</td>
                  <td className="text-center py-4 px-4 text-gray-600">Email</td>
                  <td className="text-center py-4 px-4 text-gray-600">Priority</td>
                  <td className="text-center py-4 px-4 text-gray-600">Premium</td>
                  <td className="text-center py-4 px-4 text-blue-600 font-semibold">VIP</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Marketplace Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔥</span>
                <h3 className="font-bold text-gray-900">Hot Leads - $100</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">High-motivation sellers ready to close quickly</p>
              <p className="text-gray-500 text-xs">Limited to 3 buyers per lead</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌡️</span>
                <h3 className="font-bold text-gray-900">Warm Leads - $80</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">Motivated sellers with flexible timelines</p>
              <p className="text-gray-500 text-xs">Limited to 5 buyers per lead</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">Everything you need to know</p>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 text-left">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join hundreds of wholesalers who are closing more deals with verified homeowner leads.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30"
          >
            Start Free Plan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="mt-4 text-gray-400 text-sm">No credit card required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
