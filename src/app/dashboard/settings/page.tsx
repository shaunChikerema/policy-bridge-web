'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Shield, Palette, Globe, CreditCard, 
  Download, Upload, Trash2, Save, Check, X,
  Moon, Sun, Monitor, Smartphone, Mail, MessageCircle,
  Lock, Key, Eye, EyeOff, AlertTriangle, Info,
  Camera, Edit3, Settings, Database, HelpCircle, Building2
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface ProviderSetting {
  id: string;
  name: string;
  logo: string;
  status: string;
  enabled: boolean;
  products: string[];
  commissionRate: number;
  apiCredentials: {
    configured: boolean;
    lastTested: string | null;
  };
  quotesIncluded: boolean;
}

export default function SettingsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'Thabo',
    lastName: 'Mokgadi',
    email: 'thabo.mokgadi@policybridge.com',
    phone: '+267 71 234 567',
    jobTitle: 'Senior Insurance Broker',
    company: 'PolicyBridge Insurance',
    bio: 'Experienced insurance professional with over 8 years in the industry.',
    language: 'en',
    timezone: 'Africa/Gaborone',
    currency: 'BWP'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    loginAlerts: true
  });

  const [providerSettings, setProviderSettings] = useState<ProviderSetting[]>([
    {
      id: 'botswana-life',
      name: 'Botswana Life Insurance',
      logo: '/providers/botswana-life-logo.png',
      status: 'connected',
      enabled: true,
      products: ['Life Insurance', 'Pension', 'Group Life', 'Funeral Cover'],
      commissionRate: 12.5,
      apiCredentials: {
        configured: true,
        lastTested: '2024-08-14T10:30:00Z'
      },
      quotesIncluded: true
    },
    {
      id: 'bic',
      name: 'Botswana Insurance Company (BIC)',
      logo: '/providers/bic-logo.png',
      status: 'connected',
      enabled: true,
      products: ['Motor', 'Property', 'Commercial'],
      commissionRate: 10.0,
      apiCredentials: {
        configured: true,
        lastTested: '2024-08-14T09:15:00Z'
      },
      quotesIncluded: true
    },
    {
      id: 'hollard',
      name: 'Hollard Botswana',
      logo: '/providers/hollard-logo.png',
      status: 'connected',
      enabled: true,
      products: ['Motor', 'Home', 'Personal Accident', 'Funeral Cover'],
      commissionRate: 11.0,
      apiCredentials: {
        configured: true,
        lastTested: '2024-08-14T08:45:00Z'
      },
      quotesIncluded: true
    },
    {
      id: 'old-mutual',
      name: 'Old Mutual Botswana',
      logo: '/providers/oldmutual-logo.png',
      status: 'not-configured',
      enabled: false,
      products: ['Life Insurance', 'Investments', 'Unit Trusts'],
      commissionRate: 8.5,
      apiCredentials: {
        configured: false,
        lastTested: null
      },
      quotesIncluded: false
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'policy_expiry',
      title: 'Policy Expiry Alerts',
      description: 'Get notified when policies are about to expire',
      enabled: true,
      channels: { email: true, push: true, sms: false }
    },
    {
      id: 'new_claims',
      title: 'New Claims',
      description: 'Notifications for new claim submissions',
      enabled: true,
      channels: { email: true, push: true, sms: true }
    },
    {
      id: 'payment_reminders',
      title: 'Payment Reminders',
      description: 'Reminders for overdue premium payments',
      enabled: true,
      channels: { email: true, push: false, sms: true }
    }
  ]);

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    compactMode: false,
    showAnimations: true,
    tableRowsPerPage: 25,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your personal information and preferences'
    },
    {
      id: 'providers',
      title: 'Insurance Providers',
      icon: Building2,
      description: 'Manage connections to insurance companies'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Shield,
      description: 'Password, two-factor authentication'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configure how you receive notifications'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel'
    },
    {
      id: 'system',
      title: 'System Preferences',
      icon: Settings,
      description: 'Language, timezone, and regional settings'
    },
    {
      id: 'data',
      title: 'Data & Export',
      icon: Database,
      description: 'Manage your data, exports, and backups'
    }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const toggleProvider = (providerId: string, field: 'enabled' | 'quotesIncluded') => {
    setProviderSettings(prev => prev.map(provider => 
      provider.id === providerId ? { ...provider, [field]: !provider[field] } : provider
    ));
  };

  const updateCommissionRate = (providerId: string, rate: number) => {
    setProviderSettings(prev => prev.map(provider => 
      provider.id === providerId ? { ...provider, commissionRate: rate } : provider
    ));
  };

  const testProviderConnection = async (providerId: string) => {
    setProviderSettings(prev => prev.map(provider => 
      provider.id === providerId ? {
        ...provider,
        apiCredentials: {
          ...provider.apiCredentials,
          lastTested: new Date().toISOString()
        }
      } : provider
    ));
  };

  const toggleNotification = (id: string, field?: 'email' | 'push' | 'sms') => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === id) {
        return field ? {
          ...notification,
          channels: {
            ...notification.channels,
            [field]: !notification.channels[field]
          }
        } : {
          ...notification,
          enabled: !notification.enabled
        };
      }
      return notification;
    }));
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Upload a professional photo for your profile
          </p>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Upload Photo
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={profileData.jobTitle}
            onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company
          </label>
          <input
            type="text"
            value={profileData.company}
            onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderProvidersSection = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center space-x-3 mb-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-400">Integration Status</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700 dark:text-blue-300">Connected Providers</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
              {providerSettings.filter(p => p.status === 'connected').length}
            </p>
          </div>
          <div>
            <p className="text-blue-700 dark:text-blue-300">Active Integrations</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
              {providerSettings.filter(p => p.enabled).length}
            </p>
          </div>
          <div>
            <p className="text-blue-700 dark:text-blue-300">Quote Providers</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-400">
              {providerSettings.filter(p => p.quotesIncluded).length}
            </p>
          </div>
        </div>
      </div>

      {providerSettings.map((provider) => (
        <div key={provider.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {provider.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    provider.status === 'connected' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {provider.status === 'connected' ? 'Connected' : 'Not Configured'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {provider.products.join(', ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {provider.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => toggleProvider(provider.id, 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  provider.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                disabled={!provider.apiCredentials.configured}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    provider.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={provider.commissionRate}
                onChange={(e) => updateCommissionRate(provider.id, parseFloat(e.target.value) || 0)}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                disabled={!provider.enabled}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Connection Status
              </label>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  provider.apiCredentials.configured
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {provider.apiCredentials.configured ? 'Configured' : 'Not Configured'}
                </span>
                {provider.apiCredentials.configured && (
                  <button
                    onClick={() => testProviderConnection(provider.id)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Test Connection
                  </button>
                )}
              </div>
              {provider.apiCredentials.lastTested && (
                <p className="text-xs text-gray-500 mt-1">
                  Last tested: {new Date(provider.apiCredentials.lastTested).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Include in Quote Comparisons
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically include this provider when generating quotes
              </p>
            </div>
            <button
              onClick={() => toggleProvider(provider.id, 'quotesIncluded')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                provider.quotesIncluded ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              disabled={!provider.enabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  provider.quotesIncluded ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {!provider.apiCredentials.configured && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-400">
                    Configuration Required
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    API credentials need to be configured before this provider can be enabled.
                  </p>
                </div>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  Configure API
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="text-center">
          <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Additional Providers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            More insurance providers will be added as integrations become available.
          </p>
          <p className="text-xs text-gray-500">
            Coming soon: Botswana Eagle, Alpha Direct, Bomaid Medical Aid
          </p>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Update your password to keep your account secure
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              securityData.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {securityData.twoFactorEnabled && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-400">
                  Two-Factor Authentication Enabled
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account is secured with authenticator app verification.
                </p>
              </div>
              <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                View Backup Codes
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Login Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified when someone logs into your account
              </p>
            </div>
          </div>
          <button
            onClick={() => setSecurityData(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              securityData.loginAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                securityData.loginAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Monitor className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your active login sessions across devices
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Monitor className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Gaborone, Botswana • Chrome</p>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Mobile App</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Last active 2 hours ago</p>
              </div>
            </div>
            <button className="text-xs text-red-600 hover:text-red-700 font-medium">
              Revoke
            </button>
          </div>
        </div>
        
        <button className="mt-4 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
          Sign Out All Other Sessions
        </button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      {notifications.map((notification) => (
        <div key={notification.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notification.description}
              </p>
            </div>
            <button
              onClick={() => toggleNotification(notification.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notification.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notification.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {notification.enabled && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notification Channels
              </p>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notification.channels.email}
                    onChange={() => toggleNotification(notification.id, 'email')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notification.channels.push}
                    onChange={() => toggleNotification(notification.id, 'push')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notification.channels.sms}
                    onChange={() => toggleNotification(notification.id, 'sms')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'light' }))}
            className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              appearanceSettings.theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-sm font-medium">Light</span>
          </button>
          
          <button
            onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'dark' }))}
            className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              appearanceSettings.theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          
          <button
            onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'system' }))}
            className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              appearanceSettings.theme === 'system'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Compact Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reduce spacing and padding throughout the interface
            </p>
          </div>
          <button
            onClick={() => setAppearanceSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              appearanceSettings.compactMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                appearanceSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Show Animations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable smooth transitions and animations
            </p>
          </div>
          <button
            onClick={() => setAppearanceSettings(prev => ({ ...prev, showAnimations: !prev.showAnimations }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              appearanceSettings.showAnimations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                appearanceSettings.showAnimations ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Table Display</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rows Per Page
          </label>
          <select
            value={appearanceSettings.tableRowsPerPage}
            onChange={(e) => setAppearanceSettings(prev => ({ ...prev, tableRowsPerPage: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={profileData.language}
            onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="tn">Setswana</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={profileData.timezone}
            onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="Africa/Gaborone">Africa/Gaborone (CAT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={profileData.currency}
            onChange={(e) => setProfileData(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="BWP">Botswana Pula (BWP)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="ZAR">South African Rand (ZAR)</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={appearanceSettings.dateFormat}
            onChange={(e) => setAppearanceSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (14/08/2024)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (08/14/2024)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-08-14)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Format
          </label>
          <select
            value={appearanceSettings.timeFormat}
            onChange={(e) => setAppearanceSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="24h">24 Hour (14:30)</option>
            <option value="12h">12 Hour (2:30 PM)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Export Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download your data in various formats
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-3">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export as CSV</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export as Excel</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export as PDF</span>
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Import Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import clients, policies, or claims from external sources
            </p>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Drag and drop files here, or click to browse
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Choose Files
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Data Backup</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage backups of your data
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Last Backup</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">August 13, 2024 at 11:30 PM</p>
            </div>
            <span className="text-xs text-green-600 font-medium">Completed</span>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              Create Backup
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
              View History
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Irreversible and destructive actions
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium">
            Clear All Data
          </button>
          
          <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'providers': return renderProvidersSection();
      case 'security': return renderSecuritySection();
      case 'notifications': return renderNotificationsSection();
      case 'appearance': return renderAppearanceSection();
      case 'system': return renderSystemSection();
      case 'data': return renderDataSection();
      default: return renderProfileSection();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your account preferences and system configuration
            </p>
          </div>

          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800 dark:text-green-400 font-medium">
                Settings saved successfully!
              </p>
            </div>
          )}

          <div className="lg:flex lg:space-x-8">
            <div className="lg:w-1/4 mb-8 lg:mb-0">
              <nav className="space-y-2 sticky top-8">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                        activeSection === section.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${
                        activeSection === section.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {section.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {renderActiveSection()}
                
                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}