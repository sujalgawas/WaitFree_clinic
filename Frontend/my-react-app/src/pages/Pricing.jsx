import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Heart, IndianRupee, Users, MapPin, Clock, Brain, AlertCircle, Loader } from 'lucide-react';

export default function PricingPage({ darkMode, setCurrentPage }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const plans = [
    {
      name: 'Basic',
      type: 'basic',
      price: billingCycle === 'monthly' ? 999 : 9999,
      originalPrice: billingCycle === 'monthly' ? 1199 : 11999,
      icon: Heart,
      color: 'blue',
      features: [
        'Account setup on WaitFree Clinic Platform',
        'Basic patient management',
        'AI-assisted appointment scheduling',
        'Patient search for your profile',
        'Email support for doctors',
        'Basic analytics dashboard'
      ],
      popular: false
    },
    {
      name: 'Premium',
      type: 'premium',
      price: billingCycle === 'monthly' ? 1999 : 19999,
      originalPrice: billingCycle === 'monthly' ? 2399 : 23999,
      icon: Star,
      color: 'purple',
      features: [
        'Everything in Basic',
        'Advanced AI diagnostics assistance',
        'Real-time patient location tracking',
        'Waiting time estimation & queue management',
        'Integrated telemedicine tools',
        'Priority patient notifications',
        'Customizable doctor profile for patient search',
        '24/7 chat support for doctors',
        'Enhanced analytics with patient insights'
      ],
      popular: true
    },
    {
      name: 'Pro',
      type: 'pro',
      price: billingCycle === 'monthly' ? 2999 : 29999,
      originalPrice: billingCycle === 'monthly' ? 3599 : 35999,
      icon: Zap,
      color: 'green',
      features: [
        'Everything in Premium',
        'Full AI-powered clinic automation',
        'Predictive health analytics for patients',
        'Zero-waiting-time virtual queues',
        'Multi-location clinic management',
        'Dedicated health coach integration',
        'Exclusive research access & data insights',
        'Family plan management for patients',
        'Emergency response protocols',
        'White-label customization'
      ],
      popular: false
    }
  ];

  const handleStartTrial = async (planType) => {
  setError('');
  setLoading(true);

  const token = localStorage.getItem('token');
  
  // Use a constant for the API URL
  const API_BASE_URL = 'http://127.0.0.1:5000'; 

  try {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        plan_type: planType,
        billing_cycle: billingCycle
      }),
    });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.checkout_url) {
        console.log('Redirecting to:', data.checkout_url);
        window.location.href = data.checkout_url;
      } else {
        setError(data.message || 'Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'An error occurred. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className={`rounded-3xl p-8 mb-12 text-center ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Empower Your Practice with WaitFree Clinic</h1>
          <p className="text-lg opacity-90 mb-6">Innovative AI-driven platform for doctors in India. Patients can search, book, and access your services seamlessly.</p>

          {/* Trial Badge */}
          <div className="inline-block bg-green-500/20 border border-green-500 rounded-full px-4 py-2 mb-6">
            <span className="text-green-400 font-semibold"> 14-Day Free Trial • No Credit Card Required</span>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'opacity-70'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-green-500' : 'bg-gray-300'}`}
              aria-label="Toggle billing cycle"
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`}></div>
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : 'opacity-70'}`}>Yearly</span>
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Save 20%</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-8 p-4 rounded-lg border flex items-center gap-3 ${darkMode ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-50 border-red-300 text-red-700'}`}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={idx}
                className={`relative p-8 rounded-3xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                  } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-${plan.color}-500 flex items-center justify-center mb-6 text-white mx-auto shadow-lg`}>
                  <Icon size={32} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-center mb-4">{plan.name}</h3>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <IndianRupee size={20} className="opacity-70" />
                    <span className="text-4xl font-bold">{plan.price.toLocaleString()}</span>
                    <span className="text-lg opacity-70 ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="flex items-center justify-center text-sm opacity-70 line-through">
                    <IndianRupee size={14} />
                    <span>{plan.originalPrice.toLocaleString()}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="mt-2 text-xs text-green-500 font-semibold">
                      Save ₹{(plan.originalPrice - plan.price).toLocaleString()} this year
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start">
                      <Check size={16} className="text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleStartTrial(plan.type)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Free Trial</span>
                      <span className="text-xs opacity-70">(14 days)</span>
                    </>
                  )}
                </button>

                {/* Disclaimer */}
                <p className="text-xs text-center mt-3 opacity-60">
                  No credit card required for trial
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className={`rounded-2xl p-6 mb-12 text-center ${darkMode ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={20} />
              <span className="text-sm font-semibold">Secure Payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={20} />
              <span className="text-sm font-semibold">Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={20} />
              <span className="text-sm font-semibold">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={20} />
              <span className="text-sm font-semibold">HIPAA Compliant</span>
            </div>
          </div>
        </div>

        {/* Innovative Features Highlight */}
        <div className={`rounded-2xl p-8 mb-12 backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-center mb-8">Revolutionary Features for Doctors & Patients</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-sm opacity-70">Advanced AI for diagnostics, predictions, and personalized care.</p>
            </div>
            <div className="text-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Location Tracking</h3>
              <p className="text-sm opacity-70">Track patient locations for efficient home visits and emergencies.</p>
            </div>
            <div className="text-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Zero Waiting Times</h3>
              <p className="text-sm opacity-70">Estimate and manage waiting times with virtual queues.</p>
            </div>
            <div className="text-center p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Patient Search</h3>
              <p className="text-sm opacity-70">Patients easily find and book with verified doctors.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`rounded-2xl p-8 mb-12 backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold mb-2">How does the 14-day free trial work?</h3>
              <p className="text-sm opacity-70">Start using any plan immediately without payment. You'll only be charged after 14 days. Cancel anytime during the trial period at no cost.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Can I change my plan later?</h3>
              <p className="text-sm opacity-70">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm opacity-70">We accept all major credit/debit cards, UPI, net banking, and wallets through our secure Stripe payment gateway.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Is my data secure?</h3>
              <p className="text-sm opacity-70">Absolutely. We use bank-level encryption and are fully HIPAA compliant. Your patient data is stored securely and never shared.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-gradient-to-r from-purple-900 to-blue-900' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'}`}>
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-lg opacity-90 mb-6">Join thousands of doctors already using WaitFree Clinic</p>
          <button
            onClick={() => !isAuthenticated ? setCurrentPage('signup-doctor') : handleStartTrial('premium')}
            className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/Logo.png"
                  alt="WaitFree Clinic"
                  className="h-10 w-auto mr-2"
                />
                <span className="text-2xl font-extrabold">WaitFree<span className="text-blue-400">Clinic</span></span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Making modern healthcare accessible and convenient by putting time back in your day.
              </p>
            </div>
            <div>
              <h4 className="font-extrabold mb-4 text-blue-400 border-b border-blue-400/30 pb-1">For Patients</h4>
              <ul className="space-y-3">
                <li><a href="/Search" className="text-gray-400 hover:text-white transition-colors">Find Doctors</a></li>
                <li><a href='/patient-login' className="text-gray-400 hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Video Consultation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold mb-4 text-blue-400 border-b border-blue-400/30 pb-1">For Doctors</h4>
              <ul className="space-y-3">
                <li><a href="/Login" className="text-gray-400 hover:text-white transition-colors">Doctor Login</a></li>
                <li><a href="/Login" className="text-gray-400 hover:text-white transition-colors">Register Clinic</a></li>
                <li><a href="/Pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold mb-4 text-blue-400 border-b border-blue-400/30 pb-1">Company</h4>
              <ul className="space-y-3">
                <li><a href="/About-us" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/Contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/Privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 WaitFree-Clinic. All rights reserved. | Built with 💙 for modern healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
