import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Shield, Video, FileText, ChevronRight, Star, CheckCircle } from 'lucide-react';

const LandingPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const [demoForm, setDemoForm] = useState({
    clinicName: '',
    doctorName: '',
    phoneNumber: ''
  });

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    // Handle demo booking logic here
    alert('Demo request submitted! We will contact you soon.');
    setDemoForm({ clinicName: '', doctorName: '', phoneNumber: '' });
  };

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated appointment booking with real-time availability updates',
      color: 'blue'
    },
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'Seamless virtual appointments for remote patient care',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Complete patient records and history at your fingertips',
      color: 'green'
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Create and share prescriptions instantly with patients',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'HIPAA compliant with end-to-end encryption',
      color: 'red'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Manage your practice anytime, anywhere from any device',
      color: 'indigo'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      rating: 5,
      text: 'DocTrue has transformed how I manage my clinic. Patient satisfaction has increased by 40%!'
    },
    {
      name: 'Dr. Rajesh Kumar',
      specialty: 'Pediatrician',
      rating: 5,
      text: 'The automated scheduling saves me 3 hours every day. Highly recommended!'
    },
    {
      name: 'Dr. Anjali Mehta',
      specialty: 'Dermatologist',
      rating: 5,
      text: 'My patients love the convenience of booking appointments online. Game changer!'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className={`pt-24 pb-16 px-4 ${
        darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              DocTrue - The Easy Way to{' '}
              <span className="text-blue-600">Book, Manage & Automate</span>
              <br />Appointments for Your Clinic
            </h1>
            
            <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Just Smoother Schedules and Happier Patients.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Your Free Trial
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/doctor-login')}
                className={`px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
                }`}
              >
                Doctor Login
              </button>
            </div>

            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
              <CheckCircle className="w-5 h-5" />
              500+ Doctors Enrolled
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 px-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Active Doctors' },
              { number: '10K+', label: 'Appointments Booked' },
              { number: '50+', label: 'Cities Covered' },
              { number: '4.9/5', label: 'User Rating' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stat.number}
                </div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need to Run Your Clinic
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Powerful features designed for modern healthcare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all hover:scale-105 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'
                } shadow-lg`}
              >
                <div className={`w-14 h-14 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
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

      {/* CTA Section for Patients */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
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

      {/* Footer */}
      <footer className={`py-12 px-4 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">DocTrue</h3>
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
            <p>© 2025 DocTrue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
