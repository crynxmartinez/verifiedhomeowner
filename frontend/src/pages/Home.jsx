import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';

export default function Home() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      leads: '1 lead/week',
      features: ['1 lead every Monday', 'Basic support', 'Lead tracking'],
    },
    {
      name: 'Basic',
      price: '$99',
      leads: '1 lead/day',
      features: ['Daily lead delivery', 'Priority support', 'Advanced tracking', 'Email notifications'],
      popular: true,
    },
    {
      name: 'Elite',
      price: '$299',
      leads: '5 leads/day',
      features: ['5 daily leads', 'Premium support', 'Advanced analytics', 'Priority distribution'],
    },
    {
      name: 'Pro',
      price: '$499',
      leads: '10 leads/day',
      features: ['10 daily leads', 'VIP support', 'Custom analytics', 'First in line'],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">
            Verified Homeowner Leads
          </h1>
          <p className="text-2xl mb-8 text-blue-100">
            Get exclusive access to verified homeowner leads. Scale your wholesale business with our proven system.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Start Free Trial
            </Link>
            <Link
              to="/how-it-works"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Sign Up</h3>
              <p className="text-gray-600 text-lg">
                Create your account and choose a plan that fits your needs. Start with our free plan.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Receive Leads</h3>
              <p className="text-gray-600 text-lg">
                Get verified homeowner leads delivered to your dashboard daily based on your plan.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Close Deals</h3>
              <p className="text-gray-600 text-lg">
                Contact leads, track your progress, and close more deals with our easy-to-use system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-900">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Verified homeowner information',
              'Sequential lead distribution',
              'Real-time dashboard tracking',
              'Multiple pricing plans',
              'Daily lead delivery',
              'Advanced analytics',
              'Priority support',
              'Easy lead management',
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-900">Simple Pricing</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg p-8 ${
                  plan.popular ? 'ring-4 ring-blue-600 relative' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">{plan.price}</div>
                <div className="text-gray-600 mb-6">{plan.leads}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-lg font-semibold transition ${
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

      {/* CTA - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-2xl mb-8 text-blue-100">
            Join hundreds of wholesalers already growing their business with verified leads.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-blue-50 transition"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Verified Homeowner CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
