import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <img src="/logo.png" alt="Verified Homeowner" className="h-24 mx-auto mb-8" />
          <h1 className="text-6xl font-bold mb-6">
            Stop Wasting Time on Bad Leads
          </h1>
          <p className="text-3xl mb-4 text-white font-semibold">
            No More Wrong Numbers. No More Skip Tracing. No More Dead Ends.
          </p>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Get verified, ready-to-call homeowner leads delivered daily. We handle the research, you close the deals.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Start Free Plan
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

      {/* Problem Section */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-900">We Know Your Pain</h2>
          <p className="text-2xl text-center mb-16 text-gray-600">Every wholesaler faces the same frustrating problems...</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-xl">
              <div className="text-6xl mb-4">📞</div>
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Calling Thousands</h3>
              <p className="text-gray-700">
                Spending hours dialing number after number, only to reach voicemails and disconnected lines.
              </p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-xl">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Wrong Numbers</h3>
              <p className="text-gray-700">
                Outdated data means wasted time and money on leads that go nowhere.
              </p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Skip Tracing Hell</h3>
              <p className="text-gray-700">
                Paying for expensive skip tracing services just to find current contact information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-8">We Remove All That</h2>
          <p className="text-3xl mb-12 font-semibold">And Give You More Time to Close Deals</p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border-2 border-white/30">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-4">Verified Contact Info</h3>
              <p className="text-blue-50 text-lg">
                Every lead comes with verified phone numbers and property owner information. No more wrong numbers.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border-2 border-white/30">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4">Pre-Qualified Leads</h3>
              <p className="text-blue-50 text-lg">
                We do the research and skip tracing for you. Get leads with motivation and timeline already identified.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border-2 border-white/30">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4">Daily Delivery</h3>
              <p className="text-blue-50 text-lg">
                Fresh leads delivered to your dashboard every day. No pulling lists, no data cleanup.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border-2 border-white/30">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-4">More Time = More Deals</h3>
              <p className="text-blue-50 text-lg">
                Spend your time talking to motivated sellers, not chasing bad data. Close more deals, faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8 text-gray-900">How It Works</h2>
          <p className="text-xl text-center mb-16 text-gray-600">Simple, efficient, and designed for wholesalers</p>
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
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8 text-gray-900">Everything You Need</h2>
          <p className="text-xl text-center mb-16 text-gray-600">Built specifically for real estate wholesalers</p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Verified homeowner contact information',
              'Property address and details',
              'Seller motivation identified',
              'Timeline for selling',
              'Sequential lead distribution',
              'Real-time dashboard tracking',
              'Lead status management',
              'Follow-up reminders',
              'Daily automatic delivery',
              'Multiple pricing plans',
              'Advanced analytics',
              'Priority support',
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{feature}</span>
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
            Start Your Free Plan
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Verified Homeowner</h3>
              <p className="text-sm leading-relaxed">
                Quality verified leads for real estate wholesalers. Stop wasting time on bad data.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition">Get Started</Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white transition">About Us</Link>
                </li>
                <li>
                  <a href="mailto:support@verifiedhomeowner.com" className="hover:text-white transition">Contact</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/refund" className="hover:text-white transition">Refund Policy</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm">
                © {new Date().getFullYear()} Verified Homeowner. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
                <Link to="/terms" className="hover:text-white transition">Terms</Link>
                <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
                <Link to="/refund" className="hover:text-white transition">Refunds</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
