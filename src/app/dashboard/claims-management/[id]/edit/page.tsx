// src/app/dashboard/claims-management/[id]/edit/page.tsx
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
  Shield,
  User,
  Users,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

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
    icon: CheckCircle,
  },
  denied: {
    label: "Denied",
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    icon: AlertCircle,
  },
  settled: {
    label: "Settled",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400",
    icon: CheckCircle,
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    icon: Target,
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
    icon: Zap,
  },
};

// Loading component
function EditClaimLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Loading Claim
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Preparing edit form...
        </p>
      </div>
    </div>
  );
}

function EditClaimContent() {
  const router = useRouter();
  const params = useParams();
  const claimId = params?.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const {
    currentClaim,
    fetchClaim,
    updateClaim,
    loading: claimLoading,
    updating,
    error: claimError,
    clearError,
  } = useClaims();

  const { clients, loading: clientsLoading, fetchClients } = useClients();
  const { policies, loading: policiesLoading, fetchPolicies } = usePolicies();

  const [formData, setFormData] = useState<any>({
    client_id: "",
    policy_id: "",
    claim_type: "",
    incident_date: "",
    reported_date: "",
    description: "",
    incident_location: "",
    claim_amount: 0,
    approved_amount: 0,
    settled_amount: 0,
    status: "pending",
    priority: "medium",
    assigned_adjuster: "",
    assigned_investigator: "",
    investigation_start_date: "",
    investigation_end_date: "",
    settlement_date: "",
    notes: "",
    internal_notes: "",
    tags: [],
  });

  const STEPS = [
    {
      id: 1,
      title: "Basic Info",
      subtitle: "Client & policy details",
      icon: User,
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
      subtitle: "Amounts & status",
      icon: DollarSign,
      fields: [
        "claim_amount",
        "approved_amount",
        "settled_amount",
        "status",
        "priority",
      ],
    },
    {
      id: 4,
      title: "Management",
      subtitle: "Assignments & dates",
      icon: Users,
      fields: [
        "assigned_adjuster",
        "assigned_investigator",
        "investigation_start_date",
        "investigation_end_date",
        "settlement_date",
      ],
    },
    {
      id: 5,
      title: "Review",
      subtitle: "Final details",
      icon: FileText,
      fields: ["notes", "internal_notes"],
    },
  ];

  useEffect(() => {
    if (claimId) {
      fetchClaim(claimId);
    }
    fetchClients();
    fetchPolicies();
  }, [claimId]);

  useEffect(() => {
    if (currentClaim && !claimLoading) {
      const populatedData = {
        client_id: currentClaim.client_id || "",
        policy_id: currentClaim.policy_id || "",
        claim_type: currentClaim.claim_type || "",
        incident_date: currentClaim.incident_date?.split("T")[0] || "",
        reported_date: currentClaim.reported_date?.split("T")[0] || "",
        description: currentClaim.description || "",
        incident_location: currentClaim.incident_location || "",
        claim_amount: currentClaim.claim_amount || 0,
        approved_amount: currentClaim.approved_amount || 0,
        settled_amount: currentClaim.settled_amount || 0,
        status: currentClaim.status || "pending",
        priority: currentClaim.priority || "medium",
        assigned_adjuster: currentClaim.assigned_adjuster || "",
        assigned_investigator: currentClaim.assigned_investigator || "",
        investigation_start_date:
          currentClaim.investigation_start_date?.split("T")[0] || "",
        investigation_end_date:
          currentClaim.investigation_end_date?.split("T")[0] || "",
        settlement_date: currentClaim.settlement_date?.split("T")[0] || "",
        notes: currentClaim.notes || "",
        internal_notes: currentClaim.internal_notes || "",
        tags: currentClaim.tags || [],
      };
      setFormData(populatedData);
      setCompletedSteps(new Set([1, 2, 3, 4, 5]));
    }
  }, [currentClaim, claimLoading]);

  const availablePolicies = policies.filter(
    (policy) => !formData.client_id || policy.client_id === formData.client_id
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === "client_id" && formData.policy_id) {
      const selectedPolicy = policies.find((p) => p.id === formData.policy_id);
      if (selectedPolicy && selectedPolicy.client_id !== value) {
        setFormData((prev: any) => ({ ...prev, policy_id: "" }));
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    const stepConfig = STEPS.find((s) => s.id === step);

    if (!stepConfig) return true;

    stepConfig.fields.forEach((field) => {
      if (field === "client_id" && !formData.client_id) {
        errors.client_id = "Client is required";
      }
      if (field === "policy_id" && !formData.policy_id) {
        errors.policy_id = "Policy is required";
      }
      if (field === "claim_type" && !formData.claim_type) {
        errors.claim_type = "Claim type is required";
      }
      if (field === "description" && !formData.description?.trim()) {
        errors.description = "Description is required";
      }
      if (field === "incident_date" && !formData.incident_date) {
        errors.incident_date = "Incident date is required";
      }
    });

    if (formData.incident_date && formData.reported_date) {
      const incidentDate = new Date(formData.incident_date);
      const reportedDate = new Date(formData.reported_date);
      if (reportedDate < incidentDate) {
        errors.reported_date = "Reported date cannot be before incident date";
      }
    }

    if (formData.investigation_start_date && formData.investigation_end_date) {
      const startDate = new Date(formData.investigation_start_date);
      const endDate = new Date(formData.investigation_end_date);
      if (startDate >= endDate) {
        errors.investigation_end_date = "End date must be after start date";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateStep(currentStep)) {
      return;
    }

    const result = await updateClaim(claimId, formData);

    if (result) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/claims-management/${claimId}`);
      }, 1500);
    }
  };

  const getSelectedClient = () => {
    return clients.find((client) => client.id === formData.client_id);
  };

  const getSelectedPolicy = () => {
    return policies.find((policy) => policy.id === formData.policy_id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  const progress = (currentStep / STEPS.length) * 100;

  const inputClasses = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-base
    ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"
    }
    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
  `;

  const selectClasses = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-base
    ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"
    }
    text-gray-900 dark:text-white
  `;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Claim Updated!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Changes saved successfully
          </p>
        </div>
      </div>
    );
  }

  if (claimLoading) {
    return <EditClaimLoading />;
  }

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
            The claim you're trying to edit doesn't exist.
          </p>
          <button
            onClick={() => router.push("/dashboard/claims-management")}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
          >
            Back to Claims
          </button>
        </div>
      </div>
    );
  }

  const currentStepConfig = STEPS.find((step) => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  router.push(`/dashboard/claims-management/${claimId}`)
                }
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Claim
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentClaim.claim_number} • Step {currentStep} of{" "}
                  {STEPS.length}
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
                className="flex flex-col items-center space-y-2 min-w-[80px] transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-orange-500 text-white shadow-lg scale-110"
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

      {/* Error Alert */}
      {claimError && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Error Updating Claim
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {claimError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="px-4 pb-32">
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
                    Update client and policy details
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) =>
                        handleInputChange("client_id", e.target.value)
                      }
                      className={selectClasses(
                        Boolean(validationErrors.client_id)
                      )}
                      disabled={clientsLoading}
                    >
                      <option value="">
                        {clientsLoading
                          ? "Loading clients..."
                          : "Select a client"}
                      </option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.first_name} {client.last_name} -{" "}
                          {client.email}
                        </option>
                      ))}
                    </select>
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
                    <select
                      value={formData.policy_id}
                      onChange={(e) =>
                        handleInputChange("policy_id", e.target.value)
                      }
                      className={selectClasses(
                        Boolean(validationErrors.policy_id)
                      )}
                      disabled={!formData.client_id || policiesLoading}
                    >
                      <option value="">
                        {!formData.client_id
                          ? "Select a client first"
                          : policiesLoading
                          ? "Loading policies..."
                          : "Select a policy"}
                      </option>
                      {availablePolicies.map((policy) => (
                        <option key={policy.id} value={policy.id}>
                          {policy.policy_number} - {policy.policy_name}
                        </option>
                      ))}
                    </select>
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
                    className={selectClasses(
                      Boolean(validationErrors.claim_type)
                    )}
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
                              Coverage:{" "}
                              {formatCurrency(
                                getSelectedPolicy()?.coverage_amount || 0
                              )}
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
                    Update when and where the incident occurred
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
                        className={inputClasses(
                          Boolean(validationErrors.incident_date)
                        )}
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
                        className={inputClasses(
                          Boolean(validationErrors.reported_date)
                        )}
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
                      className={inputClasses(false)}
                      placeholder="Enter the location where the incident occurred"
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
                    Update claim amounts and status
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Claim Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.claim_amount}
                        onChange={(e) =>
                          handleInputChange(
                            "claim_amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={inputClasses(false)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Approved Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.approved_amount}
                        onChange={(e) =>
                          handleInputChange(
                            "approved_amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={inputClasses(false)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Settled Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.settled_amount}
                        onChange={(e) =>
                          handleInputChange(
                            "settled_amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={inputClasses(false)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className={selectClasses(false)}
                    >
                      {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(PRIORITY_CONFIG).map(
                        ([value, config]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleInputChange("priority", value)}
                            className={`p-3 rounded-xl border-2 transition-all font-medium ${
                              formData.priority === value
                                ? `${config.color} border-transparent shadow-md`
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {config.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Management */}
            {currentStep === 4 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Management Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update assignments and investigation dates
                  </p>
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
                      placeholder="Enter adjuster name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Assigned Investigator
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_investigator}
                      onChange={(e) =>
                        handleInputChange(
                          "assigned_investigator",
                          e.target.value
                        )
                      }
                      className={inputClasses(false)}
                      placeholder="Enter investigator name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Investigation Start
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.investigation_start_date}
                        onChange={(e) =>
                          handleInputChange(
                            "investigation_start_date",
                            e.target.value
                          )
                        }
                        className={inputClasses(false)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Investigation End
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.investigation_end_date}
                        onChange={(e) =>
                          handleInputChange(
                            "investigation_end_date",
                            e.target.value
                          )
                        }
                        className={inputClasses(
                          Boolean(validationErrors.investigation_end_date)
                        )}
                      />
                    </div>
                    {validationErrors.investigation_end_date && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validationErrors.investigation_end_date}</span>
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Settlement Date
                    </label>
                    <div className="relative max-w-sm">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.settlement_date}
                        onChange={(e) =>
                          handleInputChange("settlement_date", e.target.value)
                        }
                        className={inputClasses(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Review & Submit
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review your changes before submitting
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
                        Status:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {formData.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Claim Amount:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(formData.claim_amount)}
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      rows={3}
                      className={inputClasses(false)}
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Internal Notes
                      <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                        Internal Only
                      </span>
                    </label>
                    <textarea
                      value={formData.internal_notes}
                      onChange={(e) =>
                        handleInputChange("internal_notes", e.target.value)
                      }
                      rows={3}
                      className={inputClasses(false)}
                      placeholder="Internal notes for staff use only..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl">
        <div className="flex items-center justify-between space-x-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
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
              {currentStepConfig?.title}
            </div>
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              form="claim-form"
              disabled={updating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
            >
              {updating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{updating ? "Updating..." : "Update Claim"}</span>
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

export default function EditClaimPage() {
  return (
    <Suspense fallback={<EditClaimLoading />}>
      <EditClaimContent />
    </Suspense>
  );
}
