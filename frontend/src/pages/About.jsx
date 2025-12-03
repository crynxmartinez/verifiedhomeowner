import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Target, Heart, Award, CheckCircle, ArrowRight } from 'lucide-react';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export default function About() {
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
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">About Us</h1>
          <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mx-auto">
            We understand the real estate wholesaling game because we've lived it.
            We built this platform to solve the problems that waste your time and money.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">The Problem We Saw</h2>
          <div className="space-y-8 text-lg text-gray-300">
            <p className="text-xl md:text-2xl leading-relaxed">
              Every day, thousands of real estate wholesalers waste countless hours calling homeowners who:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Have disconnected phone numbers',
                'Gave wrong contact information',
                'Aren\'t actually interested in selling',
                'Have outdated property information'
              ].map((item, i) => (
                <div key={i} className="flex items-center bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <span className="text-red-400 mr-3 text-2xl">✕</span>
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xl leading-relaxed mt-8">
              On top of that, wholesalers spend thousands on skip tracing services, data providers, and list pulling tools—only to end up with the same frustrating results.
            </p>
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6 mt-8">
              <p className="text-2xl font-semibold text-red-400">
                This isn't just inefficient. It's killing your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">Our Solution</h2>
          <div className="space-y-8">
            <p className="text-xl text-gray-600 leading-relaxed text-center">
              We remove all those problems and give you what you actually need:
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 my-8">
              <p className="text-2xl font-bold text-green-800 mb-4 text-center">
                Verified, ready-to-call homeowner leads delivered daily.
              </p>
              <p className="text-xl text-green-700 text-center">
                No wrong numbers. No skip tracing. No wasted time.
              </p>
            </div>
            <p className="text-xl text-gray-600 text-center mb-8">
              We do all the heavy lifting:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Verify every phone number', desc: 'so you\'re calling real, working numbers' },
                { title: 'Research property owners', desc: 'and their motivation to sell' },
                { title: 'Identify selling timelines', desc: 'so you know who\'s ready now' },
                { title: 'Deliver fresh leads daily', desc: 'directly to your dashboard' },
              ].map((item, i) => (
                <div key={i} className="flex items-start bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <span className="text-gray-600"> {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                You focus on what you do best: talking to sellers and closing deals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Values, Promise */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To eliminate the time-wasting problems that hold wholesalers back and give them more time to close deals.', color: 'from-purple-500 to-purple-600' },
              { icon: Heart, title: 'Our Values', desc: 'Quality over quantity. Every lead is verified, researched, and ready to contact. No filler, no fluff.', color: 'from-blue-500 to-blue-600' },
              { icon: Award, title: 'Our Promise', desc: 'Verified contact information, motivated sellers, and daily delivery. We guarantee it or your money back.', color: 'from-orange-500 to-orange-600' },
            ].map((item, i) => (
              <div key={i} className="text-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
                <div className={`bg-gradient-to-r ${item.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
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
