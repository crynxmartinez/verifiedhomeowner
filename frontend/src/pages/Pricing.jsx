import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, ChevronDown, ChevronUp, ArrowRight, MapPin, Phone, RefreshCw, BadgeCheck } from 'lucide-react';
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
      leads: '1 lead/day',
      features: [
        '1 lead delivered daily',
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
      leads: '5 leads/day',
      features: [
        '5 leads delivered daily',
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
      leads: '10 leads/day',
      features: [
        '10 leads delivered daily',
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
      leads: '20 leads/day',
      features: [
        '20 leads delivered daily',
        '7 states coverage',
        'Unlimited marketplace',
        'Instant hot lead alerts',
        '90-day analytics + Export',
        'VIP support',
      ],
    },
  ];

  const faqs = [
    { q: 'How does the 7-day free trial work?', a: 'Start a free trial on any paid plan (Basic, Elite, or Pro). Card required to activate, but you pay $0 during the trial. Cancel anytime before the trial ends and you won\'t be charged.' },
    { q: 'What does "phone verified" mean?', a: 'Our team actively validates the best working number for each homeowner through direct confirmation. We don\'t just pull data — we verify it connects to the actual property owner.' },
    { q: 'What is ownership matched?', a: 'We cross-reference public records to confirm the contact is the actual property owner at that address. No renters, no outdated info.' },
    { q: 'Where are leads available?', a: 'We currently serve Texas only. This is by design — limiting our territory allows us to maintain strict verification standards.' },
    { q: 'What qualifies for replacement?', a: 'If a phone number is disconnected, wrong, or doesn\'t reach the property owner, you qualify for a replacement lead.' },
    { q: 'Can I cancel anytime?', a: 'Yes! Cancel from your dashboard anytime — no calls, no hassle. Your access continues until the end of your billing period.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6">
            <MapPin className="h-4 w-4 text-orange-400 mr-2" />
            <span className="text-white/80 text-sm">Texas-Only • Quality-First</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-4">
            Ownership-matched, phone-verified homeowner leads for Texas wholesalers.
          </p>
          <p className="text-white/90 font-medium mb-2">
            Try any plan free for 7 days. <span className="text-orange-400">$0 during trial.</span> Cancel anytime.
          </p>
          <p className="text-xs text-blue-200/50">Card required to activate trial.</p>
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

      {/* Verification Standards */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-orange-500 font-medium text-sm mb-2">"If the number isn't verified, it's not a lead."</p>
            <h2 className="text-2xl font-bold text-gray-900">Every Lead Meets Our Standards</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: BadgeCheck, title: 'Ownership Matched', desc: 'Public record verified', color: 'text-blue-600' },
              { icon: Phone, title: 'Phone Verified', desc: 'Direct confirmation', color: 'text-green-600' },
              { icon: ArrowRight, title: 'Daily Delivery', desc: 'Fresh to your dashboard', color: 'text-orange-500' },
              { icon: RefreshCw, title: 'Replacement Policy', desc: 'Invalid? We replace it', color: 'text-purple-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-2`} />
                <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secure Payment */}
      <section className="py-10 px-4 bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Shield className="h-7 w-7 text-white" />
            <h2 className="text-xl font-bold text-white">Secure Payment</h2>
          </div>
          <p className="text-blue-100 text-sm">
            All payments processed securely. Cancel anytime from your dashboard.
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
                  <td className="text-center py-4 px-4 text-gray-600">1/day</td>
                  <td className="text-center py-4 px-4 text-gray-600">5/day</td>
                  <td className="text-center py-4 px-4 text-gray-600">10/day</td>
                  <td className="text-center py-4 px-4 text-blue-600 font-semibold">20/day</td>
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

      <Footer />
    </div>
  );
}
