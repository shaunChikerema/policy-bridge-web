'use client';

import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Users, 
  Shield, 
  Calculator, 
  Calendar, 
  Settings, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Play,
  Download
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Learn the basics of using Policy-Bridge'
    },
    {
      id: 'client-management',
      title: 'Client Management',
      icon: Users,
      description: 'Managing clients and their information'
    },
    {
      id: 'policy-management',
      title: 'Policy Management',
      icon: Shield,
      description: 'Creating and managing insurance policies'
    },
    {
      id: 'claims-processing',
      title: 'Claims Processing',
      icon: FileText,
      description: 'Handling insurance claims efficiently'
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: Calculator,
      description: 'Payment processing and billing management'
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: Calendar,
      description: 'Generating reports and analyzing data'
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      icon: Settings,
      description: 'System settings and customization'
    }
  ];

  const quickActions = [
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Play,
      color: 'bg-blue-500 text-white'
    },
    {
      title: 'Download User Manual',
      description: 'Complete PDF documentation',
      icon: Download,
      color: 'bg-green-500 text-white'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: MessageCircle,
      color: 'bg-purple-500 text-white'
    },
    {
      title: 'System Status',
      description: 'Check current system status',
      icon: ExternalLink,
      color: 'bg-orange-500 text-white'
    }
  ];

  const faqData = {
    'getting-started': [
      {
        question: 'How do I log in to Policy-Bridge?',
        answer: 'Use your registered email address and password on the login page. If you forgot your password, click "Forgot Password" to reset it.'
      },
      {
        question: 'What browsers are supported?',
        answer: 'Policy-Bridge works best with modern browsers including Chrome (v90+), Firefox (v88+), Safari (v14+), and Edge (v90+).'
      },
      {
        question: 'How do I navigate the dashboard?',
        answer: 'Use the sidebar navigation to access different sections. The dashboard provides an overview of your key metrics and recent activities.'
      }
    ],
    'client-management': [
      {
        question: 'How do I add a new client?',
        answer: 'Go to Client Management and click "Add New Client". Fill in the required information including personal details, contact information, and any relevant notes.'
      },
      {
        question: 'Can I import clients from another system?',
        answer: 'Yes, you can import clients using our CSV import feature. Download the template from the Client Management page and follow the format guidelines.'
      },
      {
        question: 'How do I search for existing clients?',
        answer: 'Use the search bar in Client Management to search by name, email, phone number, or policy number. You can also use filters to narrow down results.'
      }
    ],
    'policy-management': [
      {
        question: 'What types of policies can I create?',
        answer: 'Policy-Bridge supports various insurance types including auto, home, life, health, and commercial insurance policies.'
      },
      {
        question: 'How do I set up automatic renewals?',
        answer: 'When creating or editing a policy, enable the "Auto-renewal" option and set your preferred renewal terms and notification schedule.'
      },
      {
        question: 'Can I customize policy templates?',
        answer: 'Yes, you can create and customize policy templates in Settings > Policy Templates to streamline the policy creation process.'
      }
    ],
    'claims-processing': [
      {
        question: 'How do I file a new claim?',
        answer: 'Go to Claims Management, click "New Claim", select the policy, and fill in the claim details including incident date, description, and supporting documents.'
      },
      {
        question: 'What documents can I upload for claims?',
        answer: 'You can upload various file types including photos, PDFs, Word documents, and spreadsheets. Maximum file size is 10MB per document.'
      },
      {
        question: 'How do I track claim status?',
        answer: 'Each claim has a status indicator. You can view detailed progress and add notes in the claim details page. Automated notifications keep all parties informed.'
      }
    ]
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const currentFaqs = faqData[activeCategory as keyof typeof faqData] || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help Center</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Find answers, get support, and learn how to use Policy-Bridge effectively
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {action.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
            <nav className="space-y-1">
              {helpCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{category.title}</div>
                      <div className="text-xs opacity-75">{category.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {helpCategories.find(cat => cat.id === activeCategory)?.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {helpCategories.find(cat => cat.id === activeCategory)?.description}
              </p>
            </div>

            {/* FAQ Section */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {currentFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Need More Help?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Live Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Get instant help from our support team
              </p>
              <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                Start Chat
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Phone Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Mon-Fri 9AM-6PM EST
              </p>
              <a href="tel:+1-800-555-0123" className="text-green-600 dark:text-green-400 text-sm hover:underline">
                +1 (800) 555-0123
              </a>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                We'll respond within 24 hours
              </p>
              <a href="mailto:support@policy-bridge.com" className="text-purple-600 dark:text-purple-400 text-sm hover:underline">
                support@policy-bridge.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}