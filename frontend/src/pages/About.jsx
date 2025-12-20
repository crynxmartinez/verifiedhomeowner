import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
      <section className="pt-24 pb-32 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 my-8">
              <p className="text-2xl font-bold text-blue-800 mb-4 text-center">
                Verified, ready-to-call homeowner leads delivered daily.
              </p>
              <p className="text-xl text-blue-700 text-center">
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
                  <CheckCircle className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-gray-900">{item.title}</span>
                    <span className="text-gray-600"> {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
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
              { icon: Target, title: 'Our Mission', desc: 'To eliminate the time-wasting problems that hold wholesalers back and give them more time to close deals.', color: 'from-blue-600 to-blue-700' },
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

      <Footer />
    </div>
  );
}
