// src/app/dashboard/payment-management/page.tsx
"use client";

import { usePayments } from "@/hooks/usePayments";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
  Download,
  Mail,
  Shield,
  Receipt,
  Users,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface PaymentFilters {
  search: string;
  status: string;
  payment_type: string;
  payment_method: string;
  date_range: string;
}

// Payment status configuration
const PAYMENT_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "yellow",
    icon: Clock,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  {
    value: "processing",
    label: "Processing",
    color: "blue",
    icon: RefreshCw,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    value: "completed",
    label: "Completed",
    color: "green",
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  {
    value: "failed",
    label: "Failed",
    color: "red",
    icon: XCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "gray",
    icon: X,
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  {
    value: "refunded",
    label: "Refunded",
    color: "purple",
    icon: TrendingDown,
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
];

const PAYMENT_TYPES = [
  { value: "premium", label: "Premium", color: "blue", icon: Shield },
  {
    value: "claim_settlement",
    label: "Claim Settlement",
    color: "green",
    icon: FileText,
  },
  { value: "refund", label: "Refund", color: "orange", icon: TrendingDown },
  { value: "adjustment", label: "Adjustment", color: "purple", icon: Edit },
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer", icon: TrendingUp },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "debit_card", label: "Debit Card", icon: CreditCard },
  { value: "mobile_money", label: "Mobile Money", icon: DollarSign },
  { value: "cash", label: "Cash", icon: DollarSign },
  { value: "cheque", label: "Cheque", icon: FileText },
  { value: "eft", label: "EFT", icon: TrendingUp },
];

// Separate component for search params handling
function PaymentManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");

  const {
    payments,
    fetchPayments,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    totalPages,
    generatePayslip,
  } = usePayments();

  const [filters, setFilters] = useState<PaymentFilters>({
    search: "",
    status: "",
    payment_type: "",
    payment_method: "",
    date_range: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [generatingPayslip, setGeneratingPayslip] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fetch payments on component mount and when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.set("search", filters.search);
    if (filters.status) queryParams.set("status", filters.status);
    if (filters.payment_type)
      queryParams.set("payment_type", filters.payment_type);
    if (filters.payment_method)
      queryParams.set("payment_method", filters.payment_method);
    if (filters.date_range) queryParams.set("date_range", filters.date_range);

    fetchPayments(currentPage, queryParams);
  }, [currentPage, filters, fetchPayments]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setShowSuccessAlert(true);
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
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
      payment_type: "",
      payment_method: "",
      date_range: "",
    });
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number, currency: string = "BWP") => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    return (
      PAYMENT_STATUSES.find((s) => s.value === status) || PAYMENT_STATUSES[0]
    );
  };

  const getPaymentTypeConfig = (type: string) => {
    return PAYMENT_TYPES.find((t) => t.value === type) || PAYMENT_TYPES[0];
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodConfig = PAYMENT_METHODS.find((m) => m.value === method);
    return methodConfig ? methodConfig.icon : DollarSign;
  };

  const handleGeneratePayslip = async (paymentId: string) => {
    setGeneratingPayslip(paymentId);
    try {
      const payslip = await generatePayslip(paymentId);
      if (payslip) {
        // Open payslip in new tab
        window.open(
          `/dashboard/payment-management/payslips/${payslip.id}`,
          "_blank"
        );
      }
    } catch (error) {
      console.error("Failed to generate payslip:", error);
    } finally {
      setGeneratingPayslip(null);
    }
  };

  // Calculate stats
  const stats = {
    total: totalCount,
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    processing: payments.filter((p) => p.status === "processing").length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Alert */}
      {showSuccessAlert && successMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="ml-2 text-sm font-medium text-green-800 flex-1">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessAlert(false)}
                className="ml-4 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Payment Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage payments, premiums, and claim settlements
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/payment-management/payslips/generate"
                className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Payslips</span>
              </Link>
              <Link
                href="/dashboard/payment-management/new"
                className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Payment</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-gray-600 font-medium">
                  Total Payments
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-gray-600 font-medium">
                  Completed
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-gray-600 font-medium">
                  Pending
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-gray-600 font-medium">
                  Processing
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {stats.processing}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6 col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-gray-600 font-medium">
                  Total Amount
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search payments by reference, client, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-4 h-4 flex flex-col space-y-0.5">
                      <div className="bg-current h-0.5 rounded"></div>
                      <div className="bg-current h-0.5 rounded"></div>
                      <div className="bg-current h-0.5 rounded"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="">All Statuses</option>
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Payment Type
                  </label>
                  <select
                    value={filters.payment_type}
                    onChange={(e) =>
                      handleFilterChange("payment_type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="">All Types</option>
                    {PAYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Payment Method
                  </label>
                  <select
                    value={filters.payment_method}
                    onChange={(e) =>
                      handleFilterChange("payment_method", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="">All Methods</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Date Range
                  </label>
                  <select
                    value={filters.date_range}
                    onChange={(e) =>
                      handleFilterChange("date_range", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payments Content */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 text-lg">Loading payments...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Please wait while we fetch your payment data
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Payments
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => fetchPayments(currentPage)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hasActiveFilters
                  ? "No Matching Payments"
                  : "No Payments Found"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {hasActiveFilters
                  ? "No payments match your current filters. Try adjusting your search criteria."
                  : "Get started by processing your first payment."}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/dashboard/payment-management/new"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Process First Payment
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Grid View (Always visible on mobile) */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {payments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const paymentTypeConfig = getPaymentTypeConfig(
                    payment.payment_type
                  );
                  const StatusIcon = statusConfig.icon;
                  const PaymentTypeIcon = paymentTypeConfig.icon;
                  const PaymentMethodIcon = getPaymentMethodIcon(
                    payment.payment_method
                  );

                  return (
                    <div
                      key={payment.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="flex items-center space-x-2 min-w-0">
                            <PaymentTypeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {payment.payment_reference}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleGeneratePayslip(payment.id)}
                            disabled={generatingPayslip === payment.id}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                            title="Generate Payslip"
                          >
                            {generatingPayslip === payment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/dashboard/payment-management/${payment.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            title="View Payment"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConfig.label}</span>
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${paymentTypeConfig.color}-100 text-${paymentTypeConfig.color}-800`}
                        >
                          {paymentTypeConfig.label}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Client:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">
                            {payment.client?.full_name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method:</span>
                          <div className="flex items-center space-x-1">
                            <PaymentMethodIcon className="w-3 h-3 text-gray-500" />
                            <span className="font-medium text-gray-900 capitalize">
                              {payment.payment_method.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium text-gray-900">
                            {payment.payment_date
                              ? formatDate(payment.payment_date)
                              : payment.due_date
                              ? `Due: ${formatDate(payment.due_date)}`
                              : formatDate(payment.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View (Grid or Table based on viewMode) */}
              <div className="hidden lg:block">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6">
                    {payments.map((payment) => {
                      const statusConfig = getStatusConfig(payment.status);
                      const paymentTypeConfig = getPaymentTypeConfig(
                        payment.payment_type
                      );
                      const StatusIcon = statusConfig.icon;
                      const PaymentTypeIcon = paymentTypeConfig.icon;
                      const PaymentMethodIcon = getPaymentMethodIcon(
                        payment.payment_method
                      );

                      return (
                        <div
                          key={payment.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <PaymentTypeIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {payment.payment_reference}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {payment.description || "No description"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() =>
                                  handleGeneratePayslip(payment.id)
                                }
                                disabled={generatingPayslip === payment.id}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                                title="Generate Payslip"
                              >
                                {generatingPayslip === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </button>
                              <Link
                                href={`/dashboard/payment-management/${payment.id}`}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                title="View Payment"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/dashboard/payment-management/${payment.id}/edit`}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                title="Edit Payment"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span
                              className={`inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              <span>{statusConfig.label}</span>
                            </span>
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full bg-${paymentTypeConfig.color}-100 text-${paymentTypeConfig.color}-800`}
                            >
                              {paymentTypeConfig.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Client</p>
                              <p className="font-medium text-gray-900 truncate">
                                {payment.client?.full_name || "Unknown Client"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Amount</p>
                              <p className="font-medium text-gray-900">
                                {formatCurrency(
                                  payment.amount,
                                  payment.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Method</p>
                              <div className="flex items-center space-x-2">
                                <PaymentMethodIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900 capitalize">
                                  {payment.payment_method.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Date</p>
                              <p className="font-medium text-gray-900">
                                {payment.payment_date
                                  ? formatDate(payment.payment_date)
                                  : payment.due_date
                                  ? `Due: ${formatDate(payment.due_date)}`
                                  : formatDate(payment.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Payment Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Client
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Method
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.map((payment) => {
                          const statusConfig = getStatusConfig(payment.status);
                          const paymentTypeConfig = getPaymentTypeConfig(
                            payment.payment_type
                          );
                          const StatusIcon = statusConfig.icon;
                          const PaymentTypeIcon = paymentTypeConfig.icon;
                          const PaymentMethodIcon = getPaymentMethodIcon(
                            payment.payment_method
                          );

                          return (
                            <tr
                              key={payment.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <PaymentTypeIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {payment.payment_reference}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {payment.description || "No description"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {payment.client?.full_name ||
                                      "Unknown Client"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {payment.client?.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(
                                    payment.amount,
                                    payment.currency
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <PaymentMethodIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-700 capitalize">
                                    {payment.payment_method.replace("_", " ")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
                                >
                                  <StatusIcon className="w-4 h-4" />
                                  <span>{statusConfig.label}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {payment.payment_date
                                    ? formatDate(payment.payment_date)
                                    : payment.due_date
                                    ? `Due: ${formatDate(payment.due_date)}`
                                    : formatDate(payment.created_at)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      handleGeneratePayslip(payment.id)
                                    }
                                    disabled={generatingPayslip === payment.id}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                                    title="Generate Payslip"
                                  >
                                    {generatingPayslip === payment.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <FileText className="w-4 h-4" />
                                    )}
                                  </button>
                                  <Link
                                    href={`/dashboard/payment-management/${payment.id}`}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="View Payment"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    href={`/dashboard/payment-management/${payment.id}/edit`}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="Edit Payment"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * 10 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * 10, totalCount)}
                  </span>{" "}
                  of <span className="font-semibold">{totalCount}</span>{" "}
                  payments
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-4 py-2">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/payment-management/new?type=premium"
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Process Premium Payment
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Collect premium payments from clients
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/payment-management/new?type=claim_settlement"
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Process Claim Settlement
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay out approved claim settlements
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/payment-management/payslips/generate"
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Bulk Payslip Generation
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate multiple payslips at once
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentManagementLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 text-lg">Loading payment management...</p>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we load your payment data
        </p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function PaymentManagementPage() {
  return (
    <Suspense fallback={<PaymentManagementLoading />}>
      <PaymentManagementContent />
    </Suspense>
  );
}
