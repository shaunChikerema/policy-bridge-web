"use client";

import { ArrowLeft, Calendar, DollarSign, Save, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface PolicyEditData {
  id: string;
  policyNumber: string;
  clientName: string;
  clientId: string;
  type: "auto" | "home" | "life" | "health" | "business";
  premium: string;
  coverage: string;
  deductible: string;
  paymentFrequency: "monthly" | "quarterly" | "annually";
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: "active" | "expired" | "cancelled" | "pending";
  terms: string;
}

const mockPolicy: PolicyEditData = {
  id: "1",
  policyNumber: "POL-2024-001",
  clientName: "Thabo Mokgadi",
  clientId: "CLI-001",
  type: "auto",
  premium: "1250",
  coverage: "350000",
  deductible: "5000",
  paymentFrequency: "monthly",
  startDate: "2024-01-15",
  endDate: "2025-01-15",
  renewalDate: "2025-01-15",
  status: "active",
  terms: "Standard auto insurance terms and conditions apply.",
};

interface PolicyEditPageProps {
  policyId?: string;
  isDarkMode?: boolean;
}

export default function PolicyEditPage({
  policyId,
  isDarkMode = false,
}: PolicyEditPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<PolicyEditData>(mockPolicy);

  useEffect(() => {
    // In a real app, fetch policy data by ID
    console.log("Loading policy:", policyId);
  }, [policyId]);

  const handleInputChange = (field: keyof PolicyEditData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.premium) newErrors.premium = "Premium is required";
    if (!formData.coverage) newErrors.coverage = "Coverage amount is required";
    if (!formData.deductible) newErrors.deductible = "Deductible is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    // Validate that end date is after start date
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Updating policy:", formData);

      // Redirect back to policy details
      router.push(`/dashboard/policy-management/${formData.id}`);
    } catch (error) {
      console.error("Error updating policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              isDarkMode ? "hover:bg-gray-800" : ""
            }`}
          >
            <ArrowLeft
              className={`w-5 h-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
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
              {formData.policyNumber}
            </p>
          </div>
        </div>
        {hasChanges && (
          <div
            className={`text-sm ${
              isDarkMode ? "text-yellow-400" : "text-yellow-600"
            }`}
          >
            You have unsaved changes
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Policy Information Card */}
        <div
          className={`p-6 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Policy Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Policy Number
              </label>
              <input
                type="text"
                value={formData.policyNumber}
                disabled
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-500"
                } cursor-not-allowed`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                disabled
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-500"
                } cursor-not-allowed`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Policy Type
              </label>
              <input
                type="text"
                value={`${
                  formData.type.charAt(0).toUpperCase() + formData.type.slice(1)
                } Insurance`}
                disabled
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-500"
                } cursor-not-allowed`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information Card */}
        <div
          className={`p-6 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Financial Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Premium *
              </label>
              <div className="relative">
                <DollarSign
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="number"
                  value={formData.premium}
                  onChange={(e) => handleInputChange("premium", e.target.value)}
                  placeholder="0"
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${errors.premium ? "border-red-500" : ""}`}
                />
              </div>
              {errors.premium && (
                <p className="mt-1 text-sm text-red-600">{errors.premium}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Coverage Amount *
              </label>
              <div className="relative">
                <DollarSign
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="number"
                  value={formData.coverage}
                  onChange={(e) =>
                    handleInputChange("coverage", e.target.value)
                  }
                  placeholder="0"
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${errors.coverage ? "border-red-500" : ""}`}
                />
              </div>
              {errors.coverage && (
                <p className="mt-1 text-sm text-red-600">{errors.coverage}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Deductible *
              </label>
              <div className="relative">
                <DollarSign
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="number"
                  value={formData.deductible}
                  onChange={(e) =>
                    handleInputChange("deductible", e.target.value)
                  }
                  placeholder="0"
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${errors.deductible ? "border-red-500" : ""}`}
                />
              </div>
              {errors.deductible && (
                <p className="mt-1 text-sm text-red-600">{errors.deductible}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Payment Frequency
              </label>
              <select
                value={formData.paymentFrequency}
                onChange={(e) =>
                  handleInputChange(
                    "paymentFrequency",
                    e.target.value as "monthly" | "quarterly" | "annually"
                  )
                }
                className={`w-full px-3 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Information Card */}
        <div
          className={`p-6 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Policy Dates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.startDate ? "border-red-500" : ""}`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.endDate ? "border-red-500" : ""}`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>

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
                value={formData.renewalDate}
                onChange={(e) =>
                  handleInputChange("renewalDate", e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions Card */}
        <div
          className={`p-6 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Terms & Conditions
          </h2>
          <textarea
            value={formData.terms}
            onChange={(e) => handleInputChange("terms", e.target.value)}
            rows={4}
            placeholder="Enter policy terms and conditions..."
            className={`w-full px-3 py-2 rounded-lg border transition-all resize-none ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800 text-white"
                : "border-gray-300 hover:bg-gray-50 text-gray-900"
            }`}
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
