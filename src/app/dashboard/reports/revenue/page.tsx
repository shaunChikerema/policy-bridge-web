'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  Download, Filter, Calendar, BarChart3, PieChart, Users,
  FileText, CreditCard, Target, Zap, ChevronDown, Eye,
  ArrowLeft, RefreshCw, Percent
} from 'lucide-react';

interface RevenueData {
  period: string;
  totalRevenue: number;
  commissions: number;
  premiumsCollected: number;
  newPolicies: number;
  renewals: number;
}

interface TopPerformer {
  id: string;
  name: string;
  company: string;
  revenue: number;
  policies: number;
  growth: number;
}

export default function RevenueReportPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample revenue data
  const revenueData: RevenueData[] = [
    { period: 'Week 1', totalRevenue: 180000, commissions: 27000, premiumsCollected: 153000, newPolicies: 12, renewals: 8 },
    { period: 'Week 2', totalRevenue: 220000, commissions: 33000, premiumsCollected: 187000, newPolicies: 15, renewals: 11 },
    { period: 'Week 3', totalRevenue: 195000, commissions: 29250, premiumsCollected: 165750, newPolicies: 13, renewals: 9 },
    { period: 'Week 4', totalRevenue: 252000, commissions: 37800, premiumsCollected: 214200, newPolicies: 18, renewals: 14 }
  ];

  const topPerformers: TopPerformer[] = [
    { id: '1', name: 'Thabo Mokgadi', company: 'Tech Solutions Ltd', revenue: 156000, policies: 8, growth: 23.5 },
    { id: '2', name: 'Boitumelo Sekai', company: 'Sekai Enterprises', revenue: 142000, policies: 12, growth: 18.2 },
    { id: '3', name: 'Neo Botshelo', company: 'Botshelo Holdings', revenue: 128000, policies: 9, growth: 15.8 },
    { id: '4', name: 'Gaolathe Mogapi', company: 'Mogapi Transport', revenue: 98000, policies: 6, growth: 12.1 },
    { id: '5', name: 'Kealeboga Matlho', company: 'Matlho Industries', revenue: 87000, policies: 7, growth: 8.9 }
  ];

  const currentTotals = revenueData.reduce((acc, curr) => ({
    totalRevenue: acc.totalRevenue + curr.totalRevenue,
    commissions: acc.commissions + curr.commissions,
    premiumsCollected: acc.premiumsCollected + curr.premiumsCollected,
    newPolicies: acc.newPolicies + curr.newPolicies,
    renewals: acc.renewals + curr.renewals
  }), { totalRevenue: 0, commissions: 0, premiumsCollected: 0, newPolicies: 0, renewals: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BW', {
      style: 'currency',
      currency: 'BWP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const revenueMetrics = [
    {
      id: 'total',
      label: 'Total Revenue',
      value: formatCurrency(currentTotals.totalRevenue),
      change: 18.5,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      description: 'All revenue sources combined'
    },
    {
      id: 'commissions',
      label: 'Commission Earned',
      value: formatCurrency(currentTotals.commissions),
      change: 22.1,
      icon: Percent,
      color: 'from-blue-500 to-indigo-600',
      description: 'Broker commissions received'
    },
    {
      id: 'premiums',
      label: 'Premiums Collected',
      value: formatCurrency(currentTotals.premiumsCollected),
      change: 17.8,
      icon: CreditCard,
      color: 'from-purple-500 to-violet-600',
      description: 'Client premium payments'
    },
    {
      id: 'avg-policy',
      label: 'Avg Policy Value',
      value: formatCurrency(Math.round(currentTotals.totalRevenue / (currentTotals.newPolicies + currentTotals.renewals))),
      change: -5.2,
      icon: Target,
      color: 'from-orange-500 to-red-600',
      description: 'Average value per policy'
    }
  ];

  const policyBreakdown = [
    { type: 'Motor Insurance', revenue: 312000, percentage: 36.8, color: 'bg-blue-500' },
    { type: 'Property Insurance', revenue: 198000, percentage: 23.4, color: 'bg-green-500' },
    { type: 'Health Insurance', revenue: 156000, percentage: 18.4, color: 'bg-purple-500' },
    { type: 'Life Insurance', revenue: 142000, percentage: 16.8, color: 'bg-orange-500' },
    { type: 'Business Insurance', revenue: 39000, percentage: 4.6, color: 'bg-red-500' }
  ];

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
              Revenue Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed financial performance and commission tracking
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
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Bar
              </button>
            </div>
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

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueMetrics.map((metric) => {
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

      {/* Main Chart and Policy Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trend
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Weekly revenue performance over the selected period
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="revenue">Total Revenue</option>
                <option value="commissions">Commissions</option>
                <option value="premiums">Premiums</option>
              </select>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-80 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revenue Trend Chart
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Interactive chart showing {selectedMetric} over {selectedPeriod}
              </p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Commissions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Premiums</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Peak: {formatCurrency(Math.max(...revenueData.map(d => d.totalRevenue)))}
            </div>
          </div>
        </div>

        {/* Policy Type Breakdown */}
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Policy Breakdown
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revenue by policy type
              </p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {policyBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.type}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 w-10">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Revenue
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(policyBreakdown.reduce((acc, item) => acc + item.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Clients */}
      <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Revenue Clients
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Highest revenue generating clients this period
            </p>
          </div>
          <button 
            onClick={() => router.push('/client-management')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Clients →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Revenue
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Policies
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Growth
                </th>
                <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topPerformers.map((client, index) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {client.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(client.revenue)}
                  </td>
                  <td className="py-4 text-gray-700 dark:text-gray-300">
                    {client.policies} policies
                  </td>
                  <td className="py-4">
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      client.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {client.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(client.growth)}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => router.push(`/client-management/${client.id}`)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Goal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target achievement</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">84.7%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '84.7%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-500">Target: P 1M</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">Remaining: P 153K</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Client Value</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average per client</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(Math.round(currentTotals.totalRevenue / topPerformers.length))}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on top {topPerformers.length} clients
            </p>
            <div className="flex items-center space-x-1 text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+12.3% from last month</span>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue optimization</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/policy-management/create')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">Create New Policy</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Generate more revenue</p>
            </button>
            <button 
              onClick={() => router.push('/reports/renewals')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">Check Renewals</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Upcoming renewals</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}