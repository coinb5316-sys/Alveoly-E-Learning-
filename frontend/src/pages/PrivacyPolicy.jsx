// pages/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Eye, 
  Database, 
  Cookie, 
  Mail, 
  Users, 
  Lock, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Clock,
  CreditCard,
  Smartphone,
  Server,
  TrendingUp,
  MessageCircle,
  Award,
  Calendar,
  MapPin,
  Phone,
  Building
} from "lucide-react";

const PrivacyPolicy = () => {
  const lastUpdated = "May 29, 2026";
  
  const sections = [
    {
      icon: Shield,
      title: "1. Information We Collect",
      subsections: [
        {
          subtitle: "1.1 Personal Identification Information",
          items: [
            "Full name and date of birth",
            "Email address and phone number",
            "Residential address (for billing and certification)",
            "Government-issued ID (for exam proctoring and certificate issuance)",
            "Professional credentials and licenses (for healthcare professionals)"
          ]
        },
        {
          subtitle: "1.2 Educational Data",
          items: [
            "Course enrollment history and progress tracking",
            "Quiz and examination results and scores",
            "Assignment submissions and feedback",
            "Certificates earned and credentials awarded",
            "Learning preferences and study patterns",
            "Interaction with instructors and peers"
          ]
        },
        {
          subtitle: "1.3 Payment Information",
          items: [
            "Billing address and payment method details",
            "Transaction history and receipts",
            "Subscription plan information",
            "Payment disputes and refund requests"
          ]
        },
        {
          subtitle: "1.4 Technical Data",
          items: [
            "IP address and device identifiers",
            "Browser type and version",
            "Operating system and device information",
            "Time zone and language preferences",
            "Pages visited and time spent on each page",
            "Clickstream data and navigation patterns"
          ]
        },
        {
          subtitle: "1.5 Communication Data",
          items: [
            "Customer support inquiries and chat history",
            "Email correspondence with our team",
            "Forum posts and discussion board contributions",
            "Survey responses and feedback submissions"
          ]
        }
      ]
    },
    {
      icon: Eye,
      title: "2. How We Use Your Information",
      subsections: [
        {
          subtitle: "2.1 Service Delivery",
          items: [
            "To provide, maintain, and improve our educational platform",
            "To process enrollments and issue certificates",
            "To track academic progress and generate reports",
            "To facilitate communication between students and instructors",
            "To personalize learning recommendations"
          ]
        },
        {
          subtitle: "2.2 Communication",
          items: [
            "To send important updates about courses and platform changes",
            "To respond to inquiries and provide customer support",
            "To notify you about new courses and features",
            "To send exam schedules and deadline reminders"
          ]
        },
        {
          subtitle: "2.3 Analytics & Improvement",
          items: [
            "To analyze usage patterns and improve user experience",
            "To identify and fix technical issues",
            "To develop new features and services",
            "To conduct research and educational studies"
          ]
        },
        {
          subtitle: "2.4 Legal Compliance",
          items: [
            "To comply with applicable laws and regulations",
            "To enforce our Terms of Service",
            "To protect our rights and prevent fraud",
            "To respond to legal requests and prevent harm"
          ]
        }
      ]
    },
    {
      icon: Database,
      title: "3. Data Storage & Security",
      subsections: [
        {
          subtitle: "3.1 Security Measures",
          items: [
            "256-bit SSL/TLS encryption for all data transmission",
            "AES-256 encryption for stored sensitive data",
            "Regular security audits and penetration testing",
            "Multi-factor authentication for administrative access",
            "Automated backup systems with disaster recovery",
            "Real-time threat monitoring and intrusion detection"
          ]
        },
        {
          subtitle: "3.2 Data Retention",
          items: [
            "Active accounts: Data retained while account is active",
            "Inactive accounts: Data retained for 2 years after last login",
            "Deleted accounts: Data anonymized within 90 days of deletion",
            "Educational records: Retained for 7 years (accreditation requirements)",
            "Financial records: Retained for 10 years (legal requirements)"
          ]
        },
        {
          subtitle: "3.3 Data Location",
          items: [
            "Primary data stored on secure servers in the United States (AWS us-east-1)",
            "Backup data replicated across multiple geographic regions",
            "EU user data may be processed in compliance with GDPR standards",
            "We maintain data processing agreements with all third-party providers"
          ]
        }
      ]
    },
    {
      icon: Cookie,
      title: "4. Cookies & Tracking Technologies",
      subsections: [
        {
          subtitle: "4.1 Types of Cookies We Use",
          items: [
            "Essential Cookies: Required for platform functionality (cannot be disabled)",
            "Preference Cookies: Remember your settings and preferences",
            "Analytics Cookies: Help us understand how users interact with our platform",
            "Marketing Cookies: Used by Google AdSense to serve relevant advertisements",
            "Session Cookies: Temporary cookies that expire when you close your browser"
          ]
        },
        {
          subtitle: "4.2 Third-Party Cookies",
          items: [
            "Google AdSense: Serves personalized advertisements based on your interests",
            "Google Analytics: Tracks website usage and performance metrics",
            "Payment Processors: Required for secure payment processing",
            "Video Hosting Services: Enables video content delivery"
          ]
        },
        {
          subtitle: "4.3 Cookie Management",
          items: [
            "You can control cookies through your browser settings",
            "Disabling cookies may affect platform functionality",
            "You can opt out of personalized ads via Google Ad Settings",
            "EU users have additional consent options through our CMP"
          ]
        }
      ]
    },
    {
      icon: Users,
      title: "5. Data Sharing & Third Parties",
      subsections: [
        {
          subtitle: "5.1 Service Providers",
          items: [
            "Payment processors (Stripe, PayPal): Process tuition payments",
            "Cloud hosting providers (AWS, Cloudflare): Host our platform",
            "Email service providers: Send notifications and updates",
            "Analytics providers: Help us understand platform usage",
            "Customer support platforms: Manage support tickets"
          ]
        },
        {
          subtitle: "5.2 Educational Partners",
          items: [
            "Accrediting bodies: Verify program completion",
            "Educational institutions: Validate transfer credits",
            "Employers: Verify credentials with your consent",
            "Professional licensing boards: Confirm certification status"
          ]
        },
        {
          subtitle: "5.3 Legal Disclosures",
          items: [
            "We may disclose information when required by law",
            "To protect our rights and prevent fraud",
            "In connection with business transfers or acquisitions",
            "With your explicit consent for specific purposes"
          ]
        }
      ]
    },
    {
      icon: Globe,
      title: "6. International Data Transfers",
      subsections: [
        {
          subtitle: "6.1 Data Processing Locations",
          items: [
            "Your information may be transferred to and processed in countries outside your residence",
            "We ensure appropriate safeguards for international data transfers",
            "Standard Contractual Clauses (SCCs) are used for EU data transfers",
            "Data processing agreements are in place with all international partners"
          ]
        },
        {
          subtitle: "6.2 EU-US Data Privacy Framework",
          items: [
            "Alveoly complies with the EU-US Data Privacy Framework",
            "We adhere to the principles of notice, choice, accountability, and security",
            "EU individuals have the right to access and correct their personal data",
            "Dispute resolution is available through EU Data Protection Authorities"
          ]
        }
      ]
    },
    {
      icon: Lock,
      title: "7. Your Rights & Choices",
      subsections: [
        {
          subtitle: "7.1 GDPR Rights (For EU Residents)",
          items: [
            "Right to Access: Request a copy of your personal data",
            "Right to Rectification: Correct inaccurate or incomplete data",
            "Right to Erasure: Request deletion of your data ('Right to be Forgotten')",
            "Right to Restrict Processing: Limit how we use your data",
            "Right to Data Portability: Receive your data in a machine-readable format",
            "Right to Object: Object to data processing for specific purposes",
            "Right to Withdraw Consent: Withdraw consent at any time"
          ]
        },
        {
          subtitle: "7.2 CCPA Rights (For California Residents)",
          items: [
            "Right to Know: Request disclosure of data collected and shared",
            "Right to Delete: Request deletion of personal information",
            "Right to Opt-Out: Opt out of sale of personal information",
            "Right to Non-Discrimination: Equal service regardless of privacy choices",
            "Right to Access: Request specific pieces of personal information"
          ]
        },
        {
          subtitle: "7.3 How to Exercise Your Rights",
          items: [
            "Submit a request via email: alveolyelearning@gmail.com",
            "Call us at: +233 (0) 549 556 6116",
            "Response time: We respond within 30 days",
            "Verification: We may need to verify your identity before processing requests",
            "Free of charge: First request is free; reasonable fees may apply for excessive requests"
          ]
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "8. Children's Privacy",
      subsections: [
        {
          subtitle: "8.1 Age Restrictions",
          items: [
            "Our platform is intended for users aged 16 and above",
            "We do not knowingly collect data from children under 13",
            "If we discover data from a child under 13, we will delete it immediately",
            "Parents/guardians may request deletion of their child's data"
          ]
        },
        {
          subtitle: "8.2 Parental Controls",
          items: [
            "Parents may review their child's educational progress",
            "Parent accounts have additional privacy controls",
            "We comply with COPPA (Children's Online Privacy Protection Act)",
            "Parental consent is required for users under 16 in some jurisdictions"
          ]
        }
      ]
    },
    {
      icon: FileText,
      title: "9. Google AdSense Compliance",
      subsections: [
        {
          subtitle: "9.1 Advertising Practices",
          items: [
            "We comply with Google AdSense Program Policies",
            "Ads are clearly distinguishable from content",
            "No deceptive or misleading ad placements",
            "We do not click on our own ads or encourage others to do so"
          ]
        },
        {
          subtitle: "9.2 Personalized Advertising",
          items: [
            "Google uses cookies to serve personalized ads based on your interests",
            "You can opt out of personalized advertising via Google Ad Settings",
            "EU users have additional consent options through our CMP",
            "We do not display ads on restricted content (adult, violent, or illegal)"
          ]
        },
        {
          subtitle: "9.3 AdSense Data Processing",
          items: [
            "Google processes ad-related data according to its Privacy Policy",
            "We use Google's advertising features including remarketing",
            "Analytics data may be combined with ad data for better targeting",
            "You can manage ad preferences in your Google Account"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-white/80" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy is our priority. We are committed to protecting your personal information and being transparent about how we handle your data.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-blue-200">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last Updated: {lastUpdated}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Effective Immediately
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction Card */}
        <div className="mb-12 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Alveoly E-Learning Academy of Health & Sciences
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                This Privacy Policy describes how Alveoly E-Learning Academy ("we," "our," or "us") collects, uses, 
                shares, and protects your personal information when you use our e-learning platform, website, mobile 
                applications, and related services (collectively, the "Services"). By using our Services, you agree 
                to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-12 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl sticky top-20 z-10 backdrop-blur-sm">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Navigation:</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <a
                  key={idx}
                  href={`#section-${idx}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  {section.title.split('.')[1] || section.title}
                </a>
              );
            })}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div 
                key={index} 
                id={`section-${index}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow scroll-mt-24"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  
                  {section.subsections.map((subsection, subIdx) => (
                    <div key={subIdx} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        {subsection.subtitle}
                      </h3>
                      <ul className="space-y-2 ml-2">
                        {subsection.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Changes to This Policy */}
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Changes to This Privacy Policy
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal 
                reasons. We will notify you of any material changes by posting the new Privacy Policy on this page 
                and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                For significant changes, we will provide additional notice (such as email notification or platform announcement).
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information - UPDATED with your actual email */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <Mail className="h-8 w-8 text-white/80 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Contact Us</h3>
                <p className="text-blue-100 mb-3">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                </p>
                <div className="space-y-2 text-sm text-blue-100">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email: alveolyelearning@gmail.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone: +233 (0) 549 556 6116
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address: Accra, Ghana
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-white/80" />
                <p className="text-sm font-semibold">Response Time</p>
                <p className="text-xs text-blue-100">Within 1-3 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Links */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Home
          </Link>
          <Link 
            to="/terms" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            View Terms of Service →
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Alveoly E-Learning Academy of Health & Sciences. All rights reserved.</p>
          <p className="mt-1">This Privacy Policy is compliant with GDPR, CCPA, and Google AdSense Program Policies.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;