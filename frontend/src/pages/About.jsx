import Navbar from '../components/Navbar';
import { Target, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <img src="/logo.png" alt="Verified Homeowner" className="h-24 mx-auto mb-8" />
          <h1 className="text-6xl font-bold mb-6">About Verified Homeowner</h1>
          <p className="text-2xl text-blue-100 mb-4">
            We understand the real estate wholesaling game because we've lived it.
          </p>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            We built this platform to solve the problems that waste your time and money every single day.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12">The Problem We Saw</h2>
          <div className="space-y-8 text-lg text-gray-300">
            <p className="text-2xl leading-relaxed">
              Every day, thousands of real estate wholesalers waste countless hours calling homeowners who:
            </p>
            <ul className="space-y-4 text-xl">
              <li className="flex items-start">
                <span className="text-red-400 mr-4 text-3xl">•</span>
                <span>Have disconnected phone numbers</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-4 text-3xl">•</span>
                <span>Gave wrong contact information</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-4 text-3xl">•</span>
                <span>Aren't actually interested in selling</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-4 text-3xl">•</span>
                <span>Have outdated property information</span>
              </li>
            </ul>
            <p className="text-2xl leading-relaxed mt-8">
              On top of that, wholesalers spend thousands on skip tracing services, data providers, and list pulling tools—only to end up with the same frustrating results.
            </p>
            <p className="text-2xl font-semibold text-red-400 mt-8">
              This isn't just inefficient. It's killing your business.
            </p>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-900">Our Solution</h2>
          <div className="space-y-8 text-lg text-gray-700">
            <p className="text-2xl leading-relaxed">
              We remove all those problems and give you what you actually need:
            </p>
            <div className="bg-green-50 border-l-4 border-green-600 p-8 my-8">
              <p className="text-2xl font-bold text-green-800 mb-4">
                Verified, ready-to-call homeowner leads delivered daily.
              </p>
              <p className="text-xl text-green-700">
                No wrong numbers. No skip tracing. No wasted time.
              </p>
            </div>
            <p className="text-xl leading-relaxed">
              We do all the heavy lifting:
            </p>
            <ul className="space-y-4 text-xl">
              <li className="flex items-start">
                <span className="text-green-600 mr-4 text-3xl">✓</span>
                <span><strong>Verify every phone number</strong> so you're calling real, working numbers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-4 text-3xl">✓</span>
                <span><strong>Research property owners</strong> and their motivation to sell</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-4 text-3xl">✓</span>
                <span><strong>Identify selling timelines</strong> so you know who's ready now</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-4 text-3xl">✓</span>
                <span><strong>Deliver fresh leads daily</strong> directly to your dashboard</span>
              </li>
            </ul>
            <p className="text-2xl font-semibold text-green-600 mt-8">
              You focus on what you do best: talking to sellers and closing deals.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Values, Promise */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg">
                To eliminate the time-wasting problems that hold wholesalers back and give them more time to close deals.
              </p>
            </div>
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Values</h3>
              <p className="text-gray-600 text-lg">
                Quality over quantity. Every lead is verified, researched, and ready to contact. No filler, no fluff.
              </p>
            </div>
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
              <p className="text-gray-600 text-lg">
                Verified contact information, motivated sellers, and daily delivery. We guarantee it or your money back.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Verified Homeowner CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
