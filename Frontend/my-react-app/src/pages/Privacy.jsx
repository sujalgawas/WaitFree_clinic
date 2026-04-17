import React, { useState } from 'react';
import { 
  Shield, Lock, Eye, Database, Users, FileText, 
  CheckCircle, AlertTriangle, Globe, Mail, Phone,
  Server, Cloud, Key, UserCheck, Bell, CreditCard,
  Download, Share2, Trash2, Settings, Moon, Sun,
  ChevronDown, ChevronUp, ExternalLink, Info
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      color: 'blue',
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Full name, date of birth, gender, and contact details (email, phone number)',
            'Government-issued identification (for identity verification)',
            'Profile photo (optional)',
            'Residential address and emergency contact information'
          ]
        },
        {
          subtitle: 'Health Information',
          items: [
            'Medical history, current medications, and allergies',
            'Symptoms, diagnoses, and treatment plans',
            'Lab results, prescriptions, and medical imaging',
            'Vital signs and health metrics (heart rate, blood pressure, etc.)',
            'Video consultation recordings (with consent)'
          ]
        },
        {
          subtitle: 'Technical Information',
          items: [
            'IP address, browser type, and device information',
            'Usage data including pages visited and features used',
            'Cookies and similar tracking technologies',
            'Location data (with permission) for nearby doctor recommendations',
            'App performance and crash reports'
          ]
        },
        {
          subtitle: 'Payment Information',
          items: [
            'Credit/debit card details (encrypted and tokenized)',
            'Billing address and transaction history',
            'Insurance information (if applicable)'
          ]
        }
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      color: 'green',
      content: [
        {
          subtitle: 'Primary Uses',
          items: [
            'Facilitate video consultations between patients and doctors',
            'Process appointments, prescriptions, and medical records',
            'Enable secure communication and data sharing',
            'Process payments and generate invoices',
            'Send appointment reminders and follow-up notifications'
          ]
        },
        {
          subtitle: 'Service Improvement',
          items: [
            'Analyze usage patterns to improve user experience',
            'Develop new features and enhance existing ones',
            'Conduct research and analytics (anonymized data)',
            'Personalize content and recommendations',
            'Optimize platform performance and security'
          ]
        },
        {
          subtitle: 'Communication',
          items: [
            'Send transactional emails (appointment confirmations, prescriptions)',
            'Provide customer support and respond to inquiries',
            'Send promotional offers (with opt-out option)',
            'Notify about policy changes or important updates',
            'Conduct surveys and feedback requests'
          ]
        }
      ]
    },
    {
      icon: Share2,
      title: 'Information Sharing & Disclosure',
      color: 'purple',
      content: [
        {
          subtitle: 'Healthcare Providers',
          items: [
            'Doctors and medical professionals you consult with',
            'Referring physicians (with your consent)',
            'Specialists for second opinions (when requested)',
            'Healthcare facilities for coordinated care'
          ]
        },
        {
          subtitle: 'Service Providers',
          items: [
            'Cloud hosting providers (AWS, Google Cloud) for data storage',
            'Payment processors (Razorpay, Stripe) for transactions',
            'Communication tools (Twilio, SendGrid) for notifications',
            'Analytics platforms (with anonymized data)',
            'Security and fraud prevention services'
          ]
        },
        {
          subtitle: 'Legal Requirements',
          items: [
            'Government authorities when required by law',
            'Law enforcement for valid legal requests',
            'Court orders or legal proceedings',
            'Public health emergencies as mandated',
            'Regulatory compliance audits'
          ]
        },
        {
          subtitle: 'We DO NOT Sell Your Data',
          items: [
            'Your personal and health information is NEVER sold to third parties',
            'No marketing or advertising companies receive your data',
            'No data brokers or aggregators have access',
            'Complete control over your information'
          ]
        }
      ]
    },
    {
      icon: Lock,
      title: 'Data Security & Protection',
      color: 'red',
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'End-to-end encryption for video consultations',
            '256-bit AES encryption for data at rest',
            'TLS/SSL encryption for data in transit',
            'Multi-factor authentication (MFA) available',
            'Regular security audits and penetration testing',
            'HIPAA and GDPR compliant infrastructure'
          ]
        },
        {
          subtitle: 'Access Controls',
          items: [
            'Role-based access control (RBAC) for staff',
            'Minimal data access on need-to-know basis',
            'Audit logs for all data access',
            'Regular access reviews and revocations',
            'Secure API authentication with JWT tokens'
          ]
        },
        {
          subtitle: 'Data Breach Protocol',
          items: [
            'Immediate investigation and containment',
            'Notification within 72 hours of discovery',
            'Coordination with regulatory authorities',
            'Transparent communication with affected users',
            'Remediation and prevention measures'
          ]
        }
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights & Choices',
      color: 'indigo',
      content: [
        {
          subtitle: 'Access & Control',
          items: [
            'Access your personal and health information anytime',
            'Download a copy of your data in portable format',
            'Update or correct inaccurate information',
            'Request deletion of your account and data',
            'Export consultation history and prescriptions'
          ]
        },
        {
          subtitle: 'Privacy Settings',
          items: [
            'Control who can view your profile information',
            'Manage notification preferences (email, SMS, push)',
            'Opt-out of marketing communications',
            'Disable location tracking',
            'Choose video recording preferences'
          ]
        },
        {
          subtitle: 'Consent Management',
          items: [
            'Withdraw consent for data processing at any time',
            'Revoke access to specific healthcare providers',
            'Manage third-party integrations',
            'Control cookies and tracking preferences',
            'Request human review of automated decisions'
          ]
        }
      ]
    },
    {
      icon: Cloud,
      title: 'Data Retention & Deletion',
      color: 'cyan',
      content: [
        {
          subtitle: 'Retention Periods',
          items: [
            'Active account data: Retained while account is active',
            'Medical records: 7 years (as per Indian regulations)',
            'Consultation recordings: 90 days (unless extended)',
            'Payment records: 7 years (for tax compliance)',
            'Chat logs: 1 year after last consultation',
            'Anonymized analytics: Indefinitely'
          ]
        },
        {
          subtitle: 'Deletion Process',
          items: [
            'Account deletion request processed within 30 days',
            'Medical records retained per legal requirements',
            'Anonymized data may be retained for research',
            'Backup data purged within 90 days',
            'Confirmation email sent upon completion'
          ]
        }
      ]
    },
    {
      icon: Globe,
      title: 'International Data Transfers',
      color: 'orange',
      content: [
        {
          subtitle: 'Data Storage',
          items: [
            'Primary data centers located in India',
            'Backup servers in secure international locations',
            'Compliance with local data protection laws',
            'Standard contractual clauses for EU transfers',
            'Adequate safeguards for cross-border transfers'
          ]
        }
      ]
    },
    {
      icon: Users,
      title: 'Children\'s Privacy',
      color: 'pink',
      content: [
        {
          subtitle: 'Age Requirements',
          items: [
            'Platform intended for users 18 years and older',
            'Minors (under 18) require parental/guardian consent',
            'Parents can create accounts for their children',
            'Special protections for children\'s data',
            'Limited data collection for pediatric consultations'
          ]
        }
      ]
    },
    {
      icon: Bell,
      title: 'Cookies & Tracking',
      color: 'yellow',
      content: [
        {
          subtitle: 'Types of Cookies',
          items: [
            'Essential cookies: Required for platform functionality',
            'Analytics cookies: Help improve user experience',
            'Preference cookies: Remember your settings',
            'Marketing cookies: Deliver relevant advertisements (opt-out available)',
            'Session cookies: Maintain login state'
          ]
        },
        {
          subtitle: 'Managing Cookies',
          items: [
            'Control cookies through browser settings',
            'Use our cookie preference center',
            'Opt-out of third-party advertising cookies',
            'Mobile app tracking managed in device settings'
          ]
        }
      ]
    },
    {
      icon: FileText,
      title: 'Third-Party Services',
      color: 'teal',
      content: [
        {
          subtitle: 'Integrated Services',
          items: [
            'Google Cloud Platform (data hosting)',
            'Firebase (authentication and real-time database)',
            'Razorpay/Stripe (payment processing)',
            'Twilio (SMS and video infrastructure)',
            'SendGrid (email communications)',
            'Google Analytics (usage analytics)'
          ]
        },
        {
          subtitle: 'Third-Party Privacy',
          items: [
            'Each service has its own privacy policy',
            'We select HIPAA-compliant vendors when possible',
            'Data processing agreements in place',
            'Regular vendor security assessments'
          ]
        }
      ]
    }
  ];

  const quickLinks = [
    { icon: Download, text: 'Download Privacy Policy PDF', color: 'blue' },
    { icon: Mail, text: 'Contact Privacy Team', color: 'green' },
    { icon: Settings, text: 'Manage Privacy Settings', color: 'purple' },
    { icon: Trash2, text: 'Request Data Deletion', color: 'red' }
  ];

  const bg = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
  

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/30 flex items-center gap-2 mx-auto w-fit">
              <Shield className="w-4 h-4" />
              Last Updated: January 3, 2026
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Privacy Policy
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Your privacy is our priority. Learn how WaitFree Clinic collects, uses, and protects your personal and health information.
          </p>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Shield, label: 'HIPAA Compliant' },
              { icon: Lock, label: 'Bank-Grade Encryption' },
              { icon: CheckCircle, label: 'GDPR Ready' },
              { icon: Key, label: 'Your Data, Your Control' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <item.icon className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-sm text-blue-100 font-semibold">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 px-6 -mt-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className={`${cardBg} border-2 ${borderColor} rounded-3xl shadow-2xl p-8 md:p-12`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <Info className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-3`}>
                  Privacy at a Glance
                </h2>
                <p className={textSecondary}>
                  Key points about how we handle your information
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700`}>
                <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                <h3 className={`font-bold ${textPrimary} mb-2`}>We Protect</h3>
                <ul className={`text-sm ${textSecondary} space-y-1`}>
                  <li>✓ End-to-end encrypted consultations</li>
                  <li>✓ HIPAA & GDPR compliant infrastructure</li>
                  <li>✓ Regular security audits</li>
                  <li>✓ Secure cloud storage</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700`}>
                <UserCheck className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className={`font-bold ${textPrimary} mb-2`}>You Control</h3>
                <ul className={`text-sm ${textSecondary} space-y-1`}>
                  <li>✓ Access and download your data anytime</li>
                  <li>✓ Delete your account when you want</li>
                  <li>✓ Manage sharing preferences</li>
                  <li>✓ Opt-out of marketing emails</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700`}>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
                <h3 className={`font-bold ${textPrimary} mb-2`}>We Never</h3>
                <ul className={`text-sm ${textSecondary} space-y-1`}>
                  <li>✗ Sell your personal information</li>
                  <li>✗ Share data without consent</li>
                  <li>✗ Use your health data for ads</li>
                  <li>✗ Store payment details directly</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700`}>
                <Bell className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className={`font-bold ${textPrimary} mb-2`}>We Notify</h3>
                <ul className={`text-sm ${textSecondary} space-y-1`}>
                  <li>✓ Policy changes (30 days notice)</li>
                  <li>✓ Data breaches (within 72 hours)</li>
                  <li>✓ Access by healthcare providers</li>
                  <li>✓ New features affecting privacy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div 
                key={index}
                className={`${cardBg} border-2 ${borderColor} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                  expandedSection === index ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`bg-${section.color}-100 dark:bg-${section.color}-900/30 p-3 rounded-xl`}>
                      <section.icon className={`w-6 h-6 text-${section.color}-600`} />
                    </div>
                    <h3 className={`text-xl font-bold ${textPrimary} text-left`}>
                      {section.title}
                    </h3>
                  </div>
                  {expandedSection === index ? (
                    <ChevronUp className={`w-6 h-6 ${textSecondary}`} />
                  ) : (
                    <ChevronDown className={`w-6 h-6 ${textSecondary}`} />
                  )}
                </button>

                {expandedSection === index && (
                  <div className="px-6 pb-6 space-y-6">
                    {section.content.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h4 className={`font-bold ${textPrimary} mb-3`}>
                          {subsection.subtitle}
                        </h4>
                        <ul className="space-y-2">
                          {subsection.items.map((item, itemIndex) => (
                            <li 
                              key={itemIndex}
                              className={`flex items-start gap-3 ${textSecondary}`}
                            >
                              <CheckCircle className={`w-5 h-5 text-${section.color}-600 flex-shrink-0 mt-0.5`} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={`py-16 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl font-bold ${textPrimary} mb-8 text-center`}>
            Privacy Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, idx) => (
              <button
                key={idx}
                className={`${cardBg} border-2 ${borderColor} p-6 rounded-xl hover:shadow-xl transition-all hover:scale-105 text-center`}
              >
                <div className={`bg-${link.color}-100 dark:bg-${link.color}-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <link.icon className={`w-8 h-8 text-${link.color}-600`} />
                </div>
                <p className={`font-semibold ${textPrimary}`}>{link.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`${cardBg} border-2 ${borderColor} rounded-3xl shadow-2xl p-8 md:p-12`}>
            <h2 className={`text-3xl font-bold ${textPrimary} mb-6 text-center`}>
              Questions About Your Privacy?
            </h2>
            <p className={`text-center ${textSecondary} mb-8`}>
              Our privacy team is here to help you understand how we protect your information
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className={`font-bold ${textPrimary} mb-2`}>Email Us</h3>
                <p className={`text-sm ${textSecondary}`}>privacy@waitfreeclinic.com</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className={`font-bold ${textPrimary} mb-2`}>Call Us</h3>
                <p className={`text-sm ${textSecondary}`}>+91 98765 43210</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className={`font-bold ${textPrimary} mb-2`}>Visit</h3>
                <p className={`text-sm ${textSecondary}`}>Mumbai, Maharashtra</p>
              </div>
            </div>

            <div className={`bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-6`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className={`font-bold ${textPrimary} mb-2`}>Data Protection Officer</h4>
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    For formal privacy complaints or data protection inquiries, contact our Data Protection Officer:
                  </p>
                  <p className={`text-sm font-semibold ${textPrimary}`}>
                    dpo@waitfreeclinic.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Trust, Our Commitment
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're committed to protecting your privacy and earning your trust every day
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
              <Settings className="w-5 h-5" />
              Manage Privacy Settings
            </button>
            <button className="bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/50 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Terms of Service
            </button>
          </div>

          <p className="text-sm text-blue-100 mt-8">
            © 2026 WaitFree Clinic. All rights reserved. | Last updated: January 3, 2026
          </p>
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
};

export default PrivacyPolicy;