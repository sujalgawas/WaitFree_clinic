import React, { useState } from 'react';
import { Check, Star, Zap, Shield, Heart, IndianRupee, Users, MapPin, Clock, Brain } from 'lucide-react';

export default function PricingPage({ darkMode, setCurrentPage }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const plans = [
    {
      name: 'Basic',
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className={`rounded-3xl p-8 mb-12 text-center ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Empower Your Practice with WaitFree Clinic</h1>
          <p className="text-lg opacity-90 mb-6">Innovative AI-driven platform for doctors in India. Patients can search, book, and access your services seamlessly.</p>
          <div className="flex justify-center items-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'opacity-70'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`}></div>
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : 'opacity-70'}`}>Yearly</span>
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Save 20%</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={idx}
                className={`relative p-8 rounded-3xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-${plan.color}-500 flex items-center justify-center mb-6 text-white mx-auto`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">{plan.name}</h3>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <IndianRupee size={20} />
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-lg opacity-70">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className="text-sm opacity-70 line-through">
                    <IndianRupee size={14} />
                    {plan.originalPrice}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center">
                      <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => setCurrentPage('signup-doctor')}
                >
                  Start Free Trial
                </button>
              </div>
            );
          })}
        </div>

        {/* Innovative Features Highlight */}
        <div className={`rounded-2xl p-8 mb-12 backdrop-blur-lg border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-2xl font-bold text-center mb-8">Revolutionary Features for Doctors & Patients</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-sm opacity-70">Advanced AI for diagnostics, predictions, and personalized care.</p>
            </div>
            <div className="text-center">
              <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Location Tracking</h3>
              <p className="text-sm opacity-70">Track patient locations for efficient home visits and emergencies.</p>
            </div>
            <div className="text-center">
              <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Zero Waiting Times</h3>
              <p className="text-sm opacity-70">Estimate and manage waiting times with virtual queues.</p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Patient Search</h3>
              <p className="text-sm opacity-70">Patients easily find and book with verified doctors.</p>
            </div>
          </div>
        </div>

       
        </div>
        
     {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
<div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12"> {/* Better alignment with 5 columns */}
         <div className="col-span-2">
               <div className="flex items-center gap-2 mb-4">
                                <img
                src="/Logo.png"
                alt="WaitFree Clinic"
                className="h-10 w-auto mr-2"  // space between image and text
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
                <li>
                  <a href='/patient-login' className="text-gray-400 hover:text-white transition-colors">Book Appointment</a></li>
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
                <li><a href="Contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
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