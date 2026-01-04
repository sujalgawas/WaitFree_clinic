import React, { useState, useEffect } from 'react';
import { 
  Heart, Users, Clock, Shield, Award, Globe, 
  CheckCircle, Star, ArrowRight, Stethoscope, 
  Activity, Zap, TrendingUp, MessageCircle, Lightbulb, Code,
  Moon, Sun, Target, Rocket, Brain, Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const AboutUs = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const team = [
    {
      name: 'Mr. Atish Ghanekar',
      role: 'Founder & Visionary',
      bio: 'Pioneered the vision of eliminating healthcare wait times. His innovative approach to patient-centered care has revolutionized how thousands access quality healthcare services.',
      avatar: '👨‍💼',
      specialty: 'Healthcare Innovation & Strategy',
      icon: Lightbulb,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Mr. Sujal Gawas',
      role: 'Co-Founder & Technical Lead',
      bio: 'Transformed the vision into reality with cutting-edge technology. Leads our engineering team in building scalable, secure, and intelligent healthcare solutions.',
      avatar: '👨‍💻',
      specialty: 'Software Development & AI',
      icon: Code,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Chief Medical Officer',
      bio: 'Brings 15+ years of clinical excellence. Ensures every feature meets the highest medical standards while maintaining patient safety and care quality.',
      avatar: '👨‍⚕️',
      specialty: 'General Medicine & Healthcare Quality',
      icon: Stethoscope,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      bio: 'Former tech lead at major health tech companies. Orchestrates seamless operations ensuring both doctors and patients have exceptional experiences.',
      avatar: '👩‍💼',
      specialty: 'Operations & User Experience',
      icon: Network,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Patient-Centric Care',
      description: 'Every innovation starts with one question: How does this improve patient outcomes and experience?',
      color: 'rose'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Bank-grade encryption and HIPAA compliance ensure your health data remains private and protected.',
      color: 'blue'
    },
    {
      icon: Brain,
      title: 'AI-Powered Innovation',
      description: 'Leveraging machine learning to predict wait times, optimize scheduling, and personalize care.',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Collaborative Ecosystem',
      description: 'Building bridges between patients, doctors, and healthcare systems for holistic care delivery.',
      color: 'green'
    }
  ];

  const milestones = [
    { 
      year: '2024', 
      event: 'Foundation of WaitFree Clinic',
      detail: 'Mr. Atish Ghanekar\'s vision to eliminate healthcare wait times becomes reality',
      icon: Rocket
    },
    { 
      year: '2025', 
      event: 'Technical Revolution',
      detail: 'Mr. Sujal Gawas joins; real-time wait tracking reduces average waits by 70%',
      icon: Zap
    }
  ];

  const stats = [
    { value: '50K+', label: 'Happy Patients', icon: Users },
    { value: '800+', label: 'Expert Doctors', icon: Stethoscope },
    { value: '15 min', label: 'Avg. Wait Time', icon: Clock },
    { value: '4.8/5', label: 'Satisfaction', icon: Star }
  ];

  const bg = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
 

      {/* Hero Section with Parallax */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/30">
              🏆 India's #1 Wait-Free Healthcare Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Revolutionizing Healthcare,
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              One Patient at a Time
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Born from the visionary minds of <strong>Mr. Atish Ghanekar</strong> and <strong>Mr. Sujal Gawas</strong>, 
            WaitFree Clinic is eliminating wait times and making quality healthcare accessible to everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button     onClick={() => navigate('/patient-login')} className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105">
              Join 50,000+ Patients
              <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
            <button     onClick={() => navigate('/doctor-login')} className="bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/50 transition-all backdrop-blur-sm">
              For Doctors
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <stat.icon className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-full mb-4">
                  <Target className="w-4 h-4" />
                  <span className="font-semibold">Our Story</span>
                </div>
                <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-6 leading-tight`}>
                  Born from Vision,
                  <br />Built with Innovation
                </h2>
                <p className={`text-lg ${textSecondary} leading-relaxed mb-6`}>
                  In 2020, <strong className={textPrimary}>Mr. Atish Ghanekar</strong> identified a critical problem: 
                  patients were losing precious time and health in waiting rooms. His vision was simple yet revolutionary 
                  – what if we could eliminate wait times entirely?
                </p>
                <p className={`text-lg ${textSecondary} leading-relaxed`}>
                  Together with <strong className={textPrimary}>Mr. Sujal Gawas</strong>, this vision became reality. 
                  Using cutting-edge technology, AI-powered scheduling, and real-time data analytics, they built a platform 
                  that has served 50,000+ patients and partnered with 800+ doctors across India.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`${cardBg} border ${borderColor} p-6 rounded-2xl`}>
                  <div className="text-3xl font-bold text-blue-600 mb-2">70%</div>
                  <div className={`text-sm ${textSecondary}`}>Wait Time Reduction</div>
                </div>
                <div className={`${cardBg} border ${borderColor} p-6 rounded-2xl`}>
                  <div className="text-3xl font-bold text-green-600 mb-2">80%</div>
                  <div className={`text-sm ${textSecondary}`}>No-Show Reduction</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className={`${cardBg} border-2 ${borderColor} rounded-3xl shadow-2xl p-10 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-20" />
                
                <div className="relative space-y-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h3 className={`text-3xl font-bold ${textPrimary} mb-3`}>Our Mission</h3>
                    <p className={textSecondary}>
                      Making healthcare accessible, efficient, and patient-centered through technology and compassion.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle, text: 'Zero wait times for scheduled appointments', color: 'green' },
                      { icon: Shield, text: 'Bank-grade security for health data', color: 'blue' },
                      { icon: Brain, text: 'AI-powered doctor matching & scheduling', color: 'purple' },
                      { icon: Globe, text: 'Accessible healthcare for all of India', color: 'indigo' }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl`}>
                        <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                        <span className={textPrimary}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`py-24 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full mb-4">
              <Award className="w-4 h-4" />
              <span className="font-semibold">Our Values</span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-4`}>
              What Drives Us Forward
            </h2>
            <p className={`text-xl ${textSecondary} max-w-2xl mx-auto`}>
              The principles that guide every decision, every feature, and every interaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`group ${cardBg} border-2 ${borderColor} p-8 rounded-2xl hover:border-${value.color}-500 hover:shadow-2xl transition-all duration-300 text-center relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${value.color}-500 to-${value.color}-600 opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className={`bg-gradient-to-br from-${value.color}-400 to-${value.color}-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
                  {value.title}
                </h3>
                <p className={textSecondary}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-full mb-4">
              <Users className="w-4 h-4" />
              <span className="font-semibold">Leadership</span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-4`}>
              Meet the Visionaries
            </h2>
            <p className={`text-xl ${textSecondary} max-w-2xl mx-auto`}>
              The brilliant minds transforming healthcare delivery across India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className={`group ${cardBg} border-2 ${borderColor} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <div className={`bg-gradient-to-br ${member.gradient} p-8 text-center relative`}>
                  <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform">
                    {member.avatar}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mx-auto">
                    <member.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>
                    {member.name}
                  </h3>
                  <p className={`bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent font-bold mb-2`}>
                    {member.role}
                  </p>
                  <p className={`text-xs ${textSecondary} mb-3 font-semibold`}>
                    {member.specialty}
                  </p>
                  <p className={`text-sm ${textSecondary} leading-relaxed`}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className={`py-24 px-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Our Journey</span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-4`}>
              Milestones of Innovation
            </h2>
            <p className={`text-xl ${textSecondary}`}>
              From vision to reality – our growth story
            </p>
          </div>

          <div className="relative">
            <div className={`absolute left-12 top-0 bottom-0 w-1 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-b from-blue-400 to-purple-600'}`} />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-8 relative">
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-xl z-10">
                    <milestone.icon className="w-6 h-6 mb-1" />
                    <span className="text-sm">{milestone.year}</span>
                  </div>
                  
                  <div className={`flex-1 ${cardBg} border-2 ${borderColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow`}>
                    <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>
                      {milestone.event}
                    </h3>
                    <p className={textSecondary}>
                      {milestone.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-black opacity-30" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Join the Healthcare Revolution
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Whether you're a patient seeking better care or a doctor wanting to serve more efficiently, 
            WaitFree Clinic is your partner in modern healthcare.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button     onClick={() => navigate('/patient-login')} className="group bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-2xl hover:shadow-white/50 transform hover:scale-105">
              Get Started as Patient
              <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
            <button     onClick={() => navigate('/doctor-login')} className="bg-transparent hover:bg-white/10 text-white px-10 py-5 rounded-full font-bold text-lg border-2 border-white/50 transition-all backdrop-blur-sm">
              Join as Doctor
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </section>
      
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
                <li><a href="Contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
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
};

export default AboutUs;