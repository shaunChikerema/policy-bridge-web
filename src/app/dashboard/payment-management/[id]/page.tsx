// src/app/dashboard/payment-management/[id]/page.tsx - UPDATED WITH EDIT LINK
"use client";

import { useClaims } from "@/hooks/useClaims";
import { useClients } from "@/hooks/useClients";
import { usePayments, type Payment } from "@/hooks/usePayments";
import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  User,
  X,
  XCircle,
  Shield,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PAYMENT_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "yellow",
    icon: Clock,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
  },
  {
    value: "processing",
    label: "Processing",
    color: "blue",
    icon: RefreshCw,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
  },
  {
    value: "completed",
    label: "Completed",
    color: "green",
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200",
  },
  {
    value: "failed",
    label: "Failed",
    color: "red",
    icon: XCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "gray",
    icon: X,
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    borderColor: "border-gray-200",
  },
];

const PAYMENT_TYPES = [
  { value: "premium", label: "Premium Payment", icon: Shield, color: "blue" },
  {
    value: "claim_settlement",
    label: "Claim Settlement",
    icon: FileText,
    color: "green",
  },
  { value: "refund", label: "Refund", icon: TrendingDown, color: "orange" },
  { value: "adjustment", label: "Adjustment", icon: Edit, color: "purple" },
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

export default function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const {
    currentPayment: payment,
    fetchPayment,
    updatePayment,
    deletePayment,
    generatePayslip,
    loading,
    error,
  } = usePayments();
  const { clients, fetchClients } = useClients();
  const { policies, fetchPolicies } = usePolicies();
  const { claims, fetchClaims } = useClaims();

  const [paymentId, setPaymentId] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingPayslip, setGeneratingPayslip] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "documents">("overview");

  // Resolve async params for Next.js 15
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPaymentId(resolvedParams.id);
        console.log("🆔 Payment ID from params:", resolvedParams.id);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };
    resolveParams();
  }, [params]);

  // Load payment and related data
  useEffect(() => {
    if (paymentId) {
      console.log("🚀 Fetching payment with ID:", paymentId);
      fetchPayment(paymentId);
      fetchClients();
      fetchPolicies();
      fetchClaims();
    }
  }, [paymentId, fetchPayment, fetchClients, fetchPolicies, fetchClaims]);

  // Debug effect to see what's happening
  useEffect(() => {
    console.log("🔍 Payment state:", {
      payment,
      loading,
      error,
      paymentId
    });
  }, [payment, loading, error, paymentId]);

  // Initialize edit form when payment loads
  useEffect(() => {
    if (payment) {
      console.log("✅ Payment loaded, setting form state:", payment);
      setEditingStatus(payment.status);
      setEditingNotes(payment.notes || "");
    }
  }, [payment]);

  // Check for success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get("success");
    if (successParam) {
      setSuccessMessage(successParam);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  const getClient = useCallback(() => {
    if (!payment) return null;

    console.log("👤 Payment client data:", payment.client);
    console.log("📋 Available clients:", clients.length);

    // If payment already has client data from API, use it
    if (payment.client) {
      const clientData = {
        ...payment.client,
        full_name:
          payment.client.full_name ||
          `${payment.client.first_name || ""} ${payment.client.last_name || ""}`.trim() ||
          "Unknown Client",
      };
      console.log("✅ Using payment.client:", clientData);
      return clientData;
    }

    // Fallback to clients list with better error handling
    if (payment.client_id && clients.length > 0) {
      const client = clients.find((c) => c.id === payment.client_id);
      if (client) {
        const clientData = {
          ...client,
          full_name: `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown Client",
        };
        console.log("🔍 Found client in clients list:", clientData);
        return clientData;
      }
    }

    console.log("❌ No client found for payment client_id:", payment.client_id);
    return {
      id: payment.client_id,
      first_name: "Unknown",
      last_name: "Client",
      full_name: "Unknown Client",
      email: "N/A",
    };
  }, [clients, payment]);

  const getPolicy = useCallback(() => {
    if (!payment) return null;

    // If payment already has policy data from API, use it
    if (payment.policy) {
      return payment.policy;
    }

    // Fallback to policies list
    return policies.find((p) => p.id === payment.policy_id);
  }, [policies, payment]);

  const getClaim = useCallback(() => {
    if (!payment) return null;

    // If payment already has claim data from API, use it
    if (payment.claim) {
      return payment.claim;
    }

    // Fallback to claims list
    return claims.find((c) => c.id === payment.claim_id);
  }, [claims, payment]);

  const getStatusConfig = useCallback((status: string) => {
    return PAYMENT_STATUSES.find((s) => s.value === status) || PAYMENT_STATUSES[0];
  }, []);

  const getPaymentTypeConfig = useCallback((type: string) => {
    return PAYMENT_TYPES.find((t) => t.value === type) || PAYMENT_TYPES[0];
  }, []);

  const getPaymentMethodIcon = useCallback((method: string) => {
    const methodConfig = PAYMENT_METHODS.find((m) => m.value === method);
    return methodConfig ? methodConfig.icon : DollarSign;
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: payment?.currency || "BWP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-BW", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-BW", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleStatusUpdate = async () => {
    if (!payment) return;

    setUpdating(true);
    try {
      await updatePayment(payment.id, {
        status: editingStatus,
        notes: editingNotes,
      });

      setShowEditModal(false);
      setSuccessMessage("Payment updated successfully");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);

      // Reload payment data
      fetchPayment(payment.id);
    } catch (err) {
      console.error("Failed to update payment:", err);
      setSuccessMessage("Failed to update payment");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!payment) return;

    setDeleting(true);
    try {
      await deletePayment(payment.id);
      setShowDeleteModal(false);
      router.push("/dashboard/payment-management?success=Payment deleted successfully");
    } catch (err) {
      console.error("Failed to delete payment:", err);
      setSuccessMessage("Failed to delete payment");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const handleGeneratePayslip = async () => {
    if (!payment) return;

    setGeneratingPayslip(true);
    try {
      const payslip = await generatePayslip(payment.id);
      if (payslip) {
        setSuccessMessage("Payslip generated successfully");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        // Open payslip in new tab
        window.open(`/dashboard/payment-management/payslips/${payslip.id}`, "_blank");
      }
    } catch (err) {
      console.error("Failed to generate payslip:", err);
      setSuccessMessage("Failed to generate payslip");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } finally {
      setGeneratingPayslip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!payment) return;

    const data = {
      payment_id: payment.id,
      client: getClient(),
      policy: getPolicy(),
      claim: getClaim(),
      payment_details: payment,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-${payment.payment_reference}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNavigateToEdit = () => {
    router.push(`/dashboard/payment-management/${paymentId}/edit`);
  };

  const renderPaymentDetails = () => {
    if (!payment || !payment.payment_details) return null;

    const details = payment.payment_details;

    switch (payment.payment_method) {
      case "bank_transfer":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.bank_name && (
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium text-gray-900">{details.bank_name}</p>
              </div>
            )}
            {details.account_number && (
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium text-gray-900">{details.account_number}</p>
              </div>
            )}
            {details.branch_code && (
              <div>
                <p className="text-sm text-gray-600">Branch Code</p>
                <p className="font-medium text-gray-900">{details.branch_code}</p>
              </div>
            )}
          </div>
        );

      case "credit_card":
      case "debit_card":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.card_last_four && (
              <div>
                <p className="text-sm text-gray-600">Card Last 4 Digits</p>
                <p className="font-medium text-gray-900">****{details.card_last_four}</p>
              </div>
            )}
            {details.card_type && (
              <div>
                <p className="text-sm text-gray-600">Card Type</p>
                <p className="font-medium text-gray-900 capitalize">{details.card_type}</p>
              </div>
            )}
            {details.expiry_date && (
              <div>
                <p className="text-sm text-gray-600">Expiry Date</p>
                <p className="font-medium text-gray-900">{details.expiry_date}</p>
              </div>
            )}
          </div>
        );

      case "mobile_money":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.provider && (
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium text-gray-900">{details.provider.replace("_", " ")}</p>
              </div>
            )}
            {details.mobile_number && (
              <div>
                <p className="text-sm text-gray-600">Mobile Number</p>
                <p className="font-medium text-gray-900">{details.mobile_number}</p>
              </div>
            )}
            {details.transaction_reference && (
              <div>
                <p className="text-sm text-gray-600">Transaction Reference</p>
                <p className="font-medium text-gray-900">{details.transaction_reference}</p>
              </div>
            )}
          </div>
        );

      case "cheque":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.cheque_number && (
              <div>
                <p className="text-sm text-gray-600">Cheque Number</p>
                <p className="font-medium text-gray-900">{details.cheque_number}</p>
              </div>
            )}
            {details.cheque_date && (
              <div>
                <p className="text-sm text-gray-600">Cheque Date</p>
                <p className="font-medium text-gray-900">{formatDate(details.cheque_date)}</p>
              </div>
            )}
            {details.bank_name && (
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium text-gray-900">{details.bank_name}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <p className="text-sm text-gray-600">No additional details available</p>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading payment details...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the payment information</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !payment) {
    console.log("❌ Error state - showing error page:", { error, payment, paymentId });
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-red-900 mb-2">Payment Not Found</h1>
                <p className="text-red-700 mb-4">
                  {error || "The payment you're looking for doesn't exist or has been removed."}
                </p>
                {paymentId && (
                  <p className="text-red-600 text-sm mb-4">
                    <strong>Payment ID:</strong> {paymentId}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => paymentId && fetchPayment(paymentId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  <Link
                    href="/dashboard/payment-management"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Payments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const client = getClient();
  const policy = getPolicy();
  const claim = getClaim();
  const statusConfig = getStatusConfig(payment.status);
  const paymentTypeConfig = getPaymentTypeConfig(payment.payment_type);
  const StatusIcon = statusConfig.icon;
  const PaymentTypeIcon = paymentTypeConfig.icon;

  console.log("🎉 Rendering payment details for:", payment.payment_reference);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="ml-2 text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-600 hover:text-green-800 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/payment-management"
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">Payment Details</h1>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    Reference: {payment.payment_reference}
                  </p>
                </div>
              </div>

              {/* Action buttons - Mobile optimized */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Printer className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleGeneratePayslip}
                  disabled={generatingPayslip}
                  className="flex-1 sm:flex-none p-3 border border-green-600 rounded-lg text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {generatingPayslip ? (
                    <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {generatingPayslip ? "Generating..." : "Payslip"}
                  </span>
                </button>
                
                {/* NEW: Full Edit Button */}
                <button
                  onClick={handleNavigateToEdit}
                  className="flex-1 sm:flex-none px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  <span>Edit Payment</span>
                </button>

                {/* Existing Quick Status Edit Button */}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 sm:flex-none px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>Quick Status</span>
                </button>
              </div>
            </div>

            {/* Tabs - Mobile friendly */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: "overview", label: "Overview", icon: FileText },
                  { id: "details", label: "Details", icon: CreditCard },
                  { id: "documents", label: "Documents", icon: Receipt },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Status Cards - Mobile First Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                      <span className={`text-lg font-semibold ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${statusConfig.bgColor}`}>
                    <StatusIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
                  </div>
                </div>
              </div>

              {/* Amount Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Type Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {paymentTypeConfig.label}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <PaymentTypeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Date Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Date</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {payment.payment_date ? formatDate(payment.payment_date) : "Pending"}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Client and Policy/Claim Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
                </div>

                {client ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{client.full_name}</p>
                      </div>
                      <Link
                        href={`/dashboard/client-management/${client.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 break-all">{client.email}</p>
                    </div>
                    {client.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{client.phone}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Client information not available</p>
                )}
              </div>

              {/* Associated Policy/Claim */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {payment.payment_type === "premium"
                      ? "Policy Information"
                      : payment.payment_type === "claim_settlement"
                      ? "Claim Information"
                      : "Related Information"}
                  </h3>
                </div>

                {payment.payment_type === "premium" && policy ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Policy Number</p>
                        <p className="font-medium text-gray-900">{policy.policy_number}</p>
                      </div>
                      <Link
                        href={`/dashboard/policy-management/${policy.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Policy Name</p>
                      <p className="font-medium text-gray-900">{policy.policy_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coverage Amount</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(policy.coverage_amount)}
                      </p>
                    </div>
                  </div>
                ) : payment.payment_type === "claim_settlement" && claim ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Claim Number</p>
                        <p className="font-medium text-gray-900">{claim.claim_number}</p>
                      </div>
                      <Link
                        href={`/dashboard/claims-management/${claim.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Claim Type</p>
                      <p className="font-medium text-gray-900">{claim.claim_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(claim.status).bgColor} ${getStatusConfig(claim.status).textColor}`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    No associated {payment.payment_type === "premium" ? "policy" : "claim"}
                  </p>
                )}
              </div>
            </div>

            {/* Description and Notes */}
            {(payment.description || payment.notes) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {payment.description && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{payment.description}</p>
                  </div>
                )}
                {payment.notes && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>
                    <p className="text-gray-700 leading-relaxed">{payment.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {payment.tags && payment.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {payment.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Payment Method Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {payment.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Currency</p>
                  <p className="font-medium text-gray-900">{payment.currency}</p>
                </div>
                {payment.transaction_id && (
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium text-gray-900 font-mono text-sm break-all">
                      {payment.transaction_id}
                    </p>
                  </div>
                )}
                {payment.external_reference && (
                  <div>
                    <p className="text-sm text-gray-600">External Reference</p>
                    <p className="font-medium text-gray-900 break-words">
                      {payment.external_reference}
                    </p>
                  </div>
                )}
                {payment.due_date && (
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium text-gray-900">{formatDate(payment.due_date)}</p>
                  </div>
                )}
                {payment.payment_date && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-medium text-gray-900">{formatDate(payment.payment_date)}</p>
                  </div>
                )}
              </div>

              {/* Method-specific details */}
              {payment.payment_details && Object.keys(payment.payment_details).length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium mb-4 text-gray-900">Payment Details</h4>
                  {renderPaymentDetails()}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Timestamps</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium text-gray-900">{formatDateTime(payment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">{formatDateTime(payment.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Document Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleGeneratePayslip}
                  disabled={generatingPayslip}
                  className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {generatingPayslip ? (
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Generate Payslip</p>
                      <p className="text-sm text-gray-600 mt-1">Create payment receipt</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Printer className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Print Details</p>
                      <p className="text-sm text-gray-600 mt-1">Print payment information</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExport}
                  className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Export Data</p>
                      <p className="text-sm text-gray-600 mt-1">Download as JSON</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Payment Reference</span>
                  <span className="font-medium text-gray-900">{payment.payment_reference}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Client</span>
                  <span className="font-medium text-gray-900">{client?.full_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${statusConfig.textColor}`}>{statusConfig.label}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="font-medium text-gray-900">
                    {payment.payment_date ? formatDate(payment.payment_date) : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
              <p className="text-sm text-red-700 mt-1">Irreversible and destructive actions</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Status Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-2xl bg-white mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Internal Notes</label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Add any notes about this status change..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-2xl bg-white mx-4">
            <div className="flex items-start space-x-4 p-6">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Payment</h3>
                <p className="text-sm text-gray-600 mb-4">This action cannot be undone</p>
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete payment <strong>{payment.payment_reference}</strong>? This will
                  permanently remove the payment record and all associated data.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}