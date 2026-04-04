// src/app/dashboard/claims-management/[id]/page.tsx
"use client";

import { useClaims } from "@/hooks/useClaims";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit,
  FileText,
  MapPin,
  Phone,
  Printer,
  Shield,
  Trash2,
  User,
  X,
  Zap,
  TrendingUp,
  Target,
  Crown,
  Loader2, // Added missing import
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
    icon: Clock,
  },
  investigating: {
    label: "Investigating",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    icon: CheckCircle2,
  },
  denied: {
    label: "Denied",
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    icon: X,
  },
  settled: {
    label: "Settled",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    icon: CheckCircle2,
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    icon: TrendingUp,
  },
  medium: {
    label: "Medium",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
    icon: Target,
  },
  high: {
    label: "High",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400",
    icon: Zap,
  },
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    icon: Crown,
  },
};

function ClaimDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const claimId = params?.id as string;

  const {
    currentClaim,
    fetchClaim,
    deleteClaim,
    loading,
    error,
    deleting,
    clearError,
  } = useClaims();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (claimId) {
      fetchClaim(claimId);
      clearError(); // Clear any previous errors
    }
  }, [claimId, fetchClaim, clearError]);

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-BW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
  };

  const handleDelete = async () => {
    if (!claimId) return;

    const success = await deleteClaim(claimId);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/claims-management");
      }, 2000);
    }
    setShowDeleteModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading Claim
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching claim details...
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
            Error Loading Claim
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => claimId && fetchClaim(claimId)}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
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

  // Not found state
  if (!currentClaim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Claim Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested claim could not be found.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/claims-management")}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
            >
              View All Claims
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

  const claim = currentClaim;
  const statusConfig =
    STATUS_CONFIG[claim.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.pending;
  const priorityConfig =
    PRIORITY_CONFIG[claim.priority as keyof typeof PRIORITY_CONFIG] ||
    PRIORITY_CONFIG.medium;
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  const daysOpen = calculateDaysSince(claim.created_at);
  const isUrgent =
    claim.priority === "critical" ||
    (claim.priority === "high" && daysOpen > 7);

  // Stats Card Component
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
                  Delete Claim
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete claim{" "}
              <strong>
                "{claim.claim_number || `CLAIM-${claim.id.slice(0, 8)}`}"
              </strong>
              ? All claim data will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={deleting === claim.id}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting === claim.id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
              >
                {deleting === claim.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete Claim"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Claim Deleted!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to claims list...
            </p>
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
                  {claim.claim_number || `CLAIM-${claim.id.slice(0, 8)}`}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {claim.claim_type?.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/dashboard/claims-management/${claim.id}/edit`}
                className="hidden lg:flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Claim</span>
              </Link>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusConfig.label}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}
            >
              <PriorityIcon className="w-4 h-4 mr-1" />
              {priorityConfig.label} Priority
            </span>
            {isUrgent && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400">
                <Zap className="w-4 h-4 mr-1" />
                Urgent
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
          <StatCard
            title="Claim Amount"
            value={formatCurrency(claim.claim_amount || 0)}
            icon={DollarSign}
            color="blue"
          />
          <StatCard
            title="Days Open"
            value={daysOpen}
            icon={Clock}
            color="purple"
            subtitle={`Since ${formatDate(claim.created_at)}`}
          />
          <StatCard
            title="Approved Amount"
            value={formatCurrency(claim.approved_amount || 0)}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Settled Amount"
            value={formatCurrency(claim.settled_amount || 0)}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Claim Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Claim Type
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {claim.claim_type?.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Incident Date
                    </label>
                    <p className="text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(claim.incident_date)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Reported Date
                    </label>
                    <p className="text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(claim.reported_date)}
                    </p>
                  </div>
                  {claim.incident_location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Incident Location
                      </label>
                      <p className="text-gray-900 dark:text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {claim.incident_location}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {claim.description && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Description
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {claim.description}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Claim Amount
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(claim.claim_amount || 0)}
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Approved Amount
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(claim.approved_amount || 0)}
                  </p>
                </div>

                <div className="text-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Settled Amount
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(claim.settled_amount || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Management Information */}
            {(claim.assigned_adjuster || claim.assigned_investigator) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Management Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {claim.assigned_adjuster && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Assigned Adjuster
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {claim.assigned_adjuster}
                      </p>
                    </div>
                  )}
                  {claim.assigned_investigator && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Assigned Investigator
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {claim.assigned_investigator}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {(claim.notes || claim.internal_notes) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Notes
                </h2>

                <div className="space-y-4">
                  {claim.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Public Notes
                      </label>
                      <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        {claim.notes}
                      </div>
                    </div>
                  )}
                  {claim.internal_notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Internal Notes
                      </label>
                      <div className="text-gray-700 dark:text-gray-300 bg-orange-50 dark:bg-orange-500/10 p-4 rounded-lg border border-orange-200 dark:border-orange-500/20">
                        {claim.internal_notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            {claim.client && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Client Information
                </h3>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {claim.client.first_name?.[0]}
                      {claim.client.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {claim.client.full_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Claimant
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {claim.client.email}
                    </span>
                  </div>

                  {claim.client.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {claim.client.phone}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/dashboard/client-management/${claim.client.id}`}
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium mt-4"
                >
                  <span>View Client Profile</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            )}

            {/* Policy Information */}
            {claim.policy && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Policy Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Policy Number
                    </label>
                    <p className="font-mono text-gray-900 dark:text-white">
                      {claim.policy.policy_number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Policy Name
                    </label>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {claim.policy.policy_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Coverage Amount
                    </label>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(claim.policy.coverage_amount)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/policy-management/${claim.policy.id}`}
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium mt-4"
                >
                  <span>View Policy Details</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
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
                  href={`/dashboard/claims-management/${claim.id}/edit`}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Edit Claim
                  </span>
                </Link>

                <button className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full">
                  <Printer className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Print Claim
                  </span>
                </button>

                <button className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full">
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
                  <span className="font-medium text-red-600">Delete Claim</span>
                </button>
              </div>
            </div>

            {/* Claim Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Timeline
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(claim.created_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Updated
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(claim.updated_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Days Open
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {daysOpen} days
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
          href={`/dashboard/claims-management/${claim.id}/edit`}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 text-white flex items-center justify-center shadow-2xl hover:from-orange-700 hover:to-orange-800 active:scale-95 transition-all"
          aria-label="Edit claim"
        >
          <Edit className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}

export default function ClaimDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      }
    >
      <ClaimDetailsContent />
    </Suspense>
  );
}
