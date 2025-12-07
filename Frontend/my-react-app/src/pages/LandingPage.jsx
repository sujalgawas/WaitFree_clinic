import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, Clock, Shield, Video, FileText, ChevronRight, 
  Star, CheckCircle, ArrowRight, Zap, TrendingUp, MessageCircle,
  Smartphone, Cloud, Heart, BarChart, Phone, Mail, Globe
} from 'lucide-react';

const LandingPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const [demoForm, setDemoForm] = useState({
    clinicName: '',
    doctorName: '',
    phoneNumber: '',
    email: ''
  });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    // Handle demo booking logic here
    alert('Demo request submitted! We will contact you soon.');
    setDemoForm({ clinicName: '', doctorName: '', phoneNumber: '', email: '' });
  };

  const features = [
    {
      icon: Calendar,
      title: 'AI-Powered Smart Scheduling',
      description: 'Intelligent appointment booking with auto-optimization and predictive time management',
      color: 'from-blue-500 to-cyan-400',
      stat: 'Save 3+ hours weekly'
    },
    {
      icon: Video,
      title: 'Virtual Consultations',
      description: 'HD video calls with screen sharing and digital whiteboard for better patient care',
      color: 'from-purple-500 to-pink-500',
      stat: '40% Remote Visits'
    },
    {
      icon: Users,
      title: '360° Patient Management',
      description: 'Complete EHR with analytics, treatment plans, and automated follow-ups',
      color: 'from-green-500 to-emerald-400',
      stat: '98% Patient Satisfaction'
    },
    {
      icon: FileText,
      title: 'Smart Digital Prescriptions',
      description: 'AI-assisted prescription generation with drug interaction alerts',
      color: 'from-orange-500 to-yellow-400',
      stat: 'Zero Errors'
    },
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'HIPAA compliant with blockchain-based data encryption and audit trails',
      color: 'from-red-500 to-rose-400',
      stat: '100% Secure'
    },
    {
      icon: BarChart,
      title: 'Practice Analytics',
      description: 'Real-time insights on revenue, patient flow, and operational efficiency',
      color: 'from-indigo-500 to-blue-400',
      stat: '25% Growth'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiologist',
      rating: 5,
      text: 'WaitFree transformed our clinic operations. Patient satisfaction up by 65%!',
      avatar: '👩‍⚕️',
      practice: 'Hearts Care Hospital'
    },
    {
      name: 'Dr. Rajesh Kumar',
      specialty: 'Pediatric Specialist',
      rating: 5,
      text: 'The AI scheduling saves me 4 hours daily. My team loves it!',
      avatar: '👨‍⚕️',
      practice: 'Kids Wellness Center'
    },
    {
      name: 'Anjali Mehta',
      specialty: 'Clinic Manager',
      rating: 5,
      text: 'From 50% no-shows to just 5%. This system pays for itself!',
      avatar: '👩‍💼',
      practice: 'Skin & Health Clinic'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Patients', icon: Heart },
    { value: '500+', label: 'Trusted Doctors', icon: Users },
    { value: '98%', label: 'Satisfaction Rate', icon: Star },
    { value: '24/7', label: 'Support Available', icon: Clock }
  ];

  return (
    
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
      
      {/* Navigation */}
      {/* <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? darkMode 
            ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800' 
            : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                WaitFree<span className="text-blue-500">Clinic</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#features" className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Features
              </a>
              <a href="#testimonials" className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Testimonials
              </a>
              <a href="#pricing" className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Pricing
              </a>
              <button
                onClick={() => navigate('/patient-login')}
                className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => navigate('/doctor-login')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Doctor Login
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className={`pt-32 pb-20 px-6 relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
            darkMode ? 'bg-blue-500/10' : 'bg-blue-300/20'
          } blur-3xl animate-pulse`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${
            darkMode ? 'bg-purple-500/10' : 'bg-purple-300/20'
          } blur-3xl animate-pulse delay-1000`}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 rounded-full font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Trusted by 500+ Clinics Nationwide
              </div>
              
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Medical Practice
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 block">
                  Reimagined
                </span>
              </h1>
              
              <p className={`text-xl mb-8 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                WaitFree Clinic automates your entire workflow — from smart appointment scheduling 
                to virtual consultations and digital health records. Experience medicine without the paperwork.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/patient-login')}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start 30-Day Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                
                <button
                  onClick={() => navigate('/doctor-login')}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 border-2 ${
                    darkMode 
                      ? 'border-gray-700 hover:border-gray-600 text-white bg-gray-900/50' 
                      : 'border-gray-300 hover:border-gray-400 text-gray-900 bg-white'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Book a Demo
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Set up in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative">
              <div className={`rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <div className="text-sm opacity-70">Today's Appointments</div>
                      <div className="text-2xl font-bold">24</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                      <div className="text-sm opacity-70">Waiting Patients</div>
                      <div className="text-2xl font-bold">3</div>
                    </div>
                  </div>
                  <div className={`h-48 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className={`absolute -top-6 -right-6 p-4 rounded-xl shadow-lg ${
                darkMode ? 'bg-purple-600' : 'bg-purple-500'
              }`}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className={`absolute -bottom-6 -left-6 p-4 rounded-xl shadow-lg ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <Smartphone className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`flex justify-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 {/* CTA Section for Patients */}
      <section id='patient-portal' className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Looking for a Doctor?
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Book appointments with verified doctors near you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Patient Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
              }`}
            >
              Create Patient Account
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need in One
              <span className="text-blue-500 leading-relaxed"> Platform</span>
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Designed by doctors, for doctors. Streamline your practice with our all-in-one solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className={`inline-flex p-4 rounded-xl mb-6 bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {feature.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Loved by Doctors Nationwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className={`mb-4 italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{testimonial.text}"
                </p>
                <div>
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {testimonial.name}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {testimonial.specialty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Booking Section */}
      <section className={`py-20 px-4 ${
        darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-600 to-indigo-600'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Start Seeing More Patients Today - Book a Free Demo!
            </h2>
          </div>

          <form onSubmit={handleDemoSubmit} className={`rounded-2xl p-8 shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={demoForm.clinicName}
                  onChange={(e) => setDemoForm({...demoForm, clinicName: e.target.value})}
                  placeholder="ABC Multi-speciality"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Doctor
                </label>
                <input
                  type="text"
                  value={demoForm.doctorName}
                  onChange={(e) => setDemoForm({...demoForm, doctorName: e.target.value})}
                  placeholder="Dr Asha"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={demoForm.phoneNumber}
                  onChange={(e) => setDemoForm({...demoForm, phoneNumber: e.target.value})}
                  placeholder="8879866666"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Submit
            </button>
          </form>
        </div>
      </section>

     

      {/* Footer */}
      <footer className={`py-12 px-4 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">WaitFree-Clinic</h3>
              <p className="text-gray-400">
                Making healthcare accessible and convenient for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Doctor Login</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Register Your Clinic</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Patients</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Find Doctors</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Video Consultation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2025 WaitFree-Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
