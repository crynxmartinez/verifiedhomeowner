import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { TrendingUp, Users, Zap } from 'lucide-react';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export default function Home() {
  const [heroImage, setHeroImage] = useState('');
  const [solutionImage, setSolutionImage] = useState('');
  const [problemImages, setProblemImages] = useState(['', '', '']);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch hero image - modern house
    fetch('https://api.pexels.com/v1/search?query=modern+house+exterior&per_page=1&orientation=landscape', {
      headers: { Authorization: PEXELS_API_KEY }
    })
      .then(res => res.json())
      .then(data => {
        if (data.photos?.[0]) setHeroImage(data.photos[0].src.large2x);
      })
      .catch(() => {});

    // Fetch solution section image - real estate success
    fetch('https://api.pexels.com/v1/search?query=real+estate+agent+handshake&per_page=1&orientation=landscape', {
      headers: { Authorization: PEXELS_API_KEY }
    })
      .then(res => res.json())
      .then(data => {
        if (data.photos?.[0]) setSolutionImage(data.photos[0].src.large2x);
      })
      .catch(() => {});

    // Fetch problem section images
    const problemQueries = ['frustrated+phone+call', 'confused+person+computer', 'stressed+office+work'];
    problemQueries.forEach((query, index) => {
      fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=square`, {
        headers: { Authorization: PEXELS_API_KEY }
      })
        .then(res => res.json())
        .then(data => {
          if (data.photos?.[0]) {
            setProblemImages(prev => {
              const newImages = [...prev];
              newImages[index] = data.photos[0].src.medium;
              return newImages;
            });
          }
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Full Screen with Background Image */}
      <section className="min-h-screen w-full flex items-center justify-center relative pt-16">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: heroImage ? `url(${heroImage})` : 'none',
            backgroundColor: '#e0f2fe'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/90 to-blue-500/90"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <img src="/logo.png" alt="Verified Homeowner" className="h-24 mx-auto mb-8 drop-shadow-lg" />
          <h1 className="text-6xl font-bold mb-6 text-white drop-shadow-lg">
            Stop Wasting Time on Bad Leads
          </h1>
          <p className="text-3xl mb-4 text-white font-semibold drop-shadow-md">
            No More Wrong Numbers. No More Skip Tracing. No More Dead Ends.
          </p>
          <p className="text-xl mb-8 text-sky-100 max-w-3xl mx-auto drop-shadow">
            Get verified, ready-to-call homeowner leads delivered daily. We handle the research, you close the deals.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-sky-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-sky-50 transition shadow-lg hover:shadow-xl"
            >
              Start Free Plan
            </Link>
            <Link
              to="/how-it-works"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-sky-600 transition shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-sky-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-900">We Know Your Pain</h2>
          <p className="text-2xl text-center mb-16 text-gray-600">Every wholesaler faces the same frustrating problems...</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-sky-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
              {problemImages[0] && (
                <div className="h-40 -mx-8 -mt-8 mb-6 overflow-hidden">
                  <img src={problemImages[0]} alt="Calling frustration" className="w-full h-full object-cover" />
                </div>
              )}
              {!problemImages[0] && <div className="text-6xl mb-4">📞</div>}
              <h3 className="text-2xl font-bold mb-4 text-sky-700">Calling Thousands</h3>
              <p className="text-gray-600">
                Spending hours dialing number after number, only to reach voicemails and disconnected lines.
              </p>
            </div>
            <div className="bg-white border border-sky-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
              {problemImages[1] && (
                <div className="h-40 -mx-8 -mt-8 mb-6 overflow-hidden">
                  <img src={problemImages[1]} alt="Wrong numbers" className="w-full h-full object-cover" />
                </div>
              )}
              {!problemImages[1] && <div className="text-6xl mb-4">❌</div>}
              <h3 className="text-2xl font-bold mb-4 text-sky-700">Wrong Numbers</h3>
              <p className="text-gray-600">
                Outdated data means wasted time and money on leads that go nowhere.
              </p>
            </div>
            <div className="bg-white border border-sky-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
              {problemImages[2] && (
                <div className="h-40 -mx-8 -mt-8 mb-6 overflow-hidden">
                  <img src={problemImages[2]} alt="Skip tracing" className="w-full h-full object-cover" />
                </div>
              )}
              {!problemImages[2] && <div className="text-6xl mb-4">🔍</div>}
              <h3 className="text-2xl font-bold mb-4 text-sky-700">Skip Tracing Hell</h3>
              <p className="text-gray-600">
                Paying for expensive skip tracing services just to find current contact information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="min-h-screen w-full flex items-center justify-center relative py-20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: solutionImage ? `url(${solutionImage})` : 'none',
            backgroundColor: '#0ea5e9'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/95 to-blue-600/95"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8 text-white drop-shadow-lg">We Remove All That</h2>
          <p className="text-3xl mb-12 font-semibold text-white drop-shadow-md">And Give You More Time to Close Deals</p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border border-white/30 hover:bg-white/30 transition">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Verified Contact Info</h3>
              <p className="text-sky-100 text-lg">
                Every lead comes with verified phone numbers and property owner information. No more wrong numbers.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border border-white/30 hover:bg-white/30 transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Pre-Verified Leads</h3>
              <p className="text-sky-100 text-lg">
                We do the research, skip tracing, and calling for you. Get leads that we already verified as correct numbers.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border border-white/30 hover:bg-white/30 transition">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Daily Delivery</h3>
              <p className="text-sky-100 text-lg">
                Fresh leads delivered to your dashboard every day. No pulling lists, no data cleanup.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-xl border border-white/30 hover:bg-white/30 transition">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-4 text-white">More Time = More Deals</h3>
              <p className="text-sky-100 text-lg">
                Spend your time talking to motivated sellers, not chasing bad data. Close more deals, faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Full Screen */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8 text-gray-900">How It Works</h2>
          <p className="text-xl text-center mb-16 text-gray-600">Simple, efficient, and designed for wholesalers</p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">1. Sign Up</h3>
              <p className="text-gray-600 text-lg">
                Create your account and choose a plan that fits your needs. Start with our free plan.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">2. Receive Leads</h3>
              <p className="text-gray-600 text-lg">
                Get verified homeowner leads delivered to your dashboard daily based on your plan.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">3. Close Deals</h3>
              <p className="text-gray-600 text-lg">
                Contact leads, track your progress, and close more deals with our easy-to-use system.
              </p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="text-center mt-16">
            <Link
              to="/register"
              className="inline-block bg-sky-500 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-sky-600 transition shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </div>
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
