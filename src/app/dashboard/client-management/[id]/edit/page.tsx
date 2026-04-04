"use client";

import { useClients } from "@/hooks/useClients";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Edit,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  dateOfBirth: string;
  occupation: string;
  employerName: string;
  annualIncome: string;
  maritalStatus: string;
  dependents: string;
  notes: string;
  status: "active" | "inactive" | "suspended";
}

// Initial empty form data
const INITIAL_FORM_DATA: ClientFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  dateOfBirth: "",
  occupation: "",
  employerName: "",
  annualIncome: "",
  maritalStatus: "",
  dependents: "",
  notes: "",
  status: "active",
};

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  // Use the useClients hook to fetch client data
  const { currentClient, fetchClient, updateClient, loading, updating, error } =
    useClients();

  const isDarkMode = false; // This would come from your theme context

  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] =
    useState<ClientFormData>(INITIAL_FORM_DATA);

  // Fetch client data when component mounts
  useEffect(() => {
    if (clientId) {
      fetchClient(clientId);
    }
  }, [clientId, fetchClient]);

  // Update form data when client data is fetched
  useEffect(() => {
    if (currentClient) {
      const clientFormData: ClientFormData = {
        firstName: currentClient.first_name || "",
        lastName: currentClient.last_name || "",
        email: currentClient.email || "",
        phone: currentClient.phone || "",
        address:
          currentClient.formatted_address || currentClient.address_line1 || "",
        city: currentClient.city || "",
        postalCode: currentClient.postal_code || "",
        dateOfBirth: currentClient.date_of_birth || "",
        occupation: currentClient.occupation || "",
        employerName: currentClient.employer || "",
        annualIncome: currentClient.annual_income?.toString() || "",
        maritalStatus: "", // Add this field to your database if needed
        dependents: "2", // This would need to come from your database
        notes: currentClient.notes || "",
        status: currentClient.is_active ? "active" : "inactive",
      };

      setFormData(clientFormData);
      setInitialData(clientFormData);
    }
  }, [currentClient]);

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Check if there are changes
    const newFormData = { ...formData, [field]: value };
    const hasChanges =
      JSON.stringify(newFormData) !== JSON.stringify(initialData);
    setHasChanges(hasChanges);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentClient) {
      return;
    }

    try {
      // Convert form data back to the format expected by updateClient
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_line1: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        date_of_birth: formData.dateOfBirth || undefined,
        occupation: formData.occupation || undefined,
        employer: formData.employerName || undefined,
        annual_income: formData.annualIncome || undefined,
        notes: formData.notes || undefined,
        is_active: formData.status === "active",
      };

      const updatedClient = await updateClient(currentClient.id, updateData);

      if (updatedClient) {
        // Navigate back to client detail with success message
        router.push(
          `/dashboard/client-management/${currentClient.id}?success=Client updated successfully`
        );
      }
    } catch (error) {
      console.error("Error updating client:", error);
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

  // Show loading state
  if (loading && !currentClient) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading client data...
          </span>
        </div>
      </div>
    );
  }

  // Show error if client not found
  if (error && !currentClient) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
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

  // Don't render form until we have client data
  if (!currentClient) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className={`p-2 rounded-lg ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            } transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
              }`}
            >
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Edit Client
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Update {formData.firstName} {formData.lastName}'s information
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updating || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{updating ? "Updating..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className={`p-4 rounded-lg border-l-4 border-red-500 mb-6 ${
            isDarkMode ? "bg-red-500/10" : "bg-red-50"
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-red-400" : "text-red-800"
              }`}
            >
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div
          className={`p-4 rounded-lg border-l-4 border-yellow-500 mb-6 ${
            isDarkMode
              ? "bg-yellow-500/10 border-yellow-500"
              : "bg-yellow-50 border-yellow-500"
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-yellow-400" : "text-yellow-800"
              }`}
            >
              You have unsaved changes
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.firstName
                    ? "border-red-500 ring-1 ring-red-500"
                    : isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.lastName
                    ? "border-red-500 ring-1 ring-red-500"
                    : isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.email
                      ? "border-red-500 ring-1 ring-red-500"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Phone Number *
              </label>
              <div className="relative">
                <Phone
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.phone
                      ? "border-red-500 ring-1 ring-red-500"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="+267 7xxx xxxx"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Date of Birth
              </label>
              <div className="relative">
                <Calendar
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Marital Status
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) =>
                  handleInputChange("maritalStatus", e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select marital status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
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
            Status
          </h2>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Client Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                handleInputChange(
                  "status",
                  e.target.value as "active" | "inactive" | "suspended"
                )
              }
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <p
              className={`mt-1 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Changes to client status will affect their ability to make claims
              and purchase new policies.
            </p>
          </div>
        </div>

        {/* Address Information */}
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
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Street Address *
              </label>
              <div className="relative">
                <MapPin
                  className={`absolute left-3 top-3 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.address
                      ? "border-red-500 ring-1 ring-red-500"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter street address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.city
                    ? "border-red-500 ring-1 ring-red-500"
                    : isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) =>
                  handleInputChange("postalCode", e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter postal code"
              />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Occupation
              </label>
              <div className="relative">
                <Briefcase
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter occupation"
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Employer Name
              </label>
              <input
                type="text"
                value={formData.employerName}
                onChange={(e) =>
                  handleInputChange("employerName", e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter employer name"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Annual Income (BWP)
              </label>
              <input
                type="number"
                value={formData.annualIncome}
                onChange={(e) =>
                  handleInputChange("annualIncome", e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter annual income"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Number of Dependents
              </label>
              <input
                type="number"
                value={formData.dependents}
                onChange={(e) =>
                  handleInputChange("dependents", e.target.value)
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter number of dependents"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
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
            Additional Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-300 bg-white text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter any additional notes about the client..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className={`px-6 py-2 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updating || !hasChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{updating ? "Updating Client..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
