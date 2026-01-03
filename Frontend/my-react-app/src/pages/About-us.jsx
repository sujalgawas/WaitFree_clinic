import React from 'react';
import { 
  Heart, Users, Clock, Shield, Award, Globe, 
  CheckCircle, Star, ArrowRight, Stethoscope, 
  Activity, Zap, TrendingUp, MessageCircle, Lightbulb, Code
} from 'lucide-react';

const AboutUs = () => {
  const team = [
    {
      name: 'Mr. Atish Ghanekar',
      role: 'Founder & Visionary',
      bio: 'The main idea behind WaitFree Clinic originated from Mr. Atish Ghanekar, who envisioned a healthcare system free from long waits. His innovative thinking drives our mission to make healthcare accessible and efficient.',
      avatar: '👨‍💼',
      specialty: 'Healthcare Innovation & Strategy',
      icon: Lightbulb
    },
    {
      name: 'Mr. Sujal Gawas',
      role: 'Co-Founder & Technical Lead',
      bio: 'Supporting the vision with technical expertise, Mr. Sujal Gawas co-developed the platform, bringing cutting-edge technology to transform healthcare delivery and patient experience.',
      avatar: '👨‍💻',
      specialty: 'Software Development & AI',
      icon: Code
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Chief Medical Officer',
      bio: 'With 15+ years in healthcare, Dr. Kumar provides medical oversight and ensures our platform meets the highest standards of patient care.',
      avatar: '👨‍⚕️',
      specialty: 'General Medicine',
      icon: Stethoscope
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      bio: 'Former tech lead at major health tech companies, Priya brings cutting-edge solutions to make healthcare digital and operational.',
      avatar: '👩‍💼',
      specialty: 'Operations & UX',
      icon: Stethoscope
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Patient-Centric',
      description: 'Every decision we make puts patients first, ensuring care is accessible, respectful, and effective.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We maintain the highest standards of data privacy and security to protect your health information.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We leverage technology to solve real healthcare challenges and improve outcomes for everyone.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We work closely with doctors, patients, and healthcare providers to build better systems.'
    }
  ];

  const milestones = [
    { year: '2020', event: 'WaitFree Clinic founded by Mr. Atish Ghanekar with a vision to eliminate healthcare wait times' },
    { year: '2021', event: 'Mr. Sujal Gawas joins as co-founder; launched real-time wait time feature, reducing average waits by 70%' },
    { year: '2022', event: 'Expanded to 800+ doctors and 50K+ patients across India through collaborative development' },
    { year: '2023', event: 'Introduced video consultations and digital prescriptions with enhanced technical support' },
    { year: '2024', event: 'Achieved 4.8/5 patient satisfaction and 80% reduction in no-shows through ongoing innovation' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About WaitFree Clinic
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Founded on the visionary idea of Mr. Atish Ghanekar and co-developed with Mr. Sujal Gawas, 
            we're revolutionizing healthcare by eliminating wait times and making quality care accessible to everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Join Our Mission
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white/30 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story: Born from Vision and Innovation
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                WaitFree Clinic was born from the groundbreaking idea of Mr. Atish Ghanekar, who recognized the inefficiencies 
                in traditional healthcare systems. With the technical support and co-development by Mr. Sujal Gawas, 
                what started as a concept has evolved into a comprehensive platform serving thousands.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Together, they built a system that not only reduces wait times but transforms the entire healthcare experience, 
                making it more efficient, secure, and patient-focused through innovative technology and strategic vision.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-700 font-semibold">50,000+ Patients Served</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-700 font-semibold">800+ Partner Doctors</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h3>
                  <p className="text-gray-600">
                    To make healthcare accessible, efficient, and patient-centered through innovative technology, 
                    driven by the vision of Mr. Atish Ghanekar and the expertise of Mr. Sujal Gawas.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Reduce wait times by 80%</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Connect patients with top doctors instantly</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Ensure 100% data security and privacy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600">
              The visionary minds behind WaitFree Clinic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="text-6xl mb-4">{member.avatar}</div>
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <member.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {member.specialty}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to transform healthcare
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {milestone.year}
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-300">Patients Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">800+</div>
              <div className="text-gray-300">Partner Doctors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">15 min</div>
              <div className="text-gray-300">Average Wait Time</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">4.8/5</div>
              <div className="text-gray-300">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Us in Transforming Healthcare
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're a patient seeking better care or a doctor wanting to serve more patients, 
            WaitFree Clinic is here to help, built on the vision of Mr. Atish Ghanekar and Mr. Sujal Gawas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Get Started Today
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white/30 transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;