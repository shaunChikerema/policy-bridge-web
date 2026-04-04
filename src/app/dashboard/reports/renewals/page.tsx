'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Calendar, AlertCircle, CheckCircle, Clock,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, Users,
  DollarSign, Download, Filter, ArrowLeft, Bell, Mail,
  Eye, Edit, Phone, FileText, Target, Percent, Zap
} from 'lucide-react';

interface RenewalPolicy {
  id: string;
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  policyType: string;
  insurer: string;
  currentPremium: number;
  renewalDate: string;
  status: 'upcoming' | 'overdue' | 'renewed' | 'cancelled';
  daysToRenewal: number;
  renewalProbability: number;
  lastRenewalDate?: string;
}

interface RenewalMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export default function RenewalsReportPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample renewal data
  const renewalPolicies: RenewalPolicy[] = [
    {
      id: 'POL-2024-001',
      client: {
        name: 'Thabo Mokgadi',
        company: 'Tech Solutions Ltd',
        email: 'thabo@techsolutions.co.bw',
        phone: '+267 72 123 456'
      },
      policyType: 'Motor Comprehensive',
      insurer: 'Old Mutual',
      currentPremium: 45000,
      renewalDate: '2024-08-20',
      status: 'upcoming',
      daysToRenewal: 6,
      renewalProbability: 85,
      lastRenewalDate: '2023-08-20'
    },
    {
      id: 'POL-2024-002',
      client: {
        name: 'Boitumelo Sekai',
        company: 'Sekai Enterprises',
        email: 'boitumelo@sekai.co.bw',
        phone: '+267 71 987 654'
      },
      policyType: 'Property Insurance',
      insurer: 'Botswana Insurance',
      currentPremium: 120000,
      renewalDate: '2024-08-25',
      status: 'upcoming',
      daysToRenewal: 11,
      renewalProbability: 92,
      lastRenewalDate: '2023-08-25'
    },
    {
      id: 'POL-2024-003',
      client: {
        name: 'Neo Botshelo',
        company: 'Freelancer',
        email: 'neo.botshelo@gmail.com',
        phone: '+267 73 444 789'
      },
      policyType: 'Health Insurance',
      insurer: 'Metropolitan Life',
      currentPremium: 15000,
      renewalDate: '2024-08-10',
      status: 'overdue',
      daysToRenewal: -4,
      renewalProbability: 65
    },
    {
      id: 'POL-2024-004',
      client: {
        name: 'Gaolathe Mogapi',
        company: 'Mogapi Transport',
        email: 'gaolathe@mogapi.co.bw',
        phone: '+267 76 321 654'
      },
      policyType: 'Commercial Vehicle',
      insurer: 'Old Mutual',
      currentPremium: 85000,
      renewalDate: '2024-07-15',
      status: 'renewed',
      daysToRenewal: -30,
      renewalProbability: 100,
      lastRenewalDate: '2024-07-15'
    },
    {
      id: 'POL-2024-005',
      client: {
        name: 'Kealeboga Matlho',
        company: 'Matlho Industries',
        email: 'k.matlho@matlho.co.bw',
        phone: '+267 72 555 123'
      },
      policyType: 'Business Insurance',
      insurer: 'Botswana Life',
      currentPremium: 200000,
      renewalDate: '2024-09-01',
      status: 'upcoming',
      daysToRenewal: 18,
      renewalProbability: 78
    }
  ];

  const renewalMetrics: RenewalMetric[] = [
    {
      label: 'Renewal Rate',
      value: '89.2%',
      change: 5.8,
      icon: RefreshCw,
      color: 'from-blue-500 to-indigo-600',
      description: 'Policies successfully renewed'
    },
    {
      label: 'Upcoming Renewals',
      value: String(renewalPolicies.filter(p => p.status === 'upcoming').length),
      change: 12.5,
      icon: Calendar,
      color: 'from-green-500 to-emerald-600',
      description: 'Due within 30 days'
    },
    {
      label: 'Overdue Policies',
      value: String(renewalPolicies.filter(p => p.status === 'overdue').length),
      change: -25.0,
      icon: AlertCircle,
      color: 'from-red-500 to-rose-600',
      description: 'Past renewal date'
    },
    {
      label: 'Renewal Value',
      value: 'P 465K',
      change: 18.3,
      icon: DollarSign,
      color: 'from-purple-500 to-violet-600',
      description: 'Upcoming premium value'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BW', {
      style: 'currency',
      currency: 'BWP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      overdue: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      renewed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    };
    return colors[status as keyof typeof colors] || colors.upcoming;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'renewed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const filteredPolicies = renewalPolicies.filter(policy => {
    if (statusFilter === 'all') return true;
    return policy.status === statusFilter;
  });

  const upcomingRenewals = renewalPolicies.filter(p => p.status === 'upcoming' && p.daysToRenewal <= 7);
  const overdueRenewals = renewalPolicies.filter(p => p.status === 'overdue');

  return (
    <div className={`transition-all duration-1000 ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/reports')}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Renewals Report
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Policy renewal tracking and retention analytics
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 rounded-lg border transition-all bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7d">Next 7 days</option>
              <option value="30d">Next 30 days</option>
              <option value="90d">Next 90 days</option>
              <option value="1y">Next year</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border transition-all bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="renewed">Renewed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {(upcomingRenewals.length > 0 || overdueRenewals.length > 0) && (
        <div className="mb-8 p-4 rounded-xl border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/50">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Renewal Alerts
              </h3>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                {upcomingRenewals.length > 0 && (
                  <p>• {upcomingRenewals.length} policy{upcomingRenewals.length > 1 ? 'ies' : 'y'} due within 7 days</p>
                )}
                {overdueRenewals.length > 0 && (
                  <p>• {overdueRenewals.length} overdue renewal{overdueRenewals.length > 1 ? 's' : ''} requiring immediate attention</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renewalMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {metric.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {metric.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'renewed', label: 'Recently Renewed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Renewal Trend Chart */}
          <div className="lg:col-span-2 p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Renewal Trends
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly renewal rates and patterns
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-80 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renewal Rate Trends
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Chart showing renewal success rates over time
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Renewed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Type Breakdown */}
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Renewal by Type
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Success rates by policy
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { type: 'Motor Insurance', rate: 92, count: 45, color: 'bg-blue-500' },
                { type: 'Property Insurance', rate: 88, count: 32, color: 'bg-green-500' },
                { type: 'Health Insurance', rate: 85, count: 28, color: 'bg-purple-500' },
                { type: 'Life Insurance', rate: 95, count: 18, color: 'bg-orange-500' },
                { type: 'Business Insurance', rate: 78, count: 12, color: 'bg-red-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.type}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.rate}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.rate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500 w-12">
                      {item.count} policies
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Renewal Policies Table */}
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedTab === 'upcoming' && 'Upcoming Renewals'}
              {selectedTab === 'overdue' && 'Overdue Renewals'}
              {selectedTab === 'renewed' && 'Recently Renewed'}
              {selectedTab === 'overview' && 'All Renewal Policies'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPolicies.length} policies found
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Policy & Client
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Premium
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Renewal Date
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Probability
                </th>
                <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {policy.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {policy.policyType} - {policy.insurer}
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {policy.client.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {policy.client.company}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(policy.currentPremium)}
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(policy.renewalDate).toLocaleDateString()}
                      </p>
                      <p className={`text-xs font-medium ${
                        policy.daysToRenewal < 0 
                          ? 'text-red-600' 
                          : policy.daysToRenewal <= 7 
                            ? 'text-yellow-600' 
                            : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {policy.daysToRenewal < 0 
                          ? `${Math.abs(policy.daysToRenewal)} days overdue`
                          : `${policy.daysToRenewal} days remaining`
                        }
                      </p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 w-fit ${getStatusColor(policy.status)}`}>
                      {getStatusIcon(policy.status)}
                      <span className="capitalize">{policy.status}</span>
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            policy.renewalProbability >= 80 ? 'bg-green-500' :
                            policy.renewalProbability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${policy.renewalProbability}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getProbabilityColor(policy.renewalProbability)}`}>
                        {policy.renewalProbability}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/policy-management/${policy.id}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                        title="View Policy"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                        title="Contact Client"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                        title="Call Client"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPolicies.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              No renewals found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Renewal Goals</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly targets</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">78%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Target: 85% renewal rate
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Success Rate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 6 months</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">89.2%</p>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+5.8% from previous period</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Renewal management</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Send Reminders</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Notify upcoming renewals</p>
            </button>
            <button 
              onClick={() => router.push('/calendar')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">View Calendar</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Renewal schedule</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}