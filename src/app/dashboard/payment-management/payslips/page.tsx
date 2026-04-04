//src\app\dashboard\payment-management\payslips\page.tsx
"use client";

import { usePayments } from "@/hooks/usePayments";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface PayslipFilters {
  search: string;
  status: string;
  payment_type: string;
  date_range: string;
}

function PayslipsManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");

  const {
    payslips,
    fetchPayslips,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    totalPages,
    deletePayslip,
  } = usePayments();

  const [filters, setFilters] = useState<PayslipFilters>({
    search: "",
    status: "",
    payment_type: "",
    date_range: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [deletingPayslip, setDeletingPayslip] = useState<string | null>(null);

  // Fetch payslips on component mount and when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.set("search", filters.search);
    if (filters.status) queryParams.set("status", filters.status);
    if (filters.payment_type)
      queryParams.set("payment_type", filters.payment_type);
    if (filters.date_range) queryParams.set("date_range", filters.date_range);

    fetchPayslips(currentPage, queryParams);
  }, [currentPage, filters, fetchPayslips]);

  // Handle success message
  useEffect(() => {
    if (successMessage) {
      setShowSuccessAlert(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());

      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleFilterChange = (key: keyof PayslipFilters, value: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "sent":
        return <Mail className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "failed":
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const handleDeletePayslip = async (payslipId: string) => {
    setDeletingPayslip(payslipId);
    try {
      await deletePayslip(payslipId);
      // Refresh the list
      fetchPayslips(currentPage);
    } catch (error) {
      console.error("Failed to delete payslip:", error);
    } finally {
      setDeletingPayslip(null);
    }
  };

  const handleDownloadPayslip = (payslipId: string) => {
    // Implement download functionality
    window.open(`/api/payments/payslips/${payslipId}/download`, "_blank");
  };

  const handleEmailPayslip = async (payslipId: string) => {
    // Implement email functionality
    try {
      const response = await fetch(
        `/api/payments/payslips/${payslipId}/email`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }
    } catch (error) {
      console.error("Failed to send payslip:", error);
    }
  };

  // Calculate stats
  const stats = {
    total: totalCount,
    generated: payslips.filter((p) => p.status === "generated").length,
    sent: payslips.filter((p) => p.status === "sent").length,
    totalAmount: payslips.reduce((sum, payslip) => {
      return payslip.payment?.currency === "BWP"
        ? sum + (payslip.payment?.amount || 0)
        : sum;
    }, 0),
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 left-4 right-4 sm:right-auto sm:left-auto sm:top-4 sm:right-4 z-50 sm:max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="ml-2 text-sm font-medium text-green-800 flex-1">
                {successMessage || "Operation completed successfully"}
              </p>
              <button
                onClick={() => setShowSuccessAlert(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Payslip Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage and distribute payment payslips to clients
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/dashboard/payment-management/payslips/generate"
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Generate Payslips</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Payslips</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Generated</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.generated}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Sent</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.sent}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border col-span-2 lg:col-span-1 bg-white border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">
                Total Amount (BWP)
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 sm:p-4 rounded-xl border bg-white border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search payslips..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="generated">Generated</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
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
                <option value="premium">Premium Payment</option>
                <option value="claim_settlement">Claim Settlement</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payslips Table/Cards */}
      <div className="rounded-xl border bg-white border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading payslips...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Payslips
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchPayslips(currentPage)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Payslips Found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some((f) => f)
                ? "No payslips match your current filters."
                : "Get started by generating your first payslip."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              {Object.values(filters).some((f) => f) ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              ) : null}
              <Link
                href="/dashboard/payment-management/payslips/generate"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block text-center"
              >
                Generate First Payslip
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden divide-y divide-gray-200">
              {payslips.map((payslip) => (
                <div key={payslip.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {payslip.payslip_number}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDownloadPayslip(payslip.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEmailPayslip(payslip.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/dashboard/payment-management/payslips/${payslip.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        payslip.status
                      )}`}
                    >
                      {getStatusIcon(payslip.status)}
                      <span>
                        {payslip.status.charAt(0).toUpperCase() +
                          payslip.status.slice(1)}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Client:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {payslip.payment?.client?.full_name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          payslip.payment?.amount || 0,
                          payslip.payment?.currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Generated:</span>
                      <span className="text-sm">
                        {formatDate(payslip.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Payslip Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payslips.map((payslip) => (
                    <tr key={payslip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {payslip.payslip_number}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm mt-1 text-gray-500">
                            {payslip.payment?.payment_type?.replace("_", " ") ||
                              "Payment"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payslip.payment?.client?.full_name ||
                              "Unknown Client"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payslip.payment?.client?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(
                              payslip.payment?.amount || 0,
                              payslip.payment?.currency
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              payslip.status
                            )}`}
                          >
                            {getStatusIcon(payslip.status)}
                            <span>
                              {payslip.status.charAt(0).toUpperCase() +
                                payslip.status.slice(1)}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(payslip.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownloadPayslip(payslip.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEmailPayslip(payslip.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/dashboard/payment-management/payslips/${payslip.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            title="View Payslip"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePayslip(payslip.id)}
                            disabled={deletingPayslip === payslip.id}
                            className="p-2 rounded-lg hover:bg-gray-100 text-red-600 transition-colors disabled:opacity-50"
                            title="Delete Payslip"
                          >
                            {deletingPayslip === payslip.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalCount)} of {totalCount}{" "}
                payslips
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 text-sm text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 text-sm text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 sm:p-6 rounded-xl border bg-white border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/dashboard/payment-management/payslips/generate"
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Generate Payslips</h4>
                <p className="text-sm text-gray-600">
                  Create new payslips from payments
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/payment-management"
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">View Payments</h4>
                <p className="text-sm text-gray-600">
                  Manage all payment records
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/payment-management/payslips/templates"
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Manage Templates</h4>
                <p className="text-sm text-gray-600">
                  Customize payslip templates
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PayslipsManagementLoading() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Loading payslip management...
        </span>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function PayslipsManagementPage() {
  return (
    <Suspense fallback={<PayslipsManagementLoading />}>
      <PayslipsManagementContent />
    </Suspense>
  );
}
