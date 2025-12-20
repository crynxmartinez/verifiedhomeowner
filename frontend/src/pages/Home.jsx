import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { 
  TrendingUp, Users, Zap, CheckCircle, Phone, Target, 
  Clock, Shield, ChevronDown, ChevronUp, MapPin, Home as HomeIcon,
  DollarSign, BarChart3, Headphones, Star, ArrowRight, FileText, Calendar
} from 'lucide-react';
import axios from 'axios';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

export default function Home() {
  const [images, setImages] = useState({
    hero: '',
    solution: '',
    problems: ['', '', ''],
    roles: ['', '', ''],
    cta: ''
  });
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
    
    const fetchImage = async (query, key, isArray = false, index = 0) => {
      if (!PEXELS_API_KEY) return;
      try {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
          { headers: { Authorization: PEXELS_API_KEY } }
        );
        const data = await res.json();
        if (data.photos?.[0]) {
          const url = data.photos[0].src.large2x;
          setImages(prev => {
            if (isArray) {
              const newArr = [...prev[key]];
              newArr[index] = url;
              return { ...prev, [key]: newArr };
            }
            return { ...prev, [key]: url };
          });
        }
      } catch (e) {}
    };

    // Fetch all images
    fetchImage('aerial view suburban houses neighborhood', 'hero');
    fetchImage('real estate deal handshake success', 'solution');
    fetchImage('luxury modern house exterior', 'cta');
    
    // Problem images
    ['frustrated man phone call office', 'confused person looking at papers', 'stressed businessman desk'].forEach((q, i) => 
      fetchImage(q, 'problems', true, i)
    );
    
    // Role images
    ['real estate investor meeting', 'business professional office', 'real estate agent showing house'].forEach((q, i) => 
      fetchImage(q, 'roles', true, i)
    );
  }, []);

  const faqs = [
    { q: 'How do I receive my leads?', a: 'Leads are delivered directly to your dashboard daily (or weekly for free plans). You\'ll see them in your "Call Now" queue ready to contact.' },
    { q: 'Are the phone numbers verified?', a: 'Yes! Every lead goes through our verification process. We call and confirm the number connects to the actual property owner before delivering it to you.' },
    { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no commitments. Cancel your subscription anytime from your account settings.' },
    { q: 'What areas do you cover?', a: 'We currently provide leads nationwide across all 50 US states. You can filter by state, city, or zip code.' },
    { q: 'How is this different from skip tracing?', a: 'Skip tracing gives you raw data that may be outdated. We deliver pre-verified, ready-to-call leads. No more wrong numbers or disconnected lines.' },
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

      {/* Hero Section */}
      <section className="min-h-screen w-full flex items-center justify-center relative pt-16 overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: images.hero ? `url(${images.hero})` : 'none' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/95 to-blue-900/95"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Star className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-white/90 text-sm">Trusted by 500+ Real Estate Professionals</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Verified Homeowner</span>
            <br />Leads Delivered Daily
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto">
            Stop wasting time on wrong numbers and dead ends.
          </p>
          <p className="text-lg mb-10 text-blue-200/80 max-w-2xl mx-auto">
            Every verified homeowner contact is confirmed before delivery. No skip tracing needed.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30 flex items-center justify-center"
            >
              Start Free Plan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition"
            >
              View Pricing
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">10K+</div>
              <div className="text-blue-200/70 text-sm">Leads Delivered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">99%</div>
              <div className="text-blue-200/70 text-sm">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white">24hr</div>
              <div className="text-blue-200/70 text-sm">Delivery Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in minutes, receive leads daily</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: 'Sign Up', desc: 'Create your free account in under 2 minutes', color: 'bg-blue-600' },
              { icon: Target, title: 'Choose Plan', desc: 'Select a plan based on how many leads you need', color: 'bg-blue-500' },
              { icon: Phone, title: 'Receive Leads', desc: 'Get verified homeowner leads delivered to your dashboard daily', color: 'bg-blue-600' },
              { icon: DollarSign, title: 'Close Deals', desc: 'Call verified numbers and close more deals', color: 'bg-orange-500' },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                )}
                <div className="text-center">
                  <div className={`${step.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
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

      {/* Pain Points Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">We Know Your Pain</h2>
            <p className="text-xl text-gray-600">Every wholesaler faces these frustrating problems</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                img: images.problems[0], 
                icon: '📞', 
                title: 'Endless Cold Calling', 
                desc: 'Spending hours dialing numbers only to reach voicemails and disconnected lines.',
                stat: '80%',
                statLabel: 'of cold calls fail'
              },
              { 
                img: images.problems[1], 
                icon: '❌', 
                title: 'Wrong Numbers', 
                desc: 'Outdated skip tracing data means wasted time and money on leads that go nowhere.',
                stat: '$500+',
                statLabel: 'wasted monthly'
              },
              { 
                img: images.problems[2], 
                icon: '⏰', 
                title: 'Time Drain', 
                desc: 'Hours spent researching, skip tracing, and verifying data instead of closing deals.',
                stat: '20hrs',
                statLabel: 'lost per week'
              },
            ].map((item, i) => (
              <div key={i} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="h-48 overflow-hidden relative">
                  {item.img ? (
                    <img src={item.img} alt={`${item.title} - Real estate wholesaling challenge for verified homeowner leads`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center">
                      <span className="text-6xl">{item.icon}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {item.stat}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-3">{item.desc}</p>
                  <p className="text-sm text-orange-500 font-medium">{item.statLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: images.solution ? `url(${images.solution})` : 'none' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/95 to-blue-900/95"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">We Solve All That</h2>
            <p className="text-xl text-blue-100">So you can focus on what matters - closing deals</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'Verified Numbers', desc: 'Every phone number is called and verified before delivery' },
              { icon: Clock, title: 'Daily Delivery', desc: 'Fresh leads delivered to your dashboard every single day' },
              { icon: Shield, title: 'Accurate Data', desc: '99% accuracy rate on all contact information' },
              { icon: Zap, title: 'Instant Access', desc: 'No waiting - leads appear in your dashboard immediately' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition">
                <item.icon className="h-12 w-12 text-orange-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Built For Real Estate Pros</h2>
            <p className="text-xl text-gray-600">Whether you're just starting or scaling your business</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                img: images.roles[0], 
                title: 'Wholesalers', 
                desc: 'Find motivated sellers faster and close more deals with verified homeowner contacts.',
                features: ['Daily lead delivery', 'Verified phone numbers', 'Property details included']
              },
              { 
                img: images.roles[1], 
                title: 'Investors', 
                desc: 'Build your portfolio with quality leads. No more chasing bad data.',
                features: ['Nationwide coverage', 'Owner information', 'Mailing addresses']
              },
              { 
                img: images.roles[2], 
                title: 'Agents', 
                desc: 'Connect with homeowners ready to sell. Grow your listings effortlessly.',
                features: ['Fresh leads daily', 'Contact tracking', 'Notes & follow-ups']
              },
            ].map((role, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="h-56 overflow-hidden">
                  {role.img ? (
                    <img src={role.img} alt={`${role.title} using verified homeowner leads for real estate success`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-blue-100"></div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600 mb-4">{role.desc}</p>
                  <ul className="space-y-2">
                    {role.features.map((f, j) => (
                      <li key={j} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Leads Delivered' },
              { value: '500+', label: 'Active Users' },
              { value: '99%', label: 'Accuracy Rate' },
              { value: '50', label: 'States Covered' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition"
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

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest from Our Blog</h2>
              <p className="text-xl text-gray-600">Tips, insights, and success stories for wholesalers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {post.bannerImage ? (
                        <img
                          src={post.bannerImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      {post.category && (
                        <span className="text-blue-600 text-sm font-medium mb-2">{post.category}</span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg"
              >
                View All Articles
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: images.cta ? `url(${images.cta})` : 'none' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Verified Homeowner Leads?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of real estate professionals who close more deals with verified homeowner data.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30 flex items-center justify-center"
            >
              Start Free Plan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/pricing"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition"
            >
              View Pricing
            </Link>
          </div>
          <p className="mt-6 text-gray-400 text-sm">No credit card required. Start with our free plan.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Verified Homeowner</h3>
              <p className="text-sm leading-relaxed">
                Quality verified leads for real estate wholesalers. Stop wasting time on bad data.
              </p>
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
                <li><Link to="/refund" className="hover:text-white transition">Cancellation Policy</Link></li>
              </ul>
            </div>
          </div>

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
