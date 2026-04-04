// src\app\dashboard\claims-management\page.tsx
"use client";

import { useClaims } from "@/hooks/useClaims";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// Status configurations
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
    icon: Clock,
  },
  investigating: {
    label: "Investigating",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    icon: CheckCircle2,
  },
  denied: {
    label: "Denied",
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    icon: X,
  },
  settled: {
    label: "Settled",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400",
    icon: FileText,
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    icon: TrendingUp,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
    icon: Target,
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    icon: Zap,
  },
};

const CLAIM_TYPES = [
  "Motor Accident", "Property Damage", "Life Insurance", "Health Insurance",
  "Travel Insurance", "Business Insurance", "Fire Damage", "Theft",
  "Natural Disaster", "Personal Injury", "Professional Liability", "Other"
];

// Loading component
function ClaimsManagementLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-7 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded-xl w-20"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 lg:h-24 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
        <div className="h-14 bg-gray-300 rounded-xl mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, trend, subtitle, color, loading }: any) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">
            {value}
          </p>
          {trend && (
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400">
                {trend}
              </span>
            </div>
          )}
          {subtitle && (
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

// Claim Card Component for Mobile
const ClaimCard = ({ claim }: { claim: any }) => {
  const statusConfig = STATUS_CONFIG[claim.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const priorityConfig = PRIORITY_CONFIG[claim.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

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

  const calculateDaysOpen = (createdDate: string) => {
    const created = new Date(createdDate);
    const today = new Date();
    return Math.floor((today.getTime() - created.getTime()) / (1000 * 3600 * 24));
  };

  const daysOpen = calculateDaysOpen(claim.created_at);
  const isUrgent = claim.priority === "critical" || (claim.priority === "high" && daysOpen > 7);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {claim.claim_number || `CLAIM-${claim.id.slice(0, 8)}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {claim.claim_type?.toLowerCase()}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Client</span>
          <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
            {claim.client?.full_name || "Unknown Client"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Amount</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {claim.claim_amount ? formatCurrency(claim.claim_amount) : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Incident Date</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatDate(claim.incident_date)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}
        >
          <PriorityIcon className="w-3 h-3 mr-1" />
          {priorityConfig.label}
        </span>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {daysOpen} days ago
        </div>
      </div>

      {isUrgent && (
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 dark:bg-red-500/10 mb-3">
          <Zap className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Requires immediate attention
          </span>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {claim.description?.substring(0, 60)}...
        </div>
        <div className="flex space-x-1">
          <Link
            href={`/dashboard/claims-management/${claim.id}`}
            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
            aria-label="View claim"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/dashboard/claims-management/${claim.id}/edit`}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label="Edit claim"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

function ClaimsManagementContent() {
  const router = useRouter();
  const {
    claims,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchClaims,
    deleteClaim,
    deleting,
    clearError,
  } = useClaims();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    claimType: "",
    priority: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "priority">("date");
  const [isFiltering, setIsFiltering] = useState(false);

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

  // Fetch claims when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.set("search", filters.search);
    if (filters.status) queryParams.set("status", filters.status);
    if (filters.claimType) queryParams.set("claim_type", filters.claimType);
    if (filters.priority) queryParams.set("priority", filters.priority);

    fetchClaims(1, queryParams);
  }, [filters, fetchClaims]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      claimType: "",
      priority: "",
    });
    setShowFilters(false);
  };

  const handleDelete = async (id: string, claimNumber: string) => {
    if (confirm(`Are you sure you want to delete claim ${claimNumber}?`)) {
      const success = await deleteClaim(id);
      if (success) {
        fetchClaims(currentPage);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  // Calculate stats from claims data
  const calculateStats = () => {
    if (loading || !claims.length) return null;

    const totalAmount = claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);
    const approvedAmount = claims
      .filter((c) => c.status === "approved")
      .reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);

    return {
      total: claims.length,
      pending: claims.filter((c) => c.status === "pending").length,
      approved: claims.filter((c) => c.status === "approved").length,
      highPriority: claims.filter((c) => c.priority === "high" || c.priority === "critical").length,
      totalAmount,
      approvedAmount,
      averageAmount: totalAmount / claims.length,
    };
  };

  const stats = calculateStats();

  // Sort claims based on current sort option
  const sortedClaims = [...claims].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return (b.claim_amount || 0) - (a.claim_amount || 0);
      case "priority":
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case "date":
      default:
        return new Date(b.incident_date).getTime() - new Date(a.incident_date).getTime();
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Claims
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchClaims(1)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20 lg:pb-0">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Claims Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                {loading ? "..." : totalCount} claims processed
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/claims-management/new")}
              className="lg:hidden w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:from-orange-700 hover:to-orange-800 active:scale-95 transition-all"
              aria-label="Create new claim"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/claims-management/new")}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Claim</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
            <StatsCard
              title="Total Claims"
              value={stats?.total || 0}
              icon={FileText}
              color="blue"
              loading={loading}
            />
            <StatsCard
              title="Pending Review"
              value={stats?.pending || 0}
              icon={Clock}
              subtitle="Awaiting action"
              color="orange"
              loading={loading}
            />
            <StatsCard
              title="Approved Claims"
              value={stats?.approved || 0}
              icon={CheckCircle2}
              subtitle={stats?.approvedAmount ? formatCurrency(stats.approvedAmount) : undefined}
              color="green"
              loading={loading}
            />
            <StatsCard
              title="High Priority"
              value={stats?.highPriority || 0}
              icon={AlertTriangle}
              subtitle="Requires attention"
              color="red"
              loading={loading}
            />
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-4">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="lg:flex-1 lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims by number, client, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Filters and Toggle */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 lg:flex-none px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              >
                <option value="date">Newest First</option>
                <option value="amount">Highest Amount</option>
                <option value="priority">Priority Level</option>
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
                      ? "bg-white dark:bg-gray-600 shadow-sm text-orange-600"
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
                      ? "bg-white dark:bg-gray-600 shadow-sm text-orange-600"
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Claim Type
                </label>
                <select
                  value={filters.claimType}
                  onChange={(e) => handleFilterChange("claimType", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">All Types</option>
                  {CLAIM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">All Priorities</option>
                  {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
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

        {/* Claims Content */}
        {loading && !claims.length ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading claims...
            </p>
          </div>
        ) : sortedClaims.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No Claims Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isFiltering
                ? "Try adjusting your filters to see more results."
                : "Get started by creating your first insurance claim."}
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
              onClick={() => router.push("/dashboard/claims-management/new")}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-medium"
            >
              Create Claim
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Grid View */}
            <div className="lg:hidden space-y-3">
              {sortedClaims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {sortedClaims.map((claim) => (
                    <ClaimCard key={claim.id} claim={claim} />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Claim
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Client
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Amount
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Status
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Priority
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Incident Date
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedClaims.map((claim) => {
                          const statusConfig = STATUS_CONFIG[claim.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                          const priorityConfig = PRIORITY_CONFIG[claim.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                          const StatusIcon = statusConfig.icon;
                          const PriorityIcon = priorityConfig.icon;

                          return (
                            <tr
                              key={claim.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {claim.claim_number || `CLAIM-${claim.id.slice(0, 8)}`}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                      {claim.claim_type?.toLowerCase()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {claim.client?.full_name || "Unknown"}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {claim.claim_amount ? formatCurrency(claim.claim_amount) : "N/A"}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}
                                >
                                  <PriorityIcon className="w-3 h-3 mr-1" />
                                  {priorityConfig.label}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {new Date(claim.incident_date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/dashboard/claims-management/${claim.id}`}
                                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
                                    title="View claim"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    href={`/dashboard/claims-management/${claim.id}/edit`}
                                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    title="Edit claim"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(claim.id, claim.claim_number || `CLAIM-${claim.id.slice(0, 8)}`)}
                                    disabled={deleting === claim.id}
                                    className="p-2 rounded-lg bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                    title="Delete claim"
                                  >
                                    {deleting === claim.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
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
              {Math.min(currentPage * 10, totalCount)} of {totalCount} claims
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchClaims(Math.max(1, currentPage - 1))}
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
                      onClick={() => fetchClaims(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-all ${
                        pageNum === currentPage
                          ? "bg-orange-600 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => fetchClaims(Math.min(totalPages, currentPage + 1))}
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

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => router.push("/dashboard/claims-management/new")}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 text-white flex items-center justify-center shadow-2xl hover:from-orange-700 hover:to-orange-800 active:scale-95 transition-all"
          aria-label="Create new claim"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default function ClaimsManagementPage() {
  return (
    <Suspense fallback={<ClaimsManagementLoading />}>
      <ClaimsManagementContent />
    </Suspense>
  );
}