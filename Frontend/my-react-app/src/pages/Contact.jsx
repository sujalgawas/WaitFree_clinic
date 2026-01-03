import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Clock, Send, MessageSquare, 
  Stethoscope, Users, Heart, CheckCircle, Calendar,
  Moon, Sun, Globe, Headphones, FileText, Video,
  AlertCircle, ArrowRight, Sparkles, Shield
} from 'lucide-react';

const ContactUs = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'patient',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('success');
    setTimeout(() => {
      setFormStatus('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'patient',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      details: ['+91 98765 43210', '+91 87654 32109'],
      description: 'Call us anytime, day or night',
      gradient: 'from-blue-500 to-cyan-500',
      action: 'Call Now'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['support@waitfreeclinic.com', 'doctors@waitfreeclinic.com'],
      description: 'We respond within 2 hours',
      gradient: 'from-purple-500 to-pink-500',
      action: 'Send Email'
    },
    {
      icon: MapPin,
      title: 'Visit Our Office',
      details: ['123 Healthcare Avenue', 'Mumbai, Maharashtra 400001'],
      description: 'Mon-Sat: 9 AM - 6 PM',
      gradient: 'from-green-500 to-emerald-500',
      action: 'Get Directions'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      details: ['Instant Support', 'Available 24/7'],
      description: 'Chat with our team now',
      gradient: 'from-orange-500 to-red-500',
      action: 'Start Chat'
    }
  ];

  const departments = [
    {
      icon: Stethoscope,
      title: 'For Doctors',
      description: 'Join our network of 800+ expert physicians',
      email: 'doctors@waitfreeclinic.com',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'For Patients',
      description: 'Get help with appointments and medical queries',
      email: 'patients@waitfreeclinic.com',
      color: 'green'
    },
    {
      icon: Heart,
      title: 'Partnerships',
      description: 'Collaborate with us to improve healthcare',
      email: 'partnerships@waitfreeclinic.com',
      color: 'purple'
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      description: 'Help with app, website, or technical issues',
      email: 'tech@waitfreeclinic.com',
      color: 'orange'
    }
  ];

  const faqs = [
    {
      q: 'How quickly can I get an appointment?',
      a: 'Most appointments are available within 15 minutes. Our real-time system shows exact doctor availability.'
    },
    {
      q: 'Is my health data secure?',
      a: 'Yes! We use bank-grade encryption and are fully HIPAA compliant. Your data is 100% secure and private.'
    },
    {
      q: 'How can doctors join WaitFree Clinic?',
      a: 'Doctors can apply through our website or email doctors@waitfreeclinic.com. Our team will guide you through onboarding.'
    },
    {
      q: 'Do you offer video consultations?',
      a: 'Yes! We offer secure video consultations with verified doctors. Book through our app or website.'
    }
  ];

  const bg = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full ${cardBg} shadow-lg border ${borderColor} hover:scale-110 transition-transform`}
      >
        {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-indigo-600" />}
      </button>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/30 flex items-center gap-2 mx-auto w-fit">
              <Sparkles className="w-4 h-4" />
              We're Here to Help 24/7
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Get in Touch with
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              WaitFree Clinic
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Whether you're a patient needing support or a doctor wanting to join our network, 
            our dedicated team is ready to assist you.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Clock, label: '2-Hour Response', value: 'Guaranteed' },
              { icon: Headphones, label: '24/7 Support', value: 'Available' },
              { icon: CheckCircle, label: '98% Satisfaction', value: 'Rating' },
              { icon: Shield, label: 'Secure & Private', value: 'Always' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <item.icon className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-sm text-blue-100 mb-1">{item.label}</div>
                <div className="text-lg font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-6 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, idx) => (
              <div 
                key={idx}
                className={`group ${cardBg} border-2 ${borderColor} rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className={`bg-gradient-to-br ${info.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>
                  {info.title}
                </h3>
                
                {info.details.map((detail, i) => (
                  <p key={i} className={`${textPrimary} font-semibold mb-1`}>
                    {detail}
                  </p>
                ))}
                
                <p className={`text-sm ${textSecondary} mb-4`}>
                  {info.description}
                </p>
                
                <button className={`text-sm font-semibold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-1`}>
                  {info.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Form & Info */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className={`${cardBg} border-2 ${borderColor} rounded-3xl shadow-2xl p-8 md:p-12`}>
                <div className="mb-8">
                  <h2 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
                    Send us a Message
                  </h2>
                  <p className={textSecondary}>
                    Fill out the form below and we'll get back to you within 2 hours
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
                      I am a:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'patient', label: 'Patient', icon: Users },
                        { value: 'doctor', label: 'Doctor', icon: Stethoscope }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({...formData, userType: type.value})}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.userType === type.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : `border-gray-200 dark:border-gray-700 ${cardBg}`
                          }`}
                        >
                          <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                            formData.userType === type.value ? 'text-blue-600' : textSecondary
                          }`} />
                          <span className={`font-semibold ${
                            formData.userType === type.value ? 'text-blue-600' : textPrimary
                          }`}>
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border-2 ${borderColor} ${inputBg} ${textPrimary} focus:border-blue-500 focus:outline-none transition-colors`}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border-2 ${borderColor} ${inputBg} ${textPrimary} focus:border-blue-500 focus:outline-none transition-colors`}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone & Subject */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${borderColor} ${inputBg} ${textPrimary} focus:border-blue-500 focus:outline-none transition-colors`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border-2 ${borderColor} ${inputBg} ${textPrimary} focus:border-blue-500 focus:outline-none transition-colors`}
                      >
                        <option value="">Select a subject</option>
                        <option value="appointment">Appointment Help</option>
                        <option value="technical">Technical Support</option>
                        <option value="doctor-join">Doctor Registration</option>
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className={`w-full px-4 py-3 rounded-xl border-2 ${borderColor} ${inputBg} ${textPrimary} focus:border-blue-500 focus:outline-none transition-colors resize-none`}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </div>

                  {/* Success Message */}
                  {formStatus === 'success' && (
                    <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          Message sent successfully!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          We'll respond within 2 hours.
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Departments */}
              <div className={`${cardBg} border-2 ${borderColor} rounded-2xl p-6 shadow-lg`}>
                <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <FileText className="w-5 h-5 text-blue-600" />
                  Quick Contact
                </h3>
                <div className="space-y-4">
                  {departments.map((dept, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${borderColor} hover:border-${dept.color}-500 transition-colors`}>
                      <div className="flex items-start gap-3">
                        <div className={`bg-${dept.color}-100 dark:bg-${dept.color}-900/30 p-2 rounded-lg`}>
                          <dept.icon className={`w-5 h-5 text-${dept.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${textPrimary} mb-1`}>
                            {dept.title}
                          </h4>
                          <p className={`text-xs ${textSecondary} mb-2`}>
                            {dept.description}
                          </p>
                          <a href={`mailto:${dept.email}`} className={`text-xs text-${dept.color}-600 hover:underline`}>
                            {dept.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className={`${cardBg} border-2 ${borderColor} rounded-2xl p-6 shadow-lg`}>
                <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-blue-600" />
                  Office Hours
                </h3>
                <div className="space-y-3">
                  {[
                    { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
                    { day: 'Saturday', time: '10:00 AM - 4:00 PM' },
                    { day: 'Sunday', time: 'Closed' }
                  ].map((schedule, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className={`font-medium ${textPrimary}`}>{schedule.day}</span>
                      <span className={textSecondary}>{schedule.time}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-blue-600 font-semibold flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      24/7 Emergency Support Available
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <AlertCircle className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-bold mb-2">
                  Medical Emergency?
                </h3>
                <p className="text-red-100 mb-4 text-sm">
                  For immediate medical assistance, call our 24/7 emergency line
                </p>
                <button className="w-full bg-white text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Emergency: 108
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
              Frequently Asked Questions
            </h2>
            <p className={textSecondary}>
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`${cardBg} border-2 ${borderColor} rounded-2xl p-6 hover:shadow-lg transition-shadow`}>
                <h3 className={`text-lg font-bold ${textPrimary} mb-2 flex items-start gap-3`}>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  {faq.q}
                </h3>
                <p className={`${textSecondary} ml-8`}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className={textSecondary}>
              Still have questions?{' '}
              <button className="text-blue-600 font-semibold hover:underline">
                View all FAQs
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`${cardBg} border-2 ${borderColor} rounded-3xl overflow-hidden shadow-2xl`}>
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-4`}>
                  Visit Our Office
                </h2>
                <p className={`${textSecondary} mb-6`}>
                  We'd love to meet you in person. Drop by our office during business hours.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${textPrimary} mb-1`}>Address</h4>
                      <p className={textSecondary}>
                        123 Healthcare Avenue<br />
                        Mumbai, Maharashtra 400001<br />
                        India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${textPrimary} mb-1`}>Phone</h4>
                      <p className={textSecondary}>
                        +91 98765 43210<br />
                        +91 87654 32109
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${textPrimary} mb-1`}>Email</h4>
                      <p className={textSecondary}>
                        support@waitfreeclinic.com
                      </p>
                    </div>
                  </div>
                </div>

                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Get Directions
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-12 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-32 h-32 text-blue-600 mx-auto mb-4 opacity-50" />
                  <p className={`text-lg ${textSecondary}`}>
                    Interactive Map Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience WaitFree Healthcare?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 50,000+ patients who've already eliminated wait times
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>
            <button className="bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/50 transition-all backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;