// src/app/dashboard/policy-management/create/page.tsx - FIXED VERSION
"use client";

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
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
  Tag,
  FileText,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";

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

const POLICY_TYPES = [
  {
    value: "life",
    label: "Life Insurance",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
  },
  {
    value: "motor",
    label: "Motor Insurance",
    color:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
  },
  {
    value: "home",
    label: "Home Insurance",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
  },
  {
    value: "health",
    label: "Health Insurance",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-400",
  },
  {
    value: "travel",
    label: "Travel Insurance",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400",
  },
  {
    value: "business",
    label: "Business Insurance",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400",
  },
];

const POLICY_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
  },
  {
    value: "active",
    label: "Active",
    color:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
  },
  {
    value: "suspended",
    label: "Suspended",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400",
  },
  {
    value: "expired",
    label: "Expired",
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400",
  },
];

const PRIORITIES = [
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
    color: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
  },
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

// Steps configuration
const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    subtitle: "Policy details",
    icon: Shield,
    fields: [
      "client_id",
      "policy_name",
      "policy_type",
      "status",
      "priority",
      "description",
    ],
  },
  {
    id: 2,
    title: "Financials",
    subtitle: "Coverage & premiums",
    icon: DollarSign,
    fields: ["coverage_amount", "premium_amount", "deductible"],
  },
  {
    id: 3,
    title: "Dates",
    subtitle: "Policy timeline",
    icon: Calendar,
    fields: ["effective_date", "expiration_date", "renewal_date"],
  },
  {
    id: 4,
    title: "Beneficiaries",
    subtitle: "Policy recipients",
    icon: Users,
    fields: ["beneficiaries"],
  },
  {
    id: 5,
    title: "Final Details",
    subtitle: "Terms & notes",
    icon: FileText,
    fields: ["terms_conditions", "notes", "tags"],
  },
];

// Create a separate component that uses useSearchParams
function CreatePolicyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createPolicy, creating, error: policyError } = usePolicies();
  const { clients, fetchClients, loading: clientsLoading } = useClients();

  const clientIdFromUrl = searchParams.get("client_id");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PolicyFormData>({
    client_id: clientIdFromUrl || "",
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [newTag, setNewTag] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Set default effective date to today AND pre-fill client if provided in URL
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      effective_date: prev.effective_date || today,
      client_id: clientIdFromUrl || prev.client_id,
    }));
  }, [clientIdFromUrl]);

  const handleInputChange = (
    field: keyof PolicyFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (submissionError) {
      setSubmissionError(null);
    }
  };

  const handleBlur = (field: keyof PolicyFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateCurrentStep();
  };

  // Validate a specific step without changing current step
  const validateStep = useCallback(
    (stepNumber: number): boolean => {
      const stepConfig = STEPS.find((step) => step.id === stepNumber);
      if (!stepConfig) return true;

      const stepErrors: FormErrors = {};
      let isValid = true;

      stepConfig.fields.forEach((field) => {
        if (field === "beneficiaries") {
          if (formData.beneficiaries.length > 0) {
            const totalPercentage = formData.beneficiaries.reduce(
              (sum, b) => sum + b.percentage,
              0
            );
            if (Math.abs(totalPercentage - 100) > 0.01) {
              stepErrors.beneficiaries =
                "Beneficiary percentages must total 100%";
              isValid = false;
            }
          }
        } else {
          const value = formData[field as keyof PolicyFormData];
          const requiredFields = [
            "client_id",
            "policy_name",
            "policy_type",
            "coverage_amount",
            "premium_amount",
            "effective_date",
            "expiration_date",
          ];

          if (
            requiredFields.includes(field) &&
            typeof value === "string" &&
            !value.trim()
          ) {
            stepErrors[field] = "This field is required";
            isValid = false;
          }
        }
      });

      // Numeric validations for financial step
      if (stepNumber === 2) {
        const coverageAmount = parseFloat(formData.coverage_amount);
        if (isNaN(coverageAmount) || coverageAmount <= 0) {
          stepErrors.coverage_amount =
            "Coverage amount must be a positive number";
          isValid = false;
        }

        const premiumAmount = parseFloat(formData.premium_amount);
        if (isNaN(premiumAmount) || premiumAmount <= 0) {
          stepErrors.premium_amount =
            "Premium amount must be a positive number";
          isValid = false;
        }

        const deductible = parseFloat(formData.deductible);
        if (isNaN(deductible) || deductible < 0) {
          stepErrors.deductible = "Deductible must be a non-negative number";
          isValid = false;
        }
      }

      // Date validations for dates step
      if (stepNumber === 3) {
        if (formData.effective_date && formData.expiration_date) {
          const effectiveDate = new Date(formData.effective_date);
          const expirationDate = new Date(formData.expiration_date);

          if (effectiveDate >= expirationDate) {
            stepErrors.expiration_date =
              "Expiration date must be after effective date";
            isValid = false;
          }
        }
      }

      if (stepNumber === currentStep) {
        setErrors((prev) => ({ ...prev, ...stepErrors }));
      }

      return isValid;
    },
    [formData, currentStep]
  );

  const validateCurrentStep = useCallback(() => {
    return validateStep(currentStep);
  }, [validateStep, currentStep]);

  const handleNext = () => {
    if (validateCurrentStep()) {
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

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= currentStep || completedSteps.has(stepNumber - 1)) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    setShowSuccess(false);
    setSubmissionError(null);

    // Validate all steps
    let allValid = true;
    const allErrors: FormErrors = {};

    for (let step = 1; step <= STEPS.length; step++) {
      const stepConfig = STEPS.find((s) => s.id === step);
      if (!stepConfig) continue;

      const stepErrors: FormErrors = {};
      let stepValid = true;

      stepConfig.fields.forEach((field) => {
        if (field === "beneficiaries") {
          if (formData.beneficiaries.length > 0) {
            const totalPercentage = formData.beneficiaries.reduce(
              (sum, b) => sum + b.percentage,
              0
            );
            if (Math.abs(totalPercentage - 100) > 0.01) {
              stepErrors.beneficiaries =
                "Beneficiary percentages must total 100%";
              stepValid = false;
            }
          }
        } else {
          const requiredFields = [
            "client_id",
            "policy_name",
            "policy_type",
            "coverage_amount",
            "premium_amount",
            "effective_date",
            "expiration_date",
          ];

          if (requiredFields.includes(field)) {
            const value = formData[field as keyof PolicyFormData];
            if (typeof value === "string" && !value.trim()) {
              stepErrors[field] = "This field is required";
              stepValid = false;
            }
          }
        }
      });

      if (step === 2) {
        const coverageAmount = parseFloat(formData.coverage_amount);
        if (isNaN(coverageAmount) || coverageAmount <= 0) {
          stepErrors.coverage_amount =
            "Coverage amount must be a positive number";
          stepValid = false;
        }

        const premiumAmount = parseFloat(formData.premium_amount);
        if (isNaN(premiumAmount) || premiumAmount <= 0) {
          stepErrors.premium_amount =
            "Premium amount must be a positive number";
          stepValid = false;
        }
      }

      if (step === 3) {
        if (formData.effective_date && formData.expiration_date) {
          const effectiveDate = new Date(formData.effective_date);
          const expirationDate = new Date(formData.expiration_date);

          if (effectiveDate >= expirationDate) {
            stepErrors.expiration_date =
              "Expiration date must be after effective date";
            stepValid = false;
          }
        }
      }

      if (!stepValid) {
        allValid = false;
        Object.assign(allErrors, stepErrors);
      }
    }

    if (!allValid) {
      setErrors(allErrors);
      setSubmissionError("Please fix all validation errors before submitting");

      for (let step = 1; step <= STEPS.length; step++) {
        const stepConfig = STEPS.find((s) => s.id === step);
        if (stepConfig && stepConfig.fields.some((field) => allErrors[field])) {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        }
      }
      return;
    }

    // Prepare data for API
    const submissionData = {
      client_id: formData.client_id,
      policy_name: formData.policy_name,
      policy_type: formData.policy_type,
      description: formData.description || undefined,
      coverage_amount: parseFloat(formData.coverage_amount),
      premium_amount: parseFloat(formData.premium_amount),
      deductible: parseFloat(formData.deductible || "0"),
      effective_date: formData.effective_date,
      expiration_date: formData.expiration_date,
      renewal_date: formData.renewal_date || undefined,
      status: formData.status,
      priority: formData.priority,
      terms_conditions: formData.terms_conditions || undefined,
      beneficiaries:
        formData.beneficiaries.length > 0 ? formData.beneficiaries : undefined,
      riders: formData.riders.length > 0 ? formData.riders : undefined,
      notes: formData.notes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    const result = await createPolicy(submissionData);

    if (result.success && result.data) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push(
          `/dashboard/policy-management/${
            result.data!.id
          }?success=Policy created successfully`
        );
      }, 1500);
    } else {
      setSubmissionError(result.error || "Failed to create policy");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  const currentStepConfig = STEPS.find((step) => step.id === currentStep);
  const progress = (currentStep / STEPS.length) * 100;

  const selectedClient = clients.find(
    (client) => client.id === formData.client_id
  );
  const selectedClientName = selectedClient
    ? `${selectedClient.first_name} ${selectedClient.last_name}`
    : null;

  // Input styling
  const inputClasses = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-base
    ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
    }
    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const selectClasses = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-base
    ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
    }
    text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const textareaClasses = (hasError: boolean) => `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-base
    ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
    }
    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
    disabled:opacity-50 disabled:cursor-not-allowed resize-vertical
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
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  New Policy
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {STEPS.length}
                  {selectedClientName && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      • For {selectedClientName}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
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
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={
                  step.id > currentStep && !completedSteps.has(step.id - 1)
                }
                className={`flex flex-col items-center space-y-2 transition-all duration-200 min-w-[80px] ${
                  step.id <= currentStep || completedSteps.has(step.id)
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white shadow-lg scale-110"
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
                        ? "text-blue-600 dark:text-blue-400"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alerts */}
      {(policyError || submissionError) && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Unable to create policy
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {submissionError || policyError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Policy Created!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Successfully added to your portfolio
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="px-4 pb-32">
        <form onSubmit={handleSubmit} id="policy-form">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Policy Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Let's start with basic policy details
                    {selectedClientName && (
                      <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                        Creating policy for: {selectedClientName}
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={(e) =>
                      handleInputChange("client_id", e.target.value)
                    }
                    onBlur={() => handleBlur("client_id")}
                    className={selectClasses(Boolean(errors.client_id))}
                    disabled={clientsLoading}
                  >
                    <option value="">
                      {clientsLoading
                        ? "Loading clients..."
                        : "Select a client"}
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} - {client.email}
                      </option>
                    ))}
                  </select>
                  {errors.client_id && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.client_id}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Policy Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="policy_name"
                    value={formData.policy_name}
                    onChange={(e) =>
                      handleInputChange("policy_name", e.target.value)
                    }
                    onBlur={() => handleBlur("policy_name")}
                    className={inputClasses(Boolean(errors.policy_name))}
                    placeholder="Enter policy name"
                  />
                  {errors.policy_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.policy_name}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Policy Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="policy_type"
                      value={formData.policy_type}
                      onChange={(e) =>
                        handleInputChange("policy_type", e.target.value)
                      }
                      onBlur={() => handleBlur("policy_type")}
                      className={selectClasses(Boolean(errors.policy_type))}
                    >
                      <option value="">Select policy type</option>
                      {POLICY_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.policy_type && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.policy_type}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className={selectClasses(false)}
                    >
                      {POLICY_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className={selectClasses(false)}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className={textareaClasses(false)}
                    placeholder="Enter policy description"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Financials */}
            {currentStep === 2 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Financial Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set coverage amounts and premium information
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Coverage Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="coverage_amount"
                      value={formData.coverage_amount}
                      onChange={(e) =>
                        handleInputChange("coverage_amount", e.target.value)
                      }
                      onBlur={() => handleBlur("coverage_amount")}
                      className={`${inputClasses(
                        Boolean(errors.coverage_amount)
                      )} pl-10`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.coverage_amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.coverage_amount}</span>
                    </p>
                  )}
                  {formData.coverage_amount && !errors.coverage_amount && (
                    <p className="mt-2 text-sm text-green-600">
                      Coverage:{" "}
                      {formatCurrency(parseFloat(formData.coverage_amount))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Premium Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="premium_amount"
                      value={formData.premium_amount}
                      onChange={(e) =>
                        handleInputChange("premium_amount", e.target.value)
                      }
                      onBlur={() => handleBlur("premium_amount")}
                      className={`${inputClasses(
                        Boolean(errors.premium_amount)
                      )} pl-10`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.premium_amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.premium_amount}</span>
                    </p>
                  )}
                  {formData.premium_amount && !errors.premium_amount && (
                    <p className="mt-2 text-sm text-green-600">
                      Premium:{" "}
                      {formatCurrency(parseFloat(formData.premium_amount))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Deductible
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="deductible"
                      value={formData.deductible}
                      onChange={(e) =>
                        handleInputChange("deductible", e.target.value)
                      }
                      onBlur={() => handleBlur("deductible")}
                      className={`${inputClasses(
                        Boolean(errors.deductible)
                      )} pl-10`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.deductible && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.deductible}</span>
                    </p>
                  )}
                  {formData.deductible && !errors.deductible && (
                    <p className="mt-2 text-sm text-blue-600">
                      Deductible:{" "}
                      {formatCurrency(parseFloat(formData.deductible))}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Dates */}
            {currentStep === 3 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Policy Timeline
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set effective dates and policy duration
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="effective_date"
                      value={formData.effective_date}
                      onChange={(e) =>
                        handleInputChange("effective_date", e.target.value)
                      }
                      onBlur={() => handleBlur("effective_date")}
                      className={`${inputClasses(
                        Boolean(errors.effective_date)
                      )} pl-10`}
                    />
                  </div>
                  {errors.effective_date && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.effective_date}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Expiration Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="expiration_date"
                      value={formData.expiration_date}
                      onChange={(e) =>
                        handleInputChange("expiration_date", e.target.value)
                      }
                      onBlur={() => handleBlur("expiration_date")}
                      className={`${inputClasses(
                        Boolean(errors.expiration_date)
                      )} pl-10`}
                    />
                  </div>
                  {errors.expiration_date && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.expiration_date}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Renewal Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="renewal_date"
                      value={formData.renewal_date}
                      onChange={(e) =>
                        handleInputChange("renewal_date", e.target.value)
                      }
                      className={inputClasses(false)}
                    />
                  </div>
                </div>

                {formData.effective_date &&
                  formData.expiration_date &&
                  !errors.expiration_date && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Policy Duration
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {Math.ceil(
                          (new Date(formData.expiration_date).getTime() -
                            new Date(formData.effective_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Step 4: Beneficiaries */}
            {currentStep === 4 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Beneficiaries
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add policy beneficiaries and their allocation percentages
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Beneficiaries ({formData.beneficiaries.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addBeneficiary}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Beneficiary</span>
                  </button>
                </div>

                {formData.beneficiaries.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No beneficiaries added yet
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Add beneficiaries to specify who will receive policy
                      benefits
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.beneficiaries.map((beneficiary, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Beneficiary #{index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeBeneficiary(index)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={beneficiary.name}
                              onChange={(e) =>
                                updateBeneficiary(index, "name", e.target.value)
                              }
                              className={inputClasses(false)}
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                              className={selectClasses(false)}
                            >
                              <option value="">Select relationship</option>
                              {RELATIONSHIPS.map((rel) => (
                                <option key={rel} value={rel}>
                                  {rel}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Percentage
                            </label>
                            <div className="relative">
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
                                className={`${inputClasses(false)} pr-12`}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.beneficiaries.length > 0 && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Total Allocation
                          </span>
                          <span
                            className={`font-bold ${
                              Math.abs(
                                formData.beneficiaries.reduce(
                                  (sum, b) => sum + b.percentage,
                                  0
                                ) - 100
                              ) <= 0.01
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formData.beneficiaries
                              .reduce((sum, b) => sum + b.percentage, 0)
                              .toFixed(2)}
                            %
                          </span>
                        </div>
                        {errors.beneficiaries && (
                          <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.beneficiaries}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Final Details */}
            {currentStep === 5 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Final Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add terms, notes, and tags for your policy
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={(e) =>
                      handleInputChange("terms_conditions", e.target.value)
                    }
                    rows={4}
                    className={textareaClasses(false)}
                    placeholder="Enter policy terms and conditions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className={textareaClasses(false)}
                    placeholder="Add any additional notes or comments..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        className={inputClasses(false)}
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Tag className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-blue-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Policy Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Policy Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Policy Name:
                      </span>
                      <span className="font-medium">
                        {formData.policy_name || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Type:
                      </span>
                      <span className="font-medium">
                        {POLICY_TYPES.find(
                          (t) => t.value === formData.policy_type
                        )?.label || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Coverage:
                      </span>
                      <span className="font-medium">
                        {formData.coverage_amount
                          ? formatCurrency(parseFloat(formData.coverage_amount))
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Premium:
                      </span>
                      <span className="font-medium">
                        {formData.premium_amount
                          ? formatCurrency(parseFloat(formData.premium_amount))
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Duration:
                      </span>
                      <span className="font-medium">
                        {formData.effective_date && formData.expiration_date
                          ? `${Math.ceil(
                              (new Date(formData.expiration_date).getTime() -
                                new Date(formData.effective_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days`
                          : "Not set"}
                      </span>
                    </div>
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
            {currentStepConfig && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {currentStepConfig.title}
              </div>
            )}
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              form="policy-form"
              disabled={creating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{creating ? "Creating..." : "Create Policy"}</span>
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                completedSteps.has(step.id)
                  ? "bg-green-500"
                  : currentStep === step.id
                  ? "bg-blue-500 w-6"
                  : step.id < currentStep
                  ? "bg-blue-300"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function CreatePolicyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Loading Policy Form
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Preparing your policy creation experience...
        </p>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function CreatePolicyPage() {
  return (
    <Suspense fallback={<CreatePolicyLoading />}>
      <CreatePolicyForm />
    </Suspense>
  );
}