// src\app\dashboard\claims-management\new\page.tsx
"use client";

import { useClaims, type ClaimFormData } from "@/hooks/useClaims";
import { useClients } from "@/hooks/useClients";
import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Save,
  Info,
  User,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const CLAIM_TYPES = [
  "Motor Accident",
  "Property Damage",
  "Life Insurance",
  "Health Insurance",
  "Travel Insurance",
  "Business Insurance",
  "Fire Damage",
  "Theft",
  "Natural Disaster",
  "Personal Injury",
  "Professional Liability",
  "Other",
];

const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    subtitle: "Claim details",
    icon: FileText,
    fields: ["client_id", "policy_id", "claim_type", "description"],
  },
  {
    id: 2,
    title: "Incident Details",
    subtitle: "When & where",
    icon: MapPin,
    fields: ["incident_date", "reported_date", "incident_location"],
  },
  {
    id: 3,
    title: "Financials",
    subtitle: "Amount & priority",
    icon: DollarSign,
    fields: ["claim_amount", "priority", "status"],
  },
  {
    id: 4,
    title: "Review",
    subtitle: "Final details",
    icon: CheckCircle,
    fields: ["notes", "assigned_adjuster"],
  },
];

export default function CreateClaimPage() {
  const router = useRouter();
  const { createClaim, creating, error: claimError, clearError } = useClaims();
  const {
    clients,
    loading: clientsLoading,
    fetchClients,
    error: clientsError,
  } = useClients();
  const {
    policies,
    loading: policiesLoading,
    fetchPolicies,
    error: policiesError,
  } = usePolicies();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ClaimFormData>({
    client_id: "",
    policy_id: "",
    claim_type: "",
    incident_date: new Date().toISOString().split("T")[0],
    reported_date: new Date().toISOString().split("T")[0],
    description: "",
    incident_location: "",
    claim_amount: 0,
    status: "pending",
    priority: "medium",
    assigned_adjuster: "",
    notes: "",
    tags: [],
  });

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchClients(), fetchPolicies()]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [fetchClients, fetchPolicies]);

  // Filter policies based on selected client
  const availablePolicies = policies.filter(
    (policy) => policy.client_id === formData.client_id
  );

  // Check if selected client has policies
  const clientHasPolicies = availablePolicies.length > 0;
  const selectedClient = clients.find(
    (client) => client.id === formData.client_id
  );

  const handleInputChange = useCallback(
    (field: keyof ClaimFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setSubmitError("");
      clearError();

      // Clear validation error when field is updated
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Reset policy selection when client changes
      if (field === "client_id") {
        setFormData((prev) => ({ ...prev, policy_id: "" }));
      }
    },
    [validationErrors, clearError]
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const errors: Record<string, string> = {};
      const stepConfig = STEPS.find((s) => s.id === step);

      if (!stepConfig) return true;

      stepConfig.fields.forEach((field) => {
        if (field === "client_id" && !formData.client_id) {
          errors.client_id = "Client is required";
        }
        if (field === "policy_id" && !formData.policy_id) {
          if (!formData.client_id) {
            errors.policy_id = "Select a client first";
          } else if (!clientHasPolicies) {
            errors.policy_id = "Selected client has no policies";
          } else {
            errors.policy_id = "Policy is required";
          }
        }
        if (field === "claim_type" && !formData.claim_type) {
          errors.claim_type = "Claim type is required";
        }
        if (field === "description" && !formData.description.trim()) {
          errors.description = "Description is required";
        }
        if (field === "incident_date" && !formData.incident_date) {
          errors.incident_date = "Incident date is required";
        }
        if (
          field === "claim_amount" &&
          (formData.claim_amount === undefined || formData.claim_amount < 0)
        ) {
          errors.claim_amount = "Claim amount cannot be negative";
        }
      });

      // Date validations
      if (formData.incident_date && formData.reported_date) {
        const incidentDate = new Date(formData.incident_date);
        const reportedDate = new Date(formData.reported_date);
        const today = new Date();

        if (incidentDate > today) {
          errors.incident_date = "Incident date cannot be in the future";
        }

        if (reportedDate < incidentDate) {
          errors.reported_date = "Reported date cannot be before incident date";
        }
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [formData, clientHasPolicies]
  );

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submissions

    clearError();
    setSubmitError("");

    if (!validateStep(currentStep)) {
      return;
    }

    // Final validation for all steps
    let hasErrors = false;
    for (let step = 1; step <= STEPS.length; step++) {
      if (!validateStep(step)) {
        hasErrors = true;
        break;
      }
    }

    if (hasErrors) {
      setSubmitError("Please fix all validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for API
      const submitData = {
        ...formData,
        claim_amount: Number(formData.claim_amount) || 0,
        description: formData.description.trim(),
        incident_location: formData.incident_location?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        assigned_adjuster: formData.assigned_adjuster?.trim() || undefined,
      };

      console.log("Submitting claim data:", submitData);

      const result = await createClaim(submitData);

      if (result) {
        console.log("Claim created successfully:", result);
        setShowSuccess(true);

        // Redirect after delay
        setTimeout(() => {
          router.push(`/dashboard/claims-management/${result.id}`);
        }, 2000);
      } else {
        setSubmitError(
          "Failed to create claim. Please check your data and try again."
        );
      }
    } catch (error) {
      console.error("Claim creation error:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedClient = useCallback(() => {
    return clients.find((client) => client.id === formData.client_id);
  }, [clients, formData.client_id]);

  const getSelectedPolicy = useCallback(() => {
    return policies.find((policy) => policy.id === formData.policy_id);
  }, [policies, formData.policy_id]);

  const progress = (currentStep / STEPS.length) * 100;

  // Show success state
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Claim Created Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your claim has been submitted and is now being processed.
          </p>
          <div className="animate-pulse text-sm text-gray-500 dark:text-gray-500">
            Redirecting to claim details...
          </div>
        </div>
      </div>
    );
  }

  const inputClasses = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-base
    ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"
    }
    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  New Claim
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {STEPS.length}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div className="px-4 py-6 bg-white dark:bg-gray-900 overflow-x-auto">
        <div className="flex space-x-4 min-w-max">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 min-w-[80px] transition-all duration-200 ${
                  isCurrent ? "scale-110" : "scale-100"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-orange-500 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs font-medium ${
                      isCurrent
                        ? "text-orange-600 dark:text-orange-400"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alerts */}
      {(claimError || submitError || clientsError || policiesError) && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {claimError || submitError || clientsError || policiesError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      {/* pb-48 (was pb-32) — gives the scroll content enough bottom clearance
          to clear the taller fixed nav below (button row + progress dots +
          safe-area padding) so the last field on any step never sits behind it. */}
      <main className="px-4 pb-48">
        <form onSubmit={handleSubmit} id="claim-form">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Claim Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Let&apos;s start with basic claim details
                  </p>
                </div>

                {/* Loading states for data */}
                {(clientsLoading || policiesLoading) && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      Loading data...
                    </span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.client_id}
                        onChange={(e) =>
                          handleInputChange("client_id", e.target.value)
                        }
                        className={`${inputClasses(
                          Boolean(validationErrors.client_id)
                        )} pl-10`}
                        disabled={clientsLoading || isSubmitting}
                      >
                        <option value="">
                          {clientsLoading
                            ? "Loading clients..."
                            : clients.length === 0
                            ? "No clients available"
                            : "Select a client"}
                        </option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.first_name} {client.last_name} -{" "}
                            {client.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.client_id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.client_id}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Policy <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.policy_id}
                        onChange={(e) =>
                          handleInputChange("policy_id", e.target.value)
                        }
                        className={`${inputClasses(
                          Boolean(validationErrors.policy_id)
                        )} pl-10`}
                        disabled={
                          !formData.client_id ||
                          policiesLoading ||
                          !clientHasPolicies ||
                          isSubmitting
                        }
                      >
                        <option value="">
                          {!formData.client_id
                            ? "Select a client first"
                            : policiesLoading
                            ? "Loading policies..."
                            : !clientHasPolicies
                            ? "No policies available"
                            : "Select a policy"}
                        </option>
                        {availablePolicies.map((policy) => (
                          <option key={policy.id} value={policy.id}>
                            {policy.policy_number} - {policy.policy_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Client has no policies warning */}
                    {formData.client_id &&
                      !clientHasPolicies &&
                      !policiesLoading && (
                        <div className="mt-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30">
                          <div className="flex items-start space-x-2">
                            <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                No Policies Found
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                {selectedClient?.first_name}{" "}
                                {selectedClient?.last_name} has no active
                                policies. Please assign a policy to this client
                                before creating a claim.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {validationErrors.policy_id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.policy_id}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Claim Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.claim_type}
                    onChange={(e) =>
                      handleInputChange("claim_type", e.target.value)
                    }
                    className={inputClasses(
                      Boolean(validationErrors.claim_type)
                    )}
                    disabled={isSubmitting}
                  >
                    <option value="">Select claim type</option>
                    {CLAIM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {validationErrors.claim_type && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.claim_type}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className={inputClasses(
                      Boolean(validationErrors.description)
                    )}
                    placeholder="Please provide a detailed description of the incident..."
                    disabled={isSubmitting}
                  />
                  {validationErrors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.description}</span>
                    </p>
                  )}
                </div>

                {/* Client & Policy Preview */}
                {(getSelectedClient() || getSelectedPolicy()) && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Selected Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {getSelectedClient() && (
                        <div>
                          <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Client
                          </h5>
                          <div className="text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {getSelectedClient()?.first_name}{" "}
                              {getSelectedClient()?.last_name}
                            </p>
                            <p>{getSelectedClient()?.email}</p>
                            {getSelectedClient()?.phone && (
                              <p>{getSelectedClient()?.phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {getSelectedPolicy() && (
                        <div>
                          <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Policy
                          </h5>
                          <div className="text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {getSelectedPolicy()?.policy_name}
                            </p>
                            <p>Type: {getSelectedPolicy()?.policy_type}</p>
                            <p>
                              Coverage: BWP{" "}
                              {getSelectedPolicy()?.coverage_amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Incident Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    When and where did the incident occur?
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Incident Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.incident_date}
                        onChange={(e) =>
                          handleInputChange("incident_date", e.target.value)
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className={`${inputClasses(
                          Boolean(validationErrors.incident_date)
                        )} pl-10`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {validationErrors.incident_date && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.incident_date}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Reported Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.reported_date}
                        onChange={(e) =>
                          handleInputChange("reported_date", e.target.value)
                        }
                        className={`${inputClasses(
                          Boolean(validationErrors.reported_date)
                        )} pl-10`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {validationErrors.reported_date && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.reported_date}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Incident Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.incident_location}
                      onChange={(e) =>
                        handleInputChange("incident_location", e.target.value)
                      }
                      className={`${inputClasses(false)} pl-10`}
                      placeholder="Enter the location where the incident occurred"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Financials */}
            {currentStep === 3 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Financial Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Claim amount and priority level
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Claim Amount (BWP)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.claim_amount || 0}
                        onChange={(e) =>
                          handleInputChange(
                            "claim_amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`${inputClasses(
                          Boolean(validationErrors.claim_amount)
                        )} pl-10`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={isSubmitting}
                      />
                    </div>
                    {validationErrors.claim_amount && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.claim_amount}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className={inputClasses(false)}
                      disabled={isSubmitting}
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        value: "low",
                        label: "Low",
                        color:
                          "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
                      },
                      {
                        value: "medium",
                        label: "Medium",
                        color:
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
                      },
                      {
                        value: "high",
                        label: "High",
                        color:
                          "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400",
                      },
                      {
                        value: "critical",
                        label: "Critical",
                        color:
                          "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
                      },
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() =>
                          handleInputChange("priority", priority.value)
                        }
                        className={`p-3 rounded-xl border-2 transition-all font-medium ${
                          formData.priority === priority.value
                            ? `${priority.color} border-transparent shadow-md`
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        disabled={isSubmitting}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Review & Submit
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review your claim information before submitting
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Claim Summary
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Client:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getSelectedClient()?.first_name}{" "}
                        {getSelectedClient()?.last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Policy:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getSelectedPolicy()?.policy_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Claim Type:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.claim_type}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Incident Date:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(formData.incident_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Claim Amount:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        BWP {(formData.claim_amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Priority:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {formData.priority}
                      </p>
                    </div>
                  </div>

                  {formData.description && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Description:
                      </span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {formData.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Assigned Adjuster
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_adjuster}
                      onChange={(e) =>
                        handleInputChange("assigned_adjuster", e.target.value)
                      }
                      className={inputClasses(false)}
                      placeholder="Optional"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      rows={3}
                      className={inputClasses(false)}
                      placeholder="Any additional information..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Fixed Bottom Navigation */}
      {/* z-30 (was unset — could lose a stacking fight with the app's bottom
          tab bar) so this nav always renders above the tabs. Bump this if
          your tab bar's z-index is 30 or higher.
          paddingBottom clears the tab bar's height (~64-70px) plus the
          iOS safe-area home-indicator inset, so Next/Create Claim never
          sits underneath the tabs — same pattern as the client and policy
          creation pages. */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between space-x-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex-1 text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep} of {STEPS.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {STEPS.find((step) => step.id === currentStep)?.title}
            </div>
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              form="claim-form"
              disabled={creating || isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
            >
              {creating || isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>
                {creating || isSubmitting ? "Creating..." : "Create Claim"}
              </span>
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                completedSteps.has(step.id)
                  ? "bg-green-500"
                  : currentStep === step.id
                  ? "bg-orange-500 w-6"
                  : step.id < currentStep
                  ? "bg-orange-300"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}