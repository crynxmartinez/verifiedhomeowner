import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UserPlus, Download, Phone, TrendingUp, CheckCircle, ArrowRight, Target, Zap, DollarSign } from 'lucide-react';

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-32 px-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">How It Works</h1>
          <p className="text-xl md:text-2xl text-blue-200">
            Simple, efficient, and designed for wholesalers
          </p>
        </div>
      </section>

      {/* 4 Steps */}
      <section className="py-24 bg-white -mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: UserPlus, title: 'Sign Up', desc: 'Create your free account in under 2 minutes', color: 'from-purple-500 to-purple-600' },
              { icon: Target, title: 'Choose Plan', desc: 'Select a plan based on how many leads you need', color: 'from-blue-500 to-blue-600' },
              { icon: Download, title: 'Receive Leads', desc: 'Get verified homeowner leads delivered daily', color: 'from-indigo-500 to-indigo-600' },
              { icon: DollarSign, title: 'Close Deals', desc: 'Call verified numbers and close more deals', color: 'from-orange-500 to-orange-600' },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                )}
                <div className="text-center">
                  <div className={`bg-gradient-to-r ${step.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mb-2">STEP {i + 1}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Steps */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">For Wholesalers</h2>
          <div className="space-y-12">
            {[
              { icon: UserPlus, num: '01', title: 'Sign Up & Choose Your Plan', desc: 'Register for free and select a plan that matches your business needs. Start with 1 lead per week or scale up to 10 leads per day.', color: 'from-purple-500 to-purple-600' },
              { icon: Download, num: '02', title: 'Receive Verified Leads', desc: 'Leads are automatically delivered to your dashboard based on your plan. Each lead includes verified homeowner information, property address, and contact details.', color: 'from-blue-500 to-blue-600' },
              { icon: Phone, num: '03', title: 'Contact & Track', desc: 'Call your leads and update their status (New, Follow-up, Not Interested, Pending). Set countdown timers for follow-ups and add notes.', color: 'from-indigo-500 to-indigo-600' },
              { icon: TrendingUp, num: '04', title: 'Close More Deals', desc: 'Use our tracking system to manage your pipeline and close more deals. Upgrade your plan anytime to receive more leads.', color: 'from-orange-500 to-orange-600' },
            ].map((step, i) => (
              <div key={i} className="flex items-start space-x-6 bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className={`bg-gradient-to-r ${step.color} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-400 mb-1">STEP {step.num}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Distribution */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Lead Distribution System</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Fair, transparent, and designed for scale</p>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
            <div className="space-y-6">
              {[
                { title: 'Sequential Distribution', desc: 'Each wholesaler gets leads in their own independent sequence. You start from Lead #1 and progress through all available leads.' },
                { title: 'Unlimited Scalability', desc: 'The same lead can be sold to multiple wholesalers on different days. This means unlimited inventory and no competition for leads.' },
                { title: 'Fair & Transparent', desc: 'Everyone gets the same quality leads in the same order. Your position advances daily based on your plan.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-sm">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start?</h2>
          <p className="text-xl text-blue-200 mb-10">
            Join today and get your first leads delivered tomorrow
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30"
          >
            Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="mt-4 text-blue-300 text-sm">No credit card required</p>
        </div>
      </section>

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
