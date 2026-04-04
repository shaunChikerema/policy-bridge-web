// src/app/dashboard/client-management/[id]/page.tsx (FIXED)
"use client";

import { useClients } from "@/hooks/useClients";
import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  Loader2,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.id as string;
  const successMessage = searchParams.get("success");

  const {
    currentClient,
    fetchClient,
    deleteClient,
    loading,
    deleting,
    error,
    clearCurrentClient,
  } = useClients();

  // Use the policies hook to get real policies data
  const { policies, fetchPolicies, loading: policiesLoading } = usePolicies();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const isDarkMode = false;

  // Fetch client data when component mounts
  useEffect(() => {
    if (clientId) {
      fetchClient(clientId);
    }

    // Clear current client when component unmounts
    return () => {
      clearCurrentClient();
    };
  }, [clientId, fetchClient, clearCurrentClient]);

  // Fetch policies for this specific client
  useEffect(() => {
    if (clientId) {
      // Create search params to filter policies by this client
      const searchParams = new URLSearchParams();
      searchParams.set("client_id", clientId);

      // Fetch policies for this specific client
      fetchPolicies(1, searchParams);
    }
  }, [clientId, fetchPolicies]);

  // Calculate client-specific statistics from real policies data
  const calculateClientStats = () => {
    if (!policies || policies.length === 0) {
      return {
        totalPolicies: 0,
        totalPremium: 0,
        totalCoverage: 0,
        activePolicies: 0,
        expiredPolicies: 0,
        pendingPolicies: 0,
      };
    }

    const clientPolicies = policies.filter(
      (policy) => policy.client_id === clientId
    );

    return {
      totalPolicies: clientPolicies.length,
      totalPremium: clientPolicies.reduce(
        (sum, policy) => sum + (policy.premium_amount || 0),
        0
      ),
      totalCoverage: clientPolicies.reduce(
        (sum, policy) => sum + (policy.coverage_amount || 0),
        0
      ),
      activePolicies: clientPolicies.filter(
        (policy) => policy.status === "active"
      ).length,
      expiredPolicies: clientPolicies.filter(
        (policy) => policy.status === "expired"
      ).length,
      pendingPolicies: clientPolicies.filter(
        (policy) => policy.status === "pending"
      ).length,
    };
  };

  const clientStats = calculateClientStats();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDeleteClient = async () => {
    if (!currentClient) return;

    const success = await deleteClient(currentClient.id);
    if (success) {
      setShowDeleteModal(false);
      router.push(
        "/dashboard/client-management?success=Client deleted successfully"
      );
    }
  };

  const handleCreatePolicy = () => {
    router.push(`/dashboard/policy-management/create?client_id=${clientId}`);
  };

  const handleViewPolicy = (policyId: string) => {
    router.push(`/dashboard/policy-management/${policyId}`);
  };

  const handleEditPolicy = (policyId: string) => {
    router.push(`/dashboard/policy-management/${policyId}/edit`);
  };

  // Loading state
  if (loading && !currentClient) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading client details...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentClient) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Client Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Don't render until we have client data
  if (!currentClient) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Alert */}
      {showSuccessAlert && successMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="ml-2 text-sm font-medium text-green-800">
                {successMessage}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            } transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-medium">
                {currentClient.full_name
                  ? currentClient.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : currentClient.first_name?.[0] || ""}
              </span>
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentClient.full_name ||
                  `${currentClient.first_name || ""} ${
                    currentClient.last_name || ""
                  }`.trim()}
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Client since {formatDate(currentClient.created_at)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() =>
              router.push(`/dashboard/client-management/${clientId}/edit`)
            }
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Client</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={
              typeof deleting === "string" && deleting === currentClient.id
            }
            className={`p-2 rounded-lg ${
              isDarkMode
                ? "hover:bg-red-500/20 text-red-400"
                : "hover:bg-red-100 text-red-600"
            } transition-colors disabled:opacity-50`}
          >
            {typeof deleting === "string" && deleting === currentClient.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
            currentClient.is_active ? "active" : "inactive"
          )}`}
        >
          {currentClient.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Policies
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {clientStats.totalPolicies}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Premium
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(clientStats.totalPremium)}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Active Policies
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {clientStats.activePolicies}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Coverage
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(clientStats.totalCoverage)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Email
                </p>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentClient.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Phone
                </p>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentClient.formatted_phone ||
                    currentClient.phone ||
                    "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } mt-0.5`}
              />
              <div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Address
                </p>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentClient.formatted_address || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Date of Birth
                </p>
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentClient.date_of_birth
                    ? `${formatDate(
                        currentClient.date_of_birth
                      )} (${calculateAge(
                        currentClient.date_of_birth
                      )} years old)`
                    : "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Employment Information
          </h2>
          <div className="space-y-4">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Occupation
              </p>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentClient.occupation || "Not specified"}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Employer
              </p>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentClient.employer || "Not specified"}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Gender
              </p>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentClient.gender
                  ? currentClient.gender.charAt(0).toUpperCase() +
                    currentClient.gender.slice(1).replace("_", " ")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {currentClient.notes && (
        <div
          className={`p-6 rounded-xl border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Notes
          </h2>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            {currentClient.notes}
          </p>
        </div>
      )}

      {/* Policies Section with Real Data */}
      <div
        className={`rounded-xl border ${
          isDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Insurance Policies ({clientStats.totalPolicies})
            </h2>
            <button
              onClick={handleCreatePolicy}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Policy</span>
            </button>
          </div>
        </div>

        {/* Policies Content */}
        {policiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading policies...
            </span>
          </div>
        ) : clientStats.totalPolicies === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3
              className={`text-lg font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              No Policies Found
            </h3>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } mb-4`}
            >
              This client doesn't have any insurance policies yet.
            </p>
            <button
              onClick={handleCreatePolicy}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Policy</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Policy Details
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Premium
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Coverage
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Period
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDarkMode ? "divide-gray-800" : "divide-gray-200"
                }`}
              >
                {policies
                  .filter((policy) => policy.client_id === clientId)
                  .map((policy) => (
                    <tr key={policy.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {policy.policy_name}
                          </div>
                          <div
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {policy.policy_number} • {policy.policy_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            policy.status
                          )}`}
                        >
                          {policy.status.charAt(0).toUpperCase() +
                            policy.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(policy.premium_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatCurrency(policy.coverage_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatDate(policy.effective_date)} -{" "}
                          {formatDate(policy.expiration_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPolicy(policy.id)}
                            className={`p-2 rounded-lg ${
                              isDarkMode
                                ? "hover:bg-gray-800 text-gray-400"
                                : "hover:bg-gray-100 text-gray-600"
                            } transition-colors`}
                            title="View Policy"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPolicy(policy.id)}
                            className={`p-2 rounded-lg ${
                              isDarkMode
                                ? "hover:bg-gray-800 text-gray-400"
                                : "hover:bg-gray-100 text-gray-600"
                            } transition-colors`}
                            title="Edit Policy"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`max-w-md w-full mx-4 p-6 rounded-xl ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Delete Client
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Are you sure you want to delete{" "}
              <strong>
                {currentClient.full_name ||
                  `${currentClient.first_name || ""} ${
                    currentClient.last_name || ""
                  }`.trim()}
              </strong>
              ? This will also remove all associated policies and data.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={typeof deleting === "string"}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } transition-colors disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={typeof deleting === "string"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {typeof deleting === "string" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                <span>Delete Client</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
