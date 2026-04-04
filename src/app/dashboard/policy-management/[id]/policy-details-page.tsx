// src/app/dashboard/policy-management/[id]/policy-details-page.tsx
"use client";

import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Printer,
  Shield,
  Tag,
  Trash2,
  User,
  Zap,
  TrendingUp,
  Target,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PolicyDetailsPageProps {
  policyId: string;
}

export default function PolicyDetailsPage({
  policyId,
}: PolicyDetailsPageProps) {
  const router = useRouter();
  const {
    currentPolicy,
    fetchPolicy,
    deletePolicy,
    loading,
    error,
    clearCurrentPolicy,
    deleting,
  } = usePolicies();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (policyId) {
      fetchPolicy(policyId);
    }

    return () => {
      clearCurrentPolicy();
    };
  }, [policyId, fetchPolicy, clearCurrentPolicy]);

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
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
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
        bgColor:
          "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
        icon: AlertCircle,
        days: Math.abs(daysUntilExpiry),
        urgency: "high",
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: "Expiring Soon",
        color: "text-red-600 dark:text-red-400",
        bgColor:
          "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
        icon: Zap,
        days: daysUntilExpiry,
        urgency: "high",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "Due Soon",
        color: "text-orange-600 dark:text-orange-400",
        bgColor:
          "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20",
        icon: Clock,
        days: daysUntilExpiry,
        urgency: "medium",
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        status: "Renewal Due",
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        icon: Calendar,
        days: daysUntilExpiry,
        urgency: "low",
      };
    } else {
      return {
        status: "Active",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor:
          "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
        icon: CheckCircle,
        days: daysUntilExpiry,
        urgency: "none",
      };
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleDelete = async () => {
    if (currentPolicy) {
      const success = await deletePolicy(currentPolicy.id);
      if (success) {
        router.push(
          "/dashboard/policy-management?success=Policy deleted successfully"
        );
      }
    }
  };

  const printPolicy = () => {
    window.print();
  };

  const downloadPolicy = () => {
    // Implement policy PDF generation/download
    console.log("Download policy PDF");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading Policy
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching policy details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Policy
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => fetchPolicy(policyId)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Policy not found state
  if (!currentPolicy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Policy Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested policy could not be found.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const policy = currentPolicy;
  const expirationStatus = getExpirationStatus(policy.expiration_date);
  const ExpirationIcon = expirationStatus.icon;

  // Calculate totals
  const totalRiderPremium =
    policy.riders?.reduce((sum, r) => sum + (r.premium || 0), 0) || 0;
  const totalAnnualCost = (policy.premium_amount || 0) + totalRiderPremium;
  const beneficiaryTotal =
    policy.beneficiaries?.reduce((sum, b) => sum + (b.percentage || 0), 0) || 0;
  const daysActive = Math.ceil(
    (new Date().getTime() - new Date(policy.effective_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Stats Cards Component
  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  // Beneficiary Card Component
  const BeneficiaryCard = ({ beneficiary, index, coverageAmount }: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {beneficiary.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {beneficiary.relationship}
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {beneficiary.percentage}%
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Allocation Value
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency((coverageAmount * beneficiary.percentage) / 100)}
          </span>
        </div>
      </div>
    );
  };

  // Rider Card Component
  const RiderCard = ({ rider, index }: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {rider.name}
              </h4>
              {rider.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  {rider.description}
                </p>
              )}
            </div>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(rider.premium || 0)}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Annual premium
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Policy
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <strong>"{policy.policy_name}"</strong>? All policy data will be
              permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={deleting === policy.id}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting === policy.id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
              >
                {deleting === policy.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete Policy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {policy.policy_name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    #{policy.policy_number}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(policy.policy_number, "policyNumber")
                    }
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Copy policy number"
                  >
                    <Copy
                      className={`w-3 h-3 ${
                        copiedField === "policyNumber"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/dashboard/policy-management/${policy.id}/edit`}
                className="hidden lg:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Policy</span>
              </Link>
              <button className="lg:hidden p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                policy.status
              )}`}
            >
              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPolicyTypeColor(
                policy.policy_type
              )}`}
            >
              {policy.policy_type.replace("_", " ")}
            </span>
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${expirationStatus.bgColor} border`}
            >
              <ExpirationIcon className={`w-4 h-4 ${expirationStatus.color}`} />
              <span className={expirationStatus.color}>
                {expirationStatus.status}
              </span>
              <span className={`text-xs ${expirationStatus.color} opacity-80`}>
                ({expirationStatus.days} days)
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          <StatCard
            title="Coverage Amount"
            value={formatCurrency(policy.coverage_amount || 0)}
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Annual Premium"
            value={formatCurrency(policy.premium_amount || 0)}
            icon={TrendingUp}
            color="green"
            subtitle={
              totalRiderPremium > 0
                ? `+${formatCurrency(totalRiderPremium)} riders`
                : undefined
            }
          />
          <StatCard
            title="Days Active"
            value={daysActive}
            icon={Calendar}
            color="purple"
            subtitle={`Since ${formatDate(policy.effective_date)}`}
          />
          <StatCard
            title="Beneficiaries"
            value={policy.beneficiaries?.length || 0}
            icon={User}
            color="orange"
            subtitle={`${beneficiaryTotal}% allocated`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Financial Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Base Coverage
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(policy.coverage_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Deductible
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(policy.deductible || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Premium Breakdown
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Base Premium
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(policy.premium_amount || 0)}
                        </span>
                      </div>
                      {totalRiderPremium > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Rider Premiums
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            +{formatCurrency(totalRiderPremium)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span className="text-gray-900 dark:text-white">
                          Total Annual
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(totalAnnualCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {policy.description && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Description
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {policy.description}
                  </p>
                </div>
              )}
            </div>

            {/* Policy Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Policy Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Effective Date
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(policy.effective_date)}
                  </p>
                </div>

                <div className="text-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expiration Date
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(policy.expiration_date)}
                  </p>
                </div>

                {policy.renewal_date && (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                    <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Renewal Date
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(policy.renewal_date)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Beneficiaries Section */}
            {policy.beneficiaries && policy.beneficiaries.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Beneficiaries
                  </h2>
                  <div
                    className={`text-sm font-medium ${
                      beneficiaryTotal === 100
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    Total Allocation: {beneficiaryTotal}%
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policy.beneficiaries.map((beneficiary, index) => (
                    <BeneficiaryCard
                      key={index}
                      beneficiary={beneficiary}
                      index={index}
                      coverageAmount={policy.coverage_amount || 0}
                    />
                  ))}
                </div>

                {beneficiaryTotal !== 100 && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      ⚠️ Beneficiary allocations total {beneficiaryTotal}%.
                      Should be 100%.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Riders Section */}
            {policy.riders && policy.riders.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Policy Riders
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {formatCurrency(totalRiderPremium)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policy.riders.map((rider, index) => (
                    <RiderCard key={index} rider={rider} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Additional Information
              </h2>

              <div className="space-y-6">
                {policy.terms_conditions && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Terms & Conditions
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {policy.terms_conditions}
                    </p>
                  </div>
                )}

                {policy.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {policy.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            {policy.client && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Client Information
                </h3>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {policy.client.first_name?.[0]}
                      {policy.client.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {policy.client.full_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Policy Holder
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {policy.client.email}
                    </span>
                  </div>

                  {policy.client.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {policy.client.phone}
                      </span>
                    </div>
                  )}

                  {policy.client.city && (
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {policy.client.city}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/dashboard/client-management/${policy.client.id}`}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
                >
                  <span>View Client Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>

              <div className="space-y-2">
                <Link
                  href={`/dashboard/policy-management/${policy.id}/edit`}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Edit Policy
                  </span>
                </Link>

                <button
                  onClick={printPolicy}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                >
                  <Printer className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Print Policy
                  </span>
                </button>

                <button
                  onClick={downloadPolicy}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Download PDF
                  </span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-600">
                    Delete Policy
                  </span>
                </button>
              </div>
            </div>

            {/* Policy Tags */}
            {policy.tags && policy.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Policy Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {policy.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Policy Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Policy ID
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono text-gray-900 dark:text-white">
                      {policy.id.slice(0, 8)}...
                    </span>
                    <button
                      onClick={() => copyToClipboard(policy.id, "policyId")}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy
                        className={`w-3 h-3 ${
                          copiedField === "policyId"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(policy.created_at)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Updated
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(policy.updated_at)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Policy Type
                  </span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {policy.policy_type.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <Link
          href={`/dashboard/policy-management/${policy.id}/edit`}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-2xl hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all"
          aria-label="Edit policy"
        >
          <Edit className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
