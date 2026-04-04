// src/app/dashboard/payment-management/[id]/edit/page.tsx
"use client";

import { usePayments } from "@/hooks/usePayments";
import { useClients } from "@/hooks/useClients";
import { usePolicies } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Loader2,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PaymentFormData {
  client_id: string;
  policy_id?: string;
  claim_id?: string;
  payment_type: string;
  amount: string;
  currency: string;
  payment_method: string;
  payment_details: Record<string, any>;
  due_date?: string;
  payment_date?: string;
  transaction_id?: string;
  external_reference?: string;
  description?: string;
  notes?: string;
  tags: string[];
  status: string;
}

interface FormErrors {
  [key: string]: string;
}

const PAYMENT_TYPES = [
  { value: "premium", label: "Premium Payment" },
  { value: "claim_settlement", label: "Claim Settlement" },
  { value: "refund", label: "Refund" },
  { value: "adjustment", label: "Adjustment" },
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "eft", label: "EFT" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const CURRENCIES = [
  { value: "BWP", label: "BWP - Botswana Pula" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "ZAR", label: "ZAR - South African Rand" },
];

export default function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { currentPayment: payment, fetchPayment, updatePayment, loading, error } = usePayments();
  const { clients, fetchClients } = useClients();
  const { policies, fetchPolicies } = usePolicies();
  const { claims, fetchClaims } = useClaims();

  const [paymentId, setPaymentId] = useState<string>("");
  const [formData, setFormData] = useState<PaymentFormData>({
    client_id: "",
    policy_id: "",
    claim_id: "",
    payment_type: "premium",
    amount: "",
    currency: "BWP",
    payment_method: "bank_transfer",
    payment_details: {},
    due_date: "",
    payment_date: "",
    transaction_id: "",
    external_reference: "",
    description: "",
    notes: "",
    tags: [],
    status: "pending",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [updating, setUpdating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [filteredPolicies, setFilteredPolicies] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);

  // Resolve async params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPaymentId(resolvedParams.id);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };
    resolveParams();
  }, [params]);

  // Load payment and related data
  useEffect(() => {
    if (paymentId) {
      fetchPayment(paymentId);
      fetchClients();
      fetchPolicies();
      fetchClaims();
    }
  }, [paymentId, fetchPayment, fetchClients, fetchPolicies, fetchClaims]);

  // Initialize form when payment loads
  useEffect(() => {
    if (payment) {
      console.log("Initializing form with payment:", payment);
      setFormData({
        client_id: payment.client_id,
        policy_id: payment.policy_id || "",
        claim_id: payment.claim_id || "",
        payment_type: payment.payment_type,
        amount: payment.amount.toString(),
        currency: payment.currency,
        payment_method: payment.payment_method,
        payment_details: payment.payment_details || {},
        due_date: payment.due_date || "",
        payment_date: payment.payment_date || "",
        transaction_id: payment.transaction_id || "",
        external_reference: payment.external_reference || "",
        description: payment.description || "",
        notes: payment.notes || "",
        tags: payment.tags || [],
        status: payment.status,
      });
    }
  }, [payment]);

  // Filter policies and claims based on selected client
  useEffect(() => {
    if (formData.client_id) {
      setFilteredPolicies(
        policies.filter((policy) => policy.client_id === formData.client_id)
      );
      setFilteredClaims(
        claims.filter((claim) => claim.client_id === formData.client_id)
      );
    } else {
      setFilteredPolicies([]);
      setFilteredClaims([]);
    }
  }, [formData.client_id, policies, claims]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.client_id) newErrors.client_id = "Client is required";
    if (!formData.payment_type) newErrors.payment_type = "Payment type is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.payment_method) newErrors.payment_method = "Payment method is required";
    if (!formData.status) newErrors.status = "Status is required";

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (formData.amount && (isNaN(amount) || amount <= 0)) {
      newErrors.amount = "Amount must be a positive number";
    }

    // Business logic validation
    if (formData.payment_type === "premium" && !formData.policy_id) {
      newErrors.policy_id = "Policy is required for premium payments";
    }

    if (formData.payment_type === "claim_settlement" && !formData.claim_id) {
      newErrors.claim_id = "Claim is required for claim settlement payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Clear policy/claim when client changes
      if (name === "client_id") {
        updated.policy_id = "";
        updated.claim_id = "";
      }

      // Clear policy when payment type is not premium
      if (name === "payment_type" && value !== "premium") {
        updated.policy_id = "";
      }

      // Clear claim when payment type is not claim_settlement
      if (name === "payment_type" && value !== "claim_settlement") {
        updated.claim_id = "";
      }

      return updated;
    });

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePaymentDetailsChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      payment_details: {
        ...prev.payment_details,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        policy_id: formData.policy_id || undefined,
        claim_id: formData.claim_id || undefined,
        due_date: formData.due_date || undefined,
        payment_date: formData.payment_date || undefined,
        transaction_id: formData.transaction_id || undefined,
        external_reference: formData.external_reference || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        tags: formData.tags,
      };

      const updatedPayment = await updatePayment(paymentId, submitData);

      if (updatedPayment) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          router.push(`/dashboard/payment-management/${paymentId}?success=Payment updated successfully`);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to update payment:", err);
    } finally {
      setUpdating(false);
    }
  };

  const renderPaymentDetailsFields = () => {
    switch (formData.payment_method) {
      case "bank_transfer":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.payment_details.bank_name || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("bank_name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                value={formData.payment_details.account_number || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("account_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter account number"
              />
            </div>
          </div>
        );

      case "credit_card":
      case "debit_card":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Card Last 4 Digits
              </label>
              <input
                type="text"
                value={formData.payment_details.card_last_four || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("card_last_four", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Card Type
              </label>
              <select
                value={formData.payment_details.card_type || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("card_type", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">Select card type</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
              </select>
            </div>
          </div>
        );

      case "mobile_money":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Mobile Money Provider
              </label>
              <select
                value={formData.payment_details.provider || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("provider", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">Select provider</option>
                <option value="orange_money">Orange Money</option>
                <option value="mascom_myZaka">Mascom myZaka</option>
                <option value="btc_smega">BTC Smega</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.payment_details.mobile_number || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("mobile_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter mobile number"
              />
            </div>
          </div>
        );

      case "cheque":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Cheque Number
              </label>
              <input
                type="text"
                value={formData.payment_details.cheque_number || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("cheque_number", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter cheque number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Cheque Date
              </label>
              <input
                type="date"
                value={formData.payment_details.cheque_date || ""}
                onChange={(e) =>
                  handlePaymentDetailsChange("cheque_date", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading payment...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the payment information</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !payment) {
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
                  <Link
                    href="/dashboard/payment-management"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="ml-2 text-sm font-medium text-green-800">
                Payment updated successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Payment
          </h1>
          <p className="text-sm text-gray-600">
            Update payment details for {payment.payment_reference}
          </p>
        </div>
        <Link
          href={`/dashboard/payment-management/${paymentId}`}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="ml-2 text-sm font-medium text-red-800">
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="p-6 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.client_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name} - {client.email}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
              )}
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Payment Type *
              </label>
              <select
                name="payment_type"
                value={formData.payment_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.payment_type ? "border-red-500" : "border-gray-300"
                }`}
              >
                {PAYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.payment_type && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_type}</p>
              )}
            </div>

            {/* Policy Selection - only show for premium payments */}
            {formData.payment_type === "premium" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Policy {formData.payment_type === "premium" ? "*" : ""}
                </label>
                <select
                  name="policy_id"
                  value={formData.policy_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                    errors.policy_id ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={!formData.client_id}
                >
                  <option value="">
                    {!formData.client_id
                      ? "Select client first"
                      : filteredPolicies.length === 0
                      ? "No policies available"
                      : "Select a policy"}
                  </option>
                  {filteredPolicies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.policy_number} - {policy.policy_name}
                    </option>
                  ))}
                </select>
                {errors.policy_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.policy_id}</p>
                )}
              </div>
            )}

            {/* Claim Selection - only show for claim settlement payments */}
            {formData.payment_type === "claim_settlement" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Claim {formData.payment_type === "claim_settlement" ? "*" : ""}
                </label>
                <select
                  name="claim_id"
                  value={formData.claim_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                    errors.claim_id ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={!formData.client_id}
                >
                  <option value="">
                    {!formData.client_id
                      ? "Select client first"
                      : filteredClaims.length === 0
                      ? "No claims available"
                      : "Select a claim"}
                  </option>
                  {filteredClaims.map((claim) => (
                    <option key={claim.id} value={claim.id}>
                      {claim.claim_number} - {claim.claim_type}
                    </option>
                  ))}
                </select>
                {errors.claim_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.claim_id}</p>
                )}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter payment description"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Payment Method *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                  errors.payment_method ? "border-red-500" : "border-gray-300"
                }`}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.payment_method && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
              )}
            </div>
          </div>

          {/* Payment Method Specific Fields */}
          {renderPaymentDetailsFields()}
        </div>

        {/* Transaction Information */}
        <div className="p-6 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Transaction ID
              </label>
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter transaction ID"
              />
            </div>

            {/* External Reference */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                External Reference
              </label>
              <input
                type="text"
                name="external_reference"
                value={formData.external_reference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter external reference"
              />
            </div>
          </div>
        </div>

        {/* Payment Dates */}
        <div className="p-6 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Dates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Payment Date
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="p-6 rounded-xl border bg-white border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Information
            </h3>
          </div>

          <div className="space-y-6">
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Internal Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Internal notes (not visible to client)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href={`/dashboard/payment-management/${paymentId}`}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updating}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}