"use client";

import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  Shield,
  X,
  Grid,
  List,
  TrendingUp,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Wrap the component to handle useSearchParams in Suspense
function PolicyManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");

  const {
    policies,
    fetchPolicies,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    totalPages,
  } = usePolicies();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    policyType: "",
    priority: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "premium" | "name">("date");

  // Check if any filters are applied
  useEffect(() => {
    setIsFiltering(Object.values(filters).some((value) => value !== ""));
  }, [filters]);

  // Mobile-first: Default to grid view on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        setViewMode("grid");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch policies on component mount and when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.set("search", filters.search);
    if (filters.status) queryParams.set("status", filters.status);
    if (filters.policyType) queryParams.set("policy_type", filters.policyType);
    if (filters.priority) queryParams.set("priority", filters.priority);

    fetchPolicies(currentPage, queryParams);
  }, [currentPage, filters, fetchPolicies]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setShowSuccessAlert(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      policyType: "",
      priority: "",
    });
    setCurrentPage(1);
    setShowFilters(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "life":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "motor":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "home":
        return "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400";
      case "health":
        return "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-400";
      case "travel":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400";
      case "business":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        status: "Expired",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-500/10",
        days: Math.abs(daysUntilExpiry),
        icon: Clock,
        urgency: "high",
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: "Expiring Soon",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-500/10",
        days: daysUntilExpiry,
        icon: Zap,
        urgency: "high",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "Due Soon",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-500/10",
        days: daysUntilExpiry,
        icon: Clock,
        urgency: "medium",
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        status: "Renewal Due",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-500/10",
        days: daysUntilExpiry,
        icon: Calendar,
        urgency: "low",
      };
    } else {
      return {
        status: "Active",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
        days: daysUntilExpiry,
        icon: CheckCircle,
        urgency: "none",
      };
    }
  };

  // Calculate real stats from policies data
  const calculateStats = () => {
    if (loading || !policies.length) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return {
      total: policies.length,
      active: policies.filter((p) => p.status === "active").length,
      expiring: policies.filter((p) => {
        const daysUntilExpiry = Math.ceil(
          (new Date(p.expiration_date).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }).length,
      totalPremium: policies.reduce(
        (sum, policy) => sum + (policy.premium_amount || 0),
        0
      ),
      newThisMonth: policies.filter((p) => {
        const startDate = new Date(p.start_date || p.created_at);
        return (
          startDate.getMonth() === currentMonth &&
          startDate.getFullYear() === currentYear
        );
      }).length,
    };
  };

  const stats = calculateStats();

  // Sort policies based on current sort option
  const sortedPolicies = [...policies].sort((a, b) => {
    switch (sortBy) {
      case "premium":
        return (b.premium_amount || 0) - (a.premium_amount || 0);
      case "name":
        return a.policy_name.localeCompare(b.policy_name);
      case "date":
      default:
        return (
          new Date(b.expiration_date).getTime() -
          new Date(a.expiration_date).getTime()
        );
    }
  });

  // Policy Card Component for Mobile
  const PolicyCard = ({ policy }: { policy: any }) => {
    const expirationStatus = getExpirationStatus(policy.expiration_date);
    const StatusIcon = expirationStatus.icon;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {policy.policy_name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {policy.policy_number}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              policy.status
            )}`}
          >
            {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Client</span>
            <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
              {policy.client?.full_name || "Unknown Client"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Premium</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(policy.premium_amount || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Expires</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(policy.expiration_date)}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center space-x-2 p-2 rounded-lg ${expirationStatus.bgColor} mb-3`}
        >
          <StatusIcon className={`w-4 h-4 ${expirationStatus.color}`} />
          <span className={`text-xs font-medium ${expirationStatus.color}`}>
            {expirationStatus.status} • {expirationStatus.days} days
          </span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPolicyTypeColor(
              policy.policy_type
            )}`}
          >
            {policy.policy_type}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() =>
                router.push(`/dashboard/policy-management/${policy.id}`)
              }
              className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
              aria-label="View policy"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/policy-management/${policy.id}/edit`)
              }
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Edit policy"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stats Card Component
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
    color,
  }: any) => {
    const colorClasses = {
      blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
      green:
        "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
      purple:
        "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
      orange:
        "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
              {title}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
              {loading ? "..." : value}
            </p>
            {trend && !loading && (
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  {trend}
                </span>
              </div>
            )}
            {subtitle && !loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 ${colorClasses[color]}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-28">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Policy Portfolio
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                {loading ? "..." : totalCount} policies managed
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/policy-management/create")}
              className="lg:hidden w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all"
              aria-label="Create new policy"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>
              <button
                onClick={() =>
                  router.push("/dashboard/policy-management/create")
                }
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Policy</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
            <StatsCard
              title="Total Policies"
              value={stats?.total || 0}
              icon={Shield}
              trend={
                stats?.newThisMonth
                  ? `+${stats.newThisMonth} this month`
                  : undefined
              }
              color="blue"
              loading={loading}
            />
            <StatsCard
              title="Active Policies"
              value={stats?.active || 0}
              icon={CheckCircle}
              subtitle={
                stats?.total
                  ? `${Math.round((stats.active / stats.total) * 100)}% active`
                  : undefined
              }
              color="green"
              loading={loading}
            />
            <StatsCard
              title="Expiring Soon"
              value={stats?.expiring || 0}
              icon={Clock}
              subtitle="Next 30 days"
              color="orange"
              loading={loading}
            />
            <StatsCard
              title="Portfolio Value"
              value={formatCurrency(stats?.totalPremium || 0).split(".")[0]}
              icon={DollarSign}
              subtitle={`Avg: ${
                formatCurrency(
                  stats?.totalPremium && stats?.total
                    ? stats.totalPremium / stats.total
                    : 0
                ).split(".")[0]
              }`}
              color="purple"
              loading={loading}
            />
          </div>
        </div>

        {/* Success Alert */}
        {showSuccessAlert && successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-green-800 dark:text-green-400 flex-1">
                {successMessage}
              </span>
              <button
                onClick={() => setShowSuccessAlert(false)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-4">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="lg:flex-1 lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies by name, number, or client..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Filters and Toggle */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 lg:flex-none px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="date">Newest First</option>
                <option value="premium">Highest Premium</option>
                <option value="name">Name A-Z</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {isFiltering && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* View Toggle - Desktop only */}
              <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Policy Type
                </label>
                <select
                  value={filters.policyType}
                  onChange={(e) =>
                    handleFilterChange("policyType", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Types</option>
                  <option value="life">Life Insurance</option>
                  <option value="motor">Motor Insurance</option>
                  <option value="home">Home Insurance</option>
                  <option value="health">Health Insurance</option>
                  <option value="travel">Travel Insurance</option>
                  <option value="business">Business Insurance</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Policies Content */}
        {loading && !policies.length ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading policies...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Policies
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => fetchPolicies(currentPage)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              Try Again
            </button>
          </div>
        ) : sortedPolicies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No Policies Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isFiltering
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first insurance policy."}
            </p>
            {isFiltering ? (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-medium mr-3"
              >
                Clear Filters
              </button>
            ) : null}
            <button
              onClick={() => router.push("/dashboard/policy-management/create")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              Create Policy
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Grid View */}
            <div className="lg:hidden space-y-3">
              {sortedPolicies.map((policy) => (
                <PolicyCard key={policy.id} policy={policy} />
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {sortedPolicies.map((policy) => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Policy
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Client
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Premium
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Status
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Expiration
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPolicies.map((policy) => {
                          const expirationStatus = getExpirationStatus(
                            policy.expiration_date
                          );
                          return (
                            <tr
                              key={policy.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {policy.policy_name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {policy.policy_number}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {policy.client?.full_name || "Unknown"}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(policy.premium_amount || 0)}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    policy.status
                                  )}`}
                                >
                                  {policy.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {formatDate(policy.expiration_date)}
                                </div>
                                <div
                                  className={`text-xs ${expirationStatus.color}`}
                                >
                                  {expirationStatus.status}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/policy-management/${policy.id}`
                                      )
                                    }
                                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
                                    title="View policy"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/policy-management/${policy.id}/edit`
                                      )
                                    }
                                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    title="Edit policy"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalCount)} of {totalCount} policies
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum > totalPages || pageNum < 1) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-all ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - always visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => router.push("/dashboard/policy-management/create")}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all"
          aria-label="Create new policy"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-semibold">Add Policy</span>
        </button>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function PolicyManagementLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-7 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded-xl w-20"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 lg:h-24 bg-gray-300 rounded-xl"></div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-14 bg-gray-300 rounded-xl mb-4"></div>

        {/* Cards Skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PolicyManagementPage() {
  return (
    <Suspense fallback={<PolicyManagementLoading />}>
      <PolicyManagementContent />
    </Suspense>
  );
}