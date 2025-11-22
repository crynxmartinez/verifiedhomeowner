import Navbar from '../components/Navbar';
import { Target, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">About Us</h1>
          <p className="text-2xl text-blue-100">
            We're on a mission to connect wholesalers with verified homeowner leads
          </p>
        </div>
      </section>

      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg">
                To provide wholesalers with high-quality, verified homeowner leads that help them grow their business efficiently.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Values</h3>
              <p className="text-gray-600 text-lg">
                We believe in transparency, quality, and helping our customers succeed. Every lead is verified and ready to contact.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
              <p className="text-gray-600 text-lg">
                We guarantee verified information, fair distribution, and dedicated support to help you close more deals.
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
