import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UserPlus, Download, Phone, TrendingUp, BarChart, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">How It Works</h1>
          <p className="text-2xl text-blue-100">
            Simple, efficient, and designed for wholesalers
          </p>
        </div>
      </section>

      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">For Wholesalers</h2>
          <div className="space-y-16">
            <div className="flex items-start space-x-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">1. Sign Up & Choose Your Plan</h3>
                <p className="text-gray-600 text-lg">
                  Register for free and select a plan that matches your business needs. Start with 1 lead per week or scale up to 10 leads per day.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">2. Receive Verified Leads</h3>
                <p className="text-gray-600 text-lg">
                  Leads are automatically delivered to your dashboard based on your plan. Each lead includes verified homeowner information, property address, and contact details.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">3. Contact & Track</h3>
                <p className="text-gray-600 text-lg">
                  Call your leads and update their status (New, Called, Follow-up, Not Interested). Set reminders for follow-ups and add notes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">4. Close More Deals</h3>
                <p className="text-gray-600 text-lg">
                  Use our tracking system to manage your pipeline and close more deals. Upgrade your plan anytime to receive more leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Lead Distribution System</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Sequential Distribution</h4>
                  <p className="text-gray-600">
                    Each wholesaler gets leads in their own independent sequence. You start from Lead #1 and progress through all available leads.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Unlimited Scalability</h4>
                  <p className="text-gray-600">
                    The same lead can be sold to multiple wholesalers on different days. This means unlimited inventory and no competition for leads.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Fair & Transparent</h4>
                  <p className="text-gray-600">
                    Everyone gets the same quality leads in the same order. Your position advances daily based on your plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-2xl mb-8 text-blue-100">
            Join today and get your first leads delivered tomorrow
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-blue-50 transition"
          >
            Sign Up Now
          </Link>
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
