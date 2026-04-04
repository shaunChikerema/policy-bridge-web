'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, DollarSign, Users, FileText, Calendar, Clock,
  BarChart3, PieChart, Activity, ArrowUp, ArrowDown, 
  Download, Filter, RefreshCw, Eye, ChevronRight
} from 'lucide-react';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  metrics: {
    primary: string;
    secondary: string;
    change: number;
  };
}

interface QuickStat {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
}

export default function ReportsPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const reportCards: ReportCard[] = [
    {
      id: 'revenue',
      title: 'Revenue Analytics',
      description: 'Track commission earnings, premium collections, and financial performance',
      icon: DollarSign,
      path: '/reports/revenue',
      color: 'from-green-500 to-emerald-600',
      metrics: {
        primary: 'P 847,250.00',
        secondary: 'Total Revenue',
        change: 12.5
      }
    },
    {
      id: 'renewals',
      title: 'Renewals Report',
      description: 'Monitor policy renewal rates, upcoming renewals, and retention metrics',
      icon: RefreshCw,
      path: '/reports/renewals',
      color: 'from-blue-500 to-indigo-600',
      metrics: {
        primary: '89.2%',
        secondary: 'Renewal Rate',
        change: 5.8
      }
    },
    {
      id: 'process-time',
      title: 'Process Time Analytics',
      description: 'Analyze claim processing times, policy issuance, and operational efficiency',
      icon: Clock,
      path: '/reports/process-time',
      color: 'from-purple-500 to-violet-600',
      metrics: {
        primary: '4.2 days',
        secondary: 'Avg Process Time',
        change: -15.3
      }
    }
  ];

  const quickStats: QuickStat[] = [
    {
      label: 'Active Policies',
      value: '1,247',
      change: 8.2,
      icon: FileText
    },
    {
      label: 'Active Claims',
      value: '23',
      change: -12.5,
      icon: Activity
    },
    {
      label: 'Total Clients',
      value: '892',
      change: 15.7,
      icon: Users
    },
    {
      label: 'This Month Revenue',
      value: 'P 234,580.00',
      change: 18.9,
      icon: TrendingUp
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'policy_created',
      title: 'New Motor Policy Created',
      client: 'Thabo Mokgadi',
      time: '2 hours ago',
      amount: 'P 45,000.00'
    },
    {
      id: 2,
      type: 'claim_approved',
      title: 'Property Claim Approved',
      client: 'Boitumelo Sekai',
      time: '4 hours ago',
      amount: 'P 120,000.00'
    },
    {
      id: 3,
      type: 'payment_received',
      title: 'Premium Payment Received',
      client: 'Neo Botshelo',
      time: '6 hours ago',
      amount: 'P 8,500.00'
    },
    {
      id: 4,
      type: 'policy_renewed',
      title: 'Health Policy Renewed',
      client: 'Gaolathe Mogapi',
      time: '1 day ago',
      amount: 'P 15,200.00'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'policy_created': return <FileText className="w-4 h-4" />;
      case 'claim_approved': return <Activity className="w-4 h-4" />;
      case 'payment_received': return <DollarSign className="w-4 h-4" />;
      case 'policy_renewed': return <RefreshCw className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'policy_created': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'claim_approved': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'payment_received': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'policy_renewed': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className={`transition-all duration-1000 ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive business insights and performance metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 rounded-lg border transition-all bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reportCards.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="group p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
                onClick={() => router.push(report.path)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.metrics.primary}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {report.metrics.secondary}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    report.metrics.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {report.metrics.change >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(report.metrics.change)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Overview Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Overview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revenue and policy trends over time
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Placeholder for chart */}
          <div className="h-64 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive chart would be rendered here
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Using Chart.js or Recharts library
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Policies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Claims</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/reports/revenue')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Latest business activities
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.client} • {activity.time}
                  </p>
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Report Actions
          </h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/reports/revenue')}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <DollarSign className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Revenue Report</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Financial analytics</p>
          </button>
          
          <button
            onClick={() => router.push('/reports/renewals')}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <RefreshCw className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Renewals Report</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Policy renewals</p>
          </button>
          
          <button
            onClick={() => router.push('/reports/process-time')}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Clock className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Process Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency metrics</p>
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <BarChart3 className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Custom Report</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Build your own</p>
          </button>
        </div>
      </div>
    </div>
  );
}