'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  BarChart3, Activity, Target, Zap, Users, FileText,
  Download, Filter, ArrowLeft, AlertCircle, CheckCircle,
  Timer, Hourglass, FastForward, Calendar, Award
} from 'lucide-react';

interface ProcessMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  target: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface ProcessData {
  process: string;
  category: 'policy' | 'claim' | 'payment' | 'renewal';
  averageTime: number;
  target: number;
  volume: number;
  efficiency: number;
  trend: number;
}

interface TeamPerformance {
  member: string;
  role: string;
  avgProcessTime: number;
  tasksCompleted: number;
  efficiency: number;
  improvement: number;
}

export default function ProcessTimeReportPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample process time data
  const processMetrics: ProcessMetric[] = [
    {
      id: 'avg-claim',
      label: 'Avg Claim Processing',
      value: '4.2 days',
      change: -15.3,
      target: '5.0 days',
      status: 'good',
      icon: Clock,
      color: 'from-green-500 to-emerald-600',
      description: 'Average time to process claims'
    },
    {
      id: 'avg-policy',
      label: 'Avg Policy Issuance',
      value: '2.8 days',
      change: -8.5,
      target: '3.0 days',
      status: 'good',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      description: 'Time to issue new policies'
    },
    {
      id: 'avg-renewal',
      label: 'Renewal Processing',
      value: '1.5 days',
      change: 12.0,
      target: '1.0 days',
      status: 'warning',
      icon: Timer,
      color: 'from-yellow-500 to-orange-600',
      description: 'Policy renewal completion time'
    },
    {
      id: 'overall-efficiency',
      label: 'Overall Efficiency',
      value: '87.5%',
      change: 5.2,
      target: '90.0%',
      status: 'good',
      icon: Target,
      color: 'from-purple-500 to-violet-600',
      description: 'Tasks completed within target time'
    }
  ];

  const processData: ProcessData[] = [
    {
      process: 'Motor Insurance Claims',
      category: 'claim',
      averageTime: 3.8,
      target: 5.0,
      volume: 45,
      efficiency: 92.3,
      trend: -12.5
    },
    {
      process: 'Property Claims Assessment',
      category: 'claim',
      averageTime: 6.2,
      target: 7.0,
      volume: 23,
      efficiency: 88.7,
      trend: -8.2
    },
    {
      process: 'New Policy Creation',
      category: 'policy',
      averageTime: 2.8,
      target: 3.0,
      volume: 78,
      efficiency: 94.1,
      trend: -5.8
    },
    {
      process: 'Policy Documentation',
      category: 'policy',
      averageTime: 1.2,
      target: 1.5,
      volume: 125,
      efficiency: 96.8,
      trend: -15.3
    },
    {
      process: 'Premium Collection',
      category: 'payment',
      averageTime: 0.8,
      target: 1.0,
      volume: 89,
      efficiency: 98.2,
      trend: -22.1
    },
    {
      process: 'Policy Renewals',
      category: 'renewal',
      averageTime: 1.5,
      target: 1.0,
      volume: 67,
      efficiency: 78.5,
      trend: 18.7
    }
  ];

  const teamPerformance: TeamPerformance[] = [
    {
      member: 'Thabo Mokgadi',
      role: 'Senior Claims Officer',
      avgProcessTime: 3.2,
      tasksCompleted: 28,
      efficiency: 94.2,
      improvement: -18.5
    },
    {
      member: 'Boitumelo Sekai',
      role: 'Policy Specialist',
      avgProcessTime: 2.1,
      tasksCompleted: 45,
      efficiency: 96.8,
      improvement: -12.3
    },
    {
      member: 'Neo Botshelo',
      role: 'Renewals Coordinator',
      avgProcessTime: 1.8,
      tasksCompleted: 34,
      efficiency: 89.5,
      improvement: 8.7
    },
    {
      member: 'Gaolathe Mogapi',
      role: 'Documentation Officer',
      avgProcessTime: 1.0,
      tasksCompleted: 67,
      efficiency: 98.1,
      improvement: -25.2
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      good: 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      warning: 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      critical: 'text-red-600 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    };
    return colors[status as keyof typeof colors] || colors.good;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'claim': return <Activity className="w-4 h-4" />;
      case 'policy': return <FileText className="w-4 h-4" />;
      case 'payment': return <Users className="w-4 h-4" />;
      case 'renewal': return <Timer className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      claim: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      policy: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      payment: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
      renewal: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[category as keyof typeof colors] || colors.claim;
  };

  const filteredProcessData = processData.filter(process => {
    if (selectedCategory === 'all') return true;
    return process.category === selectedCategory;
  });

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
              Process Time Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Operational efficiency and processing time optimization
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
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border transition-all bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="claim">Claims</option>
              <option value="policy">Policies</option>
              <option value="payment">Payments</option>
              <option value="renewal">Renewals</option>
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

      {/* Process Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {processMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.change >= 0 && metric.status === 'warning' ? 'text-red-600' : 
                  metric.change >= 0 ? 'text-green-600' : 'text-green-600'
                }`}>
                  {metric.change >= 0 && metric.status === 'warning' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : metric.change < 0 ? (
                    <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <div className="mb-3">
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Target: {metric.target}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(metric.status)}`}>
                  {metric.status === 'good' && 'On Track'}
                  {metric.status === 'warning' && 'Attention'}
                  {metric.status === 'critical' && 'Critical'}
                </span>
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
              { id: 'processes', label: 'Process Breakdown' },
              { id: 'team', label: 'Team Performance' },
              { id: 'trends', label: 'Trends' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === tab.id
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
      {selectedView === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Process Time Trends Chart */}
          <div className="lg:col-span-2 p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing Time Trends
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average processing times across categories
                </p>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-80 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Processing Time Analysis
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Interactive chart showing trends over {selectedPeriod}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Claims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Policies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Renewals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Breakdown */}
          <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Efficiency by Category
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasks within target time
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { category: 'Claims Processing', efficiency: 90.3, color: 'bg-blue-500' },
                { category: 'Policy Creation', efficiency: 94.1, color: 'bg-green-500' },
                { category: 'Payment Processing', efficiency: 98.2, color: 'bg-purple-500' },
                { category: 'Renewals', efficiency: 78.5, color: 'bg-orange-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.efficiency}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Efficiency
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  87.5%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Breakdown Table */}
      {selectedView === 'processes' && (
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Process Performance Breakdown
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed analysis of each process type
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Process
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avg Time
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Target
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Volume
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Efficiency
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProcessData.map((process, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(process.category)}`}>
                          {getCategoryIcon(process.category)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {process.process}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 capitalize">
                            {process.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`font-semibold ${
                        process.averageTime <= process.target ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {process.averageTime} days
                      </span>
                    </td>
                    <td className="py-4 text-gray-700 dark:text-gray-300">
                      {process.target} days
                    </td>
                    <td className="py-4 text-gray-700 dark:text-gray-300">
                      {process.volume} tasks
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              process.efficiency >= 90 ? 'bg-green-500' :
                              process.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${process.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {process.efficiency}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className={`flex items-center space-x-1 text-sm font-medium ${
                        process.trend < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {process.trend < 0 ? (
                          <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )}
                        <span>{Math.abs(process.trend)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team Performance */}
      {selectedView === 'team' && (
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Performance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Individual processing efficiency metrics
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {teamPerformance.map((member, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium ${
                      member.efficiency >= 95 ? 'bg-green-600' :
                      member.efficiency >= 90 ? 'bg-blue-600' :
                      member.efficiency >= 85 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {member.member.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {member.member}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {member.efficiency >= 95 && (
                    <Award className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {member.avgProcessTime}d
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Avg Time
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {member.tasksCompleted}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Tasks Done
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {member.efficiency}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Efficiency
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    {member.improvement < 0 ? (
                      <>
                        <ArrowDown className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {Math.abs(member.improvement)}% faster
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          {member.improvement}% slower
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FastForward className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Speed Improvements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Process optimization</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">-15.3%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average processing time reduction
            </p>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>Faster than last quarter</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Target Achievement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">On-time completion</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">87.5%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '87.5%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Target: 90% completion rate
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Process optimization</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">View Active Tasks</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Current workload</p>
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Optimize Workflow</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Efficiency suggestions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}