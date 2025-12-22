import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  CheckCircle, Phone, ChevronDown, ChevronUp, MapPin,
  Shield, Star, ArrowRight, FileText, Calendar, RefreshCw,
  PhoneOff, Clock, UserCheck, BadgeCheck, HelpCircle
} from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch latest blog posts
    const fetchBlogPosts = async () => {
      try {
        const { data } = await axios.get('/api/blog?limit=3');
        setBlogPosts(data.posts || []);
      } catch (e) {
        console.error('Failed to fetch blog posts:', e);
      }
    };
    fetchBlogPosts();
  }, []);

  const faqs = [
    { 
      q: 'What does "phone verified" mean?', 
      a: 'Phone verified means our team actively validates the best working number for each homeowner through direct confirmation or confirmation response. We don\'t just pull data — we verify it connects to the actual property owner before delivery.' 
    },
    { 
      q: 'What is ownership matched?', 
      a: 'Ownership matched means we cross-reference public records to confirm the contact is the actual property owner at that address. No renters, no outdated info — just verified homeowners.' 
    },
    { 
      q: 'What qualifies for replacement?', 
      a: 'If a phone number is disconnected, wrong, or doesn\'t reach the property owner, you qualify for a replacement lead. We stand behind our verification standards.' 
    },
    { 
      q: 'Where are leads available?', 
      a: 'We currently serve Texas only. This is by design — limiting our territory allows us to maintain strict verification standards and quality control. Expansion is planned once we can guarantee the same quality.' 
    },
    { 
      q: 'How are leads delivered?', 
      a: 'Leads are delivered daily to your dashboard. You can view, track, and manage all your leads in one place. Export options are available on higher-tier plans.' 
    },
    { 
      q: 'How does the free trial work?', 
      a: 'Start a 3-day free trial on any plan (including Pro). Card required to activate, but you pay $0 during the trial. Cancel anytime before the trial ends and you won\'t be charged.' 
    },
    { 
      q: 'Are leads exclusive?', 
      a: 'We operate a territory-limited rollout in Texas. While leads aren\'t guaranteed exclusive, our quality-controlled supply means you\'re not competing with mass-volume lists that flood the market.' 
    },
  ];

  // FAQ Schema for SEO rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO: FAQ Schema for Google Rich Snippets */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <Navbar />

      {/* ========== HERO SECTION ========== */}
      <section className="min-h-screen w-full flex items-center justify-center relative pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
            <MapPin className="h-4 w-4 text-orange-400 mr-2" />
            <span className="text-white/80 text-sm">Starting in Texas</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Texas-Only.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
              Verified
            </span>{' '}
            on Purpose.
          </h1>
          
          <p className="text-lg md:text-xl mb-4 text-blue-100 max-w-3xl mx-auto">
            We focus on one market to keep quality high — delivering verified homeowner leads 
            that are ownership-matched and phone-verified via direct confirmation for serious Texas wholesalers.
          </p>
          
          {/* Micro-proof line */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-blue-200/70 mb-4">
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1.5 text-green-400" /> Fresh leads daily</span>
            <span className="flex items-center"><RefreshCw className="h-4 w-4 mr-1.5 text-green-400" /> Replacement policy</span>
            <span className="flex items-center"><Phone className="h-4 w-4 mr-1.5 text-green-400" /> Built for real conversations</span>
          </div>
          
          {/* Soundbite */}
          <p className="text-orange-400 font-medium italic mb-6">
            "If the number isn't verified, it's not a lead."
          </p>
          
          {/* CTA Line */}
          <p className="text-white/90 font-medium mb-4">
            Start a 3-Day Free Trial (any plan). <span className="text-orange-400">$0 during trial.</span> Cancel anytime.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/20 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#how-verification-works"
              className="bg-white/5 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition flex items-center justify-center"
            >
              How Verification Works
            </a>
          </div>
          
          {/* Tiny note */}
          <p className="text-xs text-blue-200/50">
            Card required to activate. No charges during trial.
          </p>
        </div>
      </section>

      {/* ========== QUALITY-FIRST ROLLOUT (TEXAS ONLY) ========== */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-orange-500 font-medium italic">"Quality over volume. Always."</p>
          </div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quality-First Rollout (Texas Only)</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Starting in Texas. Scaling too fast kills lead quality — so we're protecting verification standards before expanding.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Shield, 
                title: 'Quality-Controlled Supply', 
                desc: 'Not mass volume. Built for consistency.'
              },
              { 
                icon: Phone, 
                title: 'Manual Phone Verification', 
                desc: 'Phone-verified via direct confirmation.'
              },
              { 
                icon: Clock, 
                title: 'Daily Delivery', 
                desc: 'Fresh leads delivered daily to your dashboard.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <item.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/pricing" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              Check Texas availability
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== WE KNOW YOUR PAIN ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-orange-500 font-medium italic">"Most lists aren't leads — they're homework."</p>
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">We Know Your Pain</h2>
            <p className="text-lg text-gray-600">Every wholesaler hits the same wall: dead numbers, wrong owners, and wasted hours.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: PhoneOff,
                iconBg: 'bg-red-100',
                iconColor: 'text-red-500',
                title: 'Endless Cold Calling', 
                desc: 'Spending hours dialing just to reach voicemails and disconnected lines.',
                soundbite: 'Stop calling ghosts.'
              },
              { 
                icon: UserCheck,
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-500',
                title: 'Wrong Numbers', 
                desc: 'Outdated data wastes money and kills momentum.',
                soundbite: 'Bad data is expensive.'
              },
              { 
                icon: Clock,
                iconBg: 'bg-yellow-100',
                iconColor: 'text-yellow-600',
                title: 'Time Drain', 
                desc: 'Time spent verifying data is time not spent closing deals.',
                soundbite: 'Closers close. We verify.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition">
                <div className={`${item.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.desc}</p>
                <p className="text-sm text-orange-600 font-medium italic">"{item.soundbite}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS (3 STEPS) ========== */}
      <section id="how-verification-works" className="py-16 md:py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-orange-400 font-medium">"We verify first. You close faster."</p>
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-blue-200">Three steps. Real conversations. More deals.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01',
                icon: BadgeCheck,
                title: 'Ownership Matched', 
                desc: 'We cross-reference public records to confirm the contact is the actual property owner at that address.',
                soundbite: 'No renters. No outdated info.'
              },
              { 
                step: '02',
                icon: Phone,
                title: 'Phone Verified', 
                desc: 'Our team validates the best working number through direct confirmation or confirmation response.',
                soundbite: 'We call it first, so you don\'t waste time.'
              },
              { 
                step: '03',
                icon: ArrowRight,
                title: 'Delivered Daily', 
                desc: 'Fresh verified homeowner leads appear in your dashboard every day, ready to call.',
                soundbite: 'Open your dashboard. Start dialing.'
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                )}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                  <div className="text-orange-400 text-sm font-bold mb-3">STEP {item.step}</div>
                  <item.icon className="h-10 w-10 text-white mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-blue-200 mb-4">{item.desc}</p>
                  <p className="text-sm text-orange-400 italic">"{item.soundbite}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SEE WHAT'S INSIDE (DASHBOARD PREVIEW) ========== */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-orange-500 font-medium">"Open your dashboard. Start dialing."</p>
          </div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See What's Inside</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every verified homeowner lead delivered to your dashboard, ready to call.
            </p>
          </div>
          
          {/* Dashboard Screenshot */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <img 
                src="https://storage.googleapis.com/msgsndr/xzA6eU8kOYmBuwFdr3CF/media/694915d4aca6ab114d0cc76a.png" 
                alt="VerifiedHomeowner Dashboard - My Leads view showing verified homeowner contacts with phone numbers and Texas property addresses"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            
            {/* Feature Callouts */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: '👤', label: 'Contact Name' },
                { icon: '📞', label: 'Verified Phone' },
                { icon: '🏠', label: 'Texas Address' },
                { icon: '📊', label: 'Status Tracking' },
                { icon: '⚡', label: 'Action to Take Now' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-gray-200 text-center">
                  <span className="text-xl mb-1 block">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link
              to="/register"
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/20"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== VERIFICATION STANDARDS ========== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Verification Standards</h2>
            <p className="text-lg text-gray-600">"If the number isn't verified, it's not a lead."</p>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { 
                  icon: BadgeCheck, 
                  title: 'Ownership Matched', 
                  desc: 'Public record cross-reference confirms property ownership',
                  color: 'text-blue-600'
                },
                { 
                  icon: Phone, 
                  title: 'Phone Verified', 
                  desc: 'Direct confirmation or confirmation response validates the number',
                  color: 'text-green-600',
                  tooltip: 'Our team actively validates the best working number for each homeowner.'
                },
                { 
                  icon: Clock, 
                  title: 'Delivered Daily', 
                  desc: 'Fresh leads to your dashboard every day',
                  color: 'text-orange-500'
                },
                { 
                  icon: RefreshCw, 
                  title: 'Replacement Policy', 
                  desc: 'Invalid contacts are replaced — we stand behind our data',
                  color: 'text-purple-600'
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`${item.color} mt-1`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      {item.tooltip && (
                        <div className="group relative">
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {item.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== PLANS + 3-DAY FREE TRIAL ========== */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Plans + 3-Day Free Trial</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Try any plan free for 3 days. Card required to activate, but you pay <span className="font-semibold text-orange-500">$0 during trial</span>. Cancel anytime.
            </p>
          </div>
          
          {/* Plan Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              { name: 'Free', price: '$0', leads: '1 lead/day', features: ['1 state coverage', 'Lead tracking', 'Basic dashboard'] },
              { name: 'Basic', price: '$29', leads: '5 leads/day', features: ['3 states coverage', 'Marketplace access', 'Priority support'], popular: true },
              { name: 'Elite', price: '$99', leads: '10 leads/day', features: ['5 states coverage', 'Advanced analytics', 'Premium support'] },
              { name: 'Pro', price: '$149', leads: '20 leads/day', features: ['7 states coverage', 'Export data', 'VIP support'] },
            ].map((plan, i) => (
              <div key={i} className={`bg-white rounded-xl p-5 border-2 transition ${plan.popular ? 'border-orange-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
                {plan.popular && (
                  <div className="text-xs font-bold text-orange-500 uppercase mb-2">Most Popular</div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 my-2">{plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                <div className="text-sm text-blue-600 font-medium mb-4">{plan.leads}</div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-2 px-4 rounded-lg font-medium transition ${
                    plan.popular 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === '$0' ? 'Get Started' : 'Start Trial'}
                </Link>
              </div>
            ))}
          </div>
          
          {/* Trial FAQ Mini */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Trial FAQ
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-900">When will I be charged?</p>
                <p className="text-gray-600">Only after your 3-day trial ends. Cancel before then and pay nothing.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Can I cancel anytime?</p>
                <p className="text-gray-600">Yes. Cancel from your dashboard anytime — no calls, no hassle.</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Can I try the Pro plan?</p>
                <p className="text-gray-600">Absolutely. The 3-day free trial works on any plan, including Pro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about verified homeowner leads</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 text-left">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
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

      {/* ========== FINAL CTA ========== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-orange-400 font-medium text-lg mb-4">"We verify first. You close faster."</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Talk to Real Homeowners?
          </h2>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Stop wasting hours on dead numbers. Start your 3-day free trial and experience what verified homeowner leads feel like.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/20 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className="bg-white/5 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition"
            >
              View All Plans
            </Link>
          </div>
          
          <p className="text-xs text-blue-200/50">
            Card required to activate. $0 during trial. Cancel anytime.
          </p>
          
          {/* Compliance line */}
          <p className="text-xs text-blue-200/40 mt-8">
            We honor opt-out and do-not-contact requests.
          </p>
        </div>
      </section>

      {/* ========== BLOG SECTION ========== */}
      {blogPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest from Our Blog</h2>
              <p className="text-lg text-gray-600">Tips and insights for Texas wholesalers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="h-44 overflow-hidden bg-gray-100">
                      {post.bannerImage ? (
                        <img
                          src={post.bannerImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      {post.category && (
                        <span className="text-blue-600 text-xs font-medium mb-2">{post.category}</span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Articles
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
