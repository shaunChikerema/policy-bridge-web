"use client";

import { useClients } from "@/hooks/useClients";
import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PolicyFormData {
  client_id: string;
  policy_name: string;
  policy_type: string;
  description: string;
  coverage_amount: string;
  premium_amount: string;
  deductible: string;
  effective_date: string;
  expiration_date: string;
  renewal_date: string;
  status: string;
  priority: string;
  terms_conditions: string;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>;
  riders: Array<{
    name: string;
    description: string;
    premium: number;
  }>;
  notes: string;
  tags: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface EditPolicyPageProps {
  policyId: string;
}

const POLICY_TYPES = [
  { value: "life", label: "Life Insurance" },
  { value: "motor", label: "Motor Insurance" },
  { value: "home", label: "Home Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "travel", label: "Travel Insurance" },
  { value: "business", label: "Business Insurance" },
];

const POLICY_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Other Relative",
  "Friend",
  "Business Partner",
  "Other",
];

export default function EditPolicyPage({ policyId }: EditPolicyPageProps) {
  const router = useRouter();
  const {
    currentPolicy,
    fetchPolicy,
    updatePolicy,
    loading,
    error: policyError,
    updating,
    clearCurrentPolicy,
  } = usePolicies();
  const { clients, fetchClients, loading: clientsLoading } = useClients();

  const [formData, setFormData] = useState<PolicyFormData>({
    client_id: "",
    policy_name: "",
    policy_type: "",
    description: "",
    coverage_amount: "",
    premium_amount: "",
    deductible: "0",
    effective_date: "",
    expiration_date: "",
    renewal_date: "",
    status: "pending",
    priority: "medium",
    terms_conditions: "",
    beneficiaries: [],
    riders: [],
    notes: "",
    tags: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newTag, setNewTag] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isDarkMode = false; // This would come from your theme context

  // Load clients and policy on component mount
  useEffect(() => {
    fetchClients();
    if (policyId) {
      fetchPolicy(policyId);
    }

    // Cleanup on unmount
    return () => {
      clearCurrentPolicy();
    };
  }, [policyId, fetchClients, fetchPolicy, clearCurrentPolicy]);

  // Initialize form data when policy is loaded
  useEffect(() => {
    if (currentPolicy && !isInitialized) {
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
      };

      setFormData({
        client_id: currentPolicy.client_id || "",
        policy_name: currentPolicy.policy_name || "",
        policy_type: currentPolicy.policy_type || "",
        description: currentPolicy.description || "",
        coverage_amount: currentPolicy.coverage_amount?.toString() || "",
        premium_amount: currentPolicy.premium_amount?.toString() || "",
        deductible: currentPolicy.deductible?.toString() || "0",
        effective_date: formatDateForInput(currentPolicy.effective_date),
        expiration_date: formatDateForInput(currentPolicy.expiration_date),
        renewal_date: formatDateForInput(currentPolicy.renewal_date),
        status: currentPolicy.status || "pending",
        priority: currentPolicy.priority || "medium",
        terms_conditions: currentPolicy.terms_conditions || "",
        beneficiaries: currentPolicy.beneficiaries || [],
        riders: currentPolicy.riders || [],
        notes: currentPolicy.notes || "",
        tags: currentPolicy.tags || [],
      });
      setIsInitialized(true);
    }
  }, [currentPolicy, isInitialized]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.client_id) newErrors.client_id = "Client is required";
    if (!formData.policy_name.trim())
      newErrors.policy_name = "Policy name is required";
    if (!formData.policy_type)
      newErrors.policy_type = "Policy type is required";
    if (!formData.coverage_amount)
      newErrors.coverage_amount = "Coverage amount is required";
    if (!formData.premium_amount)
      newErrors.premium_amount = "Premium amount is required";
    if (!formData.effective_date)
      newErrors.effective_date = "Effective date is required";
    if (!formData.expiration_date)
      newErrors.expiration_date = "Expiration date is required";

    // Numeric validations
    const coverageAmount = parseFloat(formData.coverage_amount);
    if (
      formData.coverage_amount &&
      (isNaN(coverageAmount) || coverageAmount <= 0)
    ) {
      newErrors.coverage_amount = "Coverage amount must be a positive number";
    }

    const premiumAmount = parseFloat(formData.premium_amount);
    if (
      formData.premium_amount &&
      (isNaN(premiumAmount) || premiumAmount <= 0)
    ) {
      newErrors.premium_amount = "Premium amount must be a positive number";
    }

    const deductible = parseFloat(formData.deductible);
    if (formData.deductible && (isNaN(deductible) || deductible < 0)) {
      newErrors.deductible = "Deductible must be a non-negative number";
    }

    // Date validations
    if (formData.effective_date && formData.expiration_date) {
      const effectiveDate = new Date(formData.effective_date);
      const expirationDate = new Date(formData.expiration_date);

      if (effectiveDate >= expirationDate) {
        newErrors.expiration_date =
          "Expiration date must be after effective date";
      }
    }

    // Beneficiaries validation
    if (formData.beneficiaries.length > 0) {
      const totalPercentage = formData.beneficiaries.reduce(
        (sum, b) => sum + b.percentage,
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        newErrors.beneficiaries = "Beneficiary percentages must total 100%";
      }

      formData.beneficiaries.forEach((beneficiary, index) => {
        if (!beneficiary.name.trim()) {
          newErrors[`beneficiary_${index}_name`] =
            "Beneficiary name is required";
        }
        if (!beneficiary.relationship) {
          newErrors[`beneficiary_${index}_relationship`] =
            "Relationship is required";
        }
        if (beneficiary.percentage <= 0 || beneficiary.percentage > 100) {
          newErrors[`beneficiary_${index}_percentage`] =
            "Percentage must be between 1 and 100";
        }
      });
    }

    // Riders validation
    formData.riders.forEach((rider, index) => {
      if (!rider.name.trim()) {
        newErrors[`rider_${index}_name`] = "Rider name is required";
      }
      if (rider.premium < 0) {
        newErrors[`rider_${index}_premium`] =
          "Rider premium must be non-negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addBeneficiary = () => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: [
        ...prev.beneficiaries,
        { name: "", relationship: "", percentage: 0 },
      ],
    }));
  };

  const updateBeneficiary = (
    index: number,
    field: keyof (typeof formData.beneficiaries)[0],
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      ),
    }));
  };

  const removeBeneficiary = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index),
    }));
  };

  const addRider = () => {
    setFormData((prev) => ({
      ...prev,
      riders: [...prev.riders, { name: "", description: "", premium: 0 }],
    }));
  };

  const updateRider = (
    index: number,
    field: keyof (typeof formData.riders)[0],
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      riders: prev.riders.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
  };

  const removeRider = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      riders: prev.riders.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentPolicy) {
      return;
    }

    const success = await updatePolicy(currentPolicy.id, formData);

    if (success) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        router.push(
          `/dashboard/policy-management/${currentPolicy.id}?success=Policy updated successfully`
        );
      }, 1500);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  // Loading state
  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading policy details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (policyError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Policy
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{policyError}</p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => fetchPolicy(policyId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Policy not found
  if (!currentPolicy) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Policy Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested policy could not be found.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="ml-2 text-sm font-medium text-green-800">
                Policy updated successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Edit Policy
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Update policy information for {currentPolicy.policy_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard/policy-management/${policyId}`}
            className={`px-4 py-2 border rounded-lg ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {policyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="ml-2 text-sm font-medium text-red-800">
              {policyError}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.client_id ? "border-red-500" : ""}`}
                disabled={clientsLoading}
              >
                <option value="">
                  {clientsLoading ? "Loading clients..." : "Select a client"}
                </option>
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

            {/* Policy Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Policy Name *
              </label>
              <input
                type="text"
                name="policy_name"
                value={formData.policy_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.policy_name ? "border-red-500" : ""}`}
                placeholder="Enter policy name"
              />
              {errors.policy_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.policy_name}
                </p>
              )}
            </div>

            {/* Policy Type */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Policy Type *
              </label>
              <select
                name="policy_type"
                value={formData.policy_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.policy_type ? "border-red-500" : ""}`}
              >
                <option value="">Select policy type</option>
                {POLICY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.policy_type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.policy_type}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {POLICY_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Enter policy description"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Financial Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coverage Amount */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Coverage Amount (BWP) *
              </label>
              <input
                type="number"
                name="coverage_amount"
                value={formData.coverage_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.coverage_amount ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
              {errors.coverage_amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.coverage_amount}
                </p>
              )}
            </div>

            {/* Premium Amount */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Premium Amount (BWP) *
              </label>
              <input
                type="number"
                name="premium_amount"
                value={formData.premium_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.premium_amount ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
              {errors.premium_amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.premium_amount}
                </p>
              )}
            </div>

            {/* Deductible */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Deductible (BWP)
              </label>
              <input
                type="number"
                name="deductible"
                value={formData.deductible}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.deductible ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
              {errors.deductible && (
                <p className="mt-1 text-sm text-red-600">{errors.deductible}</p>
              )}
            </div>
          </div>
        </div>

        {/* Policy Dates */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Policy Dates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Effective Date */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Effective Date *
              </label>
              <input
                type="date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.effective_date ? "border-red-500" : ""}`}
              />
              {errors.effective_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.effective_date}
                </p>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Expiration Date *
              </label>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.expiration_date ? "border-red-500" : ""}`}
              />
              {errors.expiration_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.expiration_date}
                </p>
              )}
            </div>

            {/* Renewal Date */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Renewal Date
              </label>
              <input
                type="date"
                name="renewal_date"
                value={formData.renewal_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Beneficiaries */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-orange-600" />
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Beneficiaries
              </h3>
            </div>
            <button
              type="button"
              onClick={addBeneficiary}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {formData.beneficiaries.length === 0 ? (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No beneficiaries added. Click "Add" to add beneficiaries.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.beneficiaries.map((beneficiary, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        value={beneficiary.name}
                        onChange={(e) =>
                          updateBeneficiary(index, "name", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } ${
                          errors[`beneficiary_${index}_name`]
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="Beneficiary name"
                      />
                      {errors[`beneficiary_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`beneficiary_${index}_name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Relationship
                      </label>
                      <select
                        value={beneficiary.relationship}
                        onChange={(e) =>
                          updateBeneficiary(
                            index,
                            "relationship",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } ${
                          errors[`beneficiary_${index}_relationship`]
                            ? "border-red-500"
                            : ""
                        }`}
                      >
                        <option value="">Select relationship</option>
                        {RELATIONSHIPS.map((relationship) => (
                          <option key={relationship} value={relationship}>
                            {relationship}
                          </option>
                        ))}
                      </select>
                      {errors[`beneficiary_${index}_relationship`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`beneficiary_${index}_relationship`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Percentage
                      </label>
                      <input
                        type="number"
                        value={beneficiary.percentage}
                        onChange={(e) =>
                          updateBeneficiary(
                            index,
                            "percentage",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        max="100"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } ${
                          errors[`beneficiary_${index}_percentage`]
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="0"
                      />
                      {errors[`beneficiary_${index}_percentage`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`beneficiary_${index}_percentage`]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeBeneficiary(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {errors.beneficiaries && (
                <p className="text-sm text-red-600">{errors.beneficiaries}</p>
              )}

              {/* Total Percentage Display */}
              {formData.beneficiaries.length > 0 && (
                <div className="flex justify-end">
                  <div
                    className={`text-sm ${
                      Math.abs(
                        formData.beneficiaries.reduce(
                          (sum, b) => sum + b.percentage,
                          0
                        ) - 100
                      ) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Total:{" "}
                    {formData.beneficiaries.reduce(
                      (sum, b) => sum + b.percentage,
                      0
                    )}
                    %
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Riders */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Policy Riders
              </h3>
            </div>
            <button
              type="button"
              onClick={addRider}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {formData.riders.length === 0 ? (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No riders added. Click "Add" to add policy riders.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.riders.map((rider, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Rider Name
                      </label>
                      <input
                        type="text"
                        value={rider.name}
                        onChange={(e) =>
                          updateRider(index, "name", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } ${
                          errors[`rider_${index}_name`] ? "border-red-500" : ""
                        }`}
                        placeholder="Rider name"
                      />
                      {errors[`rider_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`rider_${index}_name`]}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        value={rider.description}
                        onChange={(e) =>
                          updateRider(index, "description", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="Rider description"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Premium (BWP)
                      </label>
                      <input
                        type="number"
                        value={rider.premium}
                        onChange={(e) =>
                          updateRider(
                            index,
                            "premium",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } ${
                          errors[`rider_${index}_premium`]
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="0.00"
                      />
                      {errors[`rider_${index}_premium`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`rider_${index}_premium`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => removeRider(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total Rider Premium Display */}
              {formData.riders.length > 0 && (
                <div className="flex justify-end">
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Total Rider Premium:{" "}
                    {formatCurrency(
                      formData.riders.reduce((sum, r) => sum + r.premium, 0)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Terms & Additional Information */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Terms & Additional Information
            </h3>
          </div>

          <div className="space-y-6">
            {/* Terms & Conditions */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Terms & Conditions
              </label>
              <textarea
                name="terms_conditions"
                value={formData.terms_conditions}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Enter policy terms and conditions"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Additional notes or comments"
              />
            </div>

            {/* Tags */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href={`/dashboard/policy-management/${policyId}`}
            className={`px-6 py-2 border rounded-lg ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updating}
            className={`flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Policy</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
