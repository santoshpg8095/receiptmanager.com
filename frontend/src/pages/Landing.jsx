import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaReceipt, 
  FaShieldAlt, 
  FaEnvelope, 
  FaQrcode, 
  FaChartLine, 
  FaMobileAlt,
  FaCheck,
  FaUsers,
  FaClock,
  FaStar,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const features = [
    {
      icon: <FaReceipt className="text-4xl" />,
      title: 'Instant Receipt Generation',
      description: 'Create professional receipts in seconds with auto-numbering and templates.',
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: 'Tamper-Proof Security',
      description: 'Military-grade encryption and QR codes prevent forgery and ensure authenticity.',
    },
    {
      icon: <FaEnvelope className="text-4xl" />,
      title: 'Automated Email Delivery',
      description: 'Send receipts directly to tenants via email with personalized messages.',
    },
    {
      icon: <FaQrcode className="text-4xl" />,
      title: 'QR Code Verification',
      description: 'Tenants can instantly verify receipt authenticity by scanning QR code.',
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: 'Dashboard Analytics',
      description: 'Track payments, generate reports, and get financial insights.',
    },
    {
      icon: <FaMobileAlt className="text-4xl" />,
      title: 'Mobile Optimized',
      description: 'Fully responsive design works perfectly on all devices.',
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'PG Owner, Bangalore',
      content: 'This app saved me hours of manual work. The QR verification feature gives me and my tenants complete peace of mind.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Hostel Manager, Delhi',
      content: 'Professional receipts, easy tracking, and automated emails. Exactly what I needed for my hostel business.',
      rating: 5,
    },
    {
      name: 'Anil Patel',
      role: 'Property Manager, Mumbai',
      content: 'The dashboard helps me track all payments at a glance. My accountant loves the organized reports.',
      rating: 4,
    },
  ];

  const faqs = [
    {
      question: 'Is PG Receipts free to use?',
      answer: 'Yes! We offer a free plan with basic features. Paid plans start at ₹299/month for advanced features.',
    },
    {
      question: 'Do I need technical skills to use it?',
      answer: 'Not at all. Our platform is designed to be intuitive and user-friendly. No technical knowledge required.',
    },
    {
      question: 'Can I customize the receipt design?',
      answer: 'Yes, you can add your PG logo, change colors, and customize fields to match your brand.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and secure servers. Your data is never shared with third parties.',
    },
    {
      question: 'Can I access from mobile?',
      answer: 'Yes, our platform is fully responsive and works perfectly on smartphones, tablets, and desktops.',
    },
    {
      question: 'How do I get support?',
      answer: 'We offer email support, live chat, and comprehensive documentation. Response time is under 2 hours.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active PG Owners' },
    { value: '50,000+', label: 'Receipts Generated' },
    { value: '₹5Cr+', label: 'Transaction Value' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-6">
              <FaStar className="mr-2" /> Trusted by 500+ PG Owners
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Receipts for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                PG & Hostels
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Automate your rent collection with secure, tamper-proof receipts. 
              Save time, reduce errors, and provide premium service to your tenants.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-blue-500/30"
              >
                Start Free Trial
                <FaArrowRight className="ml-3" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-800 font-bold rounded-xl text-lg border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From receipt generation to payment tracking, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="text-blue-600 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Fast & Secure
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in minutes. No training required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent hidden md:block" />
              <h3 className="text-xl font-bold mb-4">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and add your PG details in 2 minutes.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent hidden md:block" />
              <h3 className="text-xl font-bold mb-4">Generate Receipt</h3>
              <p className="text-gray-600">
                Fill tenant details and generate secure receipts instantly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Send & Track</h3>
              <p className="text-gray-600">
                Email receipts automatically and track from dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by PG Owners
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of satisfied PG owners across India.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about PG Receipts.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-300 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <FaChevronUp className="text-blue-600" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="mt-2 p-6 bg-blue-50 rounded-xl">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using PG Receipts, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Service Description</h3>
                  <p>
                    PG Receipts provides an online platform for PG owners and managers to generate, manage, and track payment receipts.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You agree to use the service only for lawful purposes</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Payment Terms</h3>
                  <p>
                    Free plan includes basic features. Premium features require subscription payment. All payments are non-refundable.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Limitation of Liability</h3>
                  <p>
                    PG Receipts shall not be liable for any indirect, incidental, special, consequential or punitive damages.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Termination</h3>
                  <p>
                    We reserve the right to terminate or suspend access to our service immediately, without prior notice.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Changes to Terms</h3>
                  <p>
                    We reserve the right to modify these terms at any time. Users will be notified of any changes.
                  </p>
                </section>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Account information (name, email, PG details)</li>
                    <li>Receipt data (tenant information, payment details)</li>
                    <li>Usage data (how you use our platform)</li>
                    <li>Device information (IP address, browser type)</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>To provide and maintain our service</li>
                    <li>To process transactions</li>
                    <li>To send important notifications</li>
                    <li>To improve our services</li>
                    <li>To comply with legal obligations</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Data Security</h3>
                  <p>
                    We implement industry-standard security measures including encryption, firewalls, and secure servers to protect your data.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Retention</h3>
                  <p>
                    We retain your data only for as long as necessary to provide our services and comply with legal requirements.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Third-Party Services</h3>
                  <p>
                    We use trusted third-party services for payment processing and email delivery. These services have their own privacy policies.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Right to access your personal data</li>
                    <li>Right to correct inaccurate data</li>
                    <li>Right to delete your data</li>
                    <li>Right to data portability</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h3>
                  <p>
                    We use cookies to improve your experience. You can control cookies through your browser settings.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Contact Us</h3>
                  <p>
                    For privacy-related questions, contact us at privacy@pgreceipts.com
                  </p>
                </section>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Streamline Your PG Management?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of PG owners who trust us for secure receipt management. 
            No credit card required to start.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Start Your Free Trial
            <FaArrowRight className="ml-3" />
          </Link>
          <p className="text-blue-200 mt-6">
            ✓ No setup fees • ✓ Cancel anytime • ✓ 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <FaReceipt className="mr-2" />
                PG Receipts
              </h3>
              <p className="text-gray-400 mb-6">
                Professional receipt management system for PG owners and hostel managers across India.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaFacebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaTwitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaLinkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaInstagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/verify" className="text-gray-400 hover:text-white transition">
                    Verify Receipt
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowTerms(true)}
                    className="text-gray-400 hover:text-white transition text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowPrivacy(true)}
                    className="text-gray-400 hover:text-white transition text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Features</h4>
              <ul className="space-y-3">
                <li className="text-gray-400">Receipt Generation</li>
                <li className="text-gray-400">QR Code Verification</li>
                <li className="text-gray-400">Email Automation</li>
                <li className="text-gray-400">Dashboard Analytics</li>
                <li className="text-gray-400">Mobile App</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-gray-400" />
                  <span className="text-gray-400">
                    123 Tech Park, Bangalore<br />
                    Karnataka, India 560001
                  </span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-gray-400" />
                  <a href="tel:+919876543210" className="text-gray-400 hover:text-white transition">
                    +91 98765 43210
                  </a>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-3 text-gray-400" />
                  <a href="mailto:support@pgreceipts.com" className="text-gray-400 hover:text-white transition">
                    support@pgreceipts.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} PG Receipts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;