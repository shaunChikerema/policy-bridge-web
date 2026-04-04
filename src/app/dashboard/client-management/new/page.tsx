//src\app\dashboard\client-management\new\page.tsx
"use client";

import { useClients } from "@/hooks/useClients";
import { ClientFormData, ClientFormErrors } from "@/lib/types";
import {
  cleanClientFormData,
  hasValidationErrors,
  validateClientForm,
} from "@/lib/validation/clients";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const INITIAL_FORM_DATA: ClientFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "BW", // Default to Botswana
  occupation: "",
  employer: "",
  annual_income: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  notes: "",
  tags: [],
  is_active: true,
};

// Steps configuration
const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    subtitle: "Personal details",
    icon: User,
    fields: [
      "first_name",
      "last_name",
      "email",
      "phone",
      "date_of_birth",
      "gender",
    ],
  },
  {
    id: 2,
    title: "Address & Work",
    subtitle: "Location and employment",
    icon: MapPin,
    fields: [
      "address_line1",
      "city",
      "state",
      "country",
      "occupation",
      "employer",
    ],
  },
  {
    id: 3,
    title: "Emergency & Notes",
    subtitle: "Final details",
    icon: Phone,
    fields: [
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relationship",
      "notes",
    ],
  },
];

// Enhanced input styling
const inputClasses = (hasError: boolean) => `
  w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-base
  ${
    hasError
      ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
  }
  text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const selectClasses = (hasError: boolean) => `
  w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-base
  ${
    hasError
      ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
  }
  text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed
`;

export default function NewClientPage() {
  const router = useRouter();
  const { createClient, creating, error } = useClients();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleInputChange = (
    field: keyof ClientFormData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ClientFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate single field on blur
    const cleanData = cleanClientFormData(formData);
    const fieldErrors = validateClientForm(cleanData);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const currentStepConfig = STEPS.find((step) => step.id === currentStep);
    if (!currentStepConfig) return true;

    const cleanData = cleanClientFormData(formData);
    const allErrors = validateClientForm(cleanData);

    // Check if any required fields in current step have errors
    const stepErrors: ClientFormErrors = {};
    currentStepConfig.fields.forEach((field) => {
      if (allErrors[field as keyof ClientFormErrors]) {
        stepErrors[field as keyof ClientFormErrors] =
          allErrors[field as keyof ClientFormErrors];
      }
    });

    // Mark current step fields as touched
    const touchedFields: Record<string, boolean> = { ...touched };
    currentStepConfig.fields.forEach((field) => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return false;
    }

    return true;
  }, [currentStep, formData, touched]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow going to previous steps or next step if current is valid
    if (
      stepNumber < currentStep ||
      (stepNumber === currentStep + 1 && validateCurrentStep())
    ) {
      if (stepNumber === currentStep + 1) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }
      setCurrentStep(stepNumber);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);

    console.log("Form submitted with data:", formData); // Debug log

    // Validate all steps
    const cleanData = cleanClientFormData(formData);
    const validationErrors = validateClientForm(cleanData);

    console.log("Clean data:", cleanData); // Debug log
    console.log("Validation errors:", validationErrors); // Debug log

    if (hasValidationErrors(validationErrors)) {
      console.log("Validation failed"); // Debug log
      setErrors(validationErrors);
      // Mark all fields as touched
      const touchedFields: Record<string, boolean> = {};
      Object.keys(cleanData).forEach((key) => {
        touchedFields[key] = true;
      });
      setTouched(touchedFields);

      // Go to first step with errors
      for (const step of STEPS) {
        if (
          step.fields.some(
            (field) => validationErrors[field as keyof ClientFormErrors]
          )
        ) {
          setCurrentStep(step.id);
          break;
        }
      }
      return;
    }

    setErrors({});
    console.log("Validation passed, creating client..."); // Debug log

    try {
      const newClient = await createClient(cleanData);
      console.log("Create client result:", newClient); // Debug log

      if (newClient) {
        console.log("Client created successfully, showing success message"); // Debug log
        setShowSuccess(true);
        setTimeout(() => {
          console.log("Navigating to client details page"); // Debug log
          router.push(
            `/dashboard/client-management/${newClient.id}?success=Client created successfully`
          );
        }, 2000);
      } else {
        console.log("Client creation returned null"); // Debug log
      }
    } catch (err) {
      console.error("Error creating client:", err);
    }
  };

  const handleCancel = useCallback(() => {
    const hasChanges = Object.keys(formData).some(
      (key) =>
        formData[key as keyof ClientFormData] !==
        INITIAL_FORM_DATA[key as keyof ClientFormData]
    );

    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }

    router.back();
  }, [formData, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        if (currentStep === STEPS.length) {
          const form = document.querySelector("form");
          if (form) {
            form.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            );
          }
        } else {
          if (validateCurrentStep()) {
            setCompletedSteps((prev) => new Set([...prev, currentStep]));
            if (currentStep < STEPS.length) {
              setCurrentStep(currentStep + 1);
            }
          }
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, handleCancel, validateCurrentStep]);

  const currentStepConfig = STEPS.find((step) => step.id === currentStep);
  const progress = (currentStep / STEPS.length) * 100;

  // Success overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Client Created!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Successfully added to your portfolio
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  New Client
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {STEPS.length}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
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
      <div className="px-4 py-6 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible =
              step.id <= currentStep || completedSteps.has(step.id);

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAccessible}
                  className={`flex flex-col items-center space-y-2 transition-all duration-200 ${
                    isAccessible
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
                        : isAccessible
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
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
                    <div className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                      {step.subtitle}
                    </div>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={`h-0.5 transition-all duration-300 ${
                        completedSteps.has(step.id)
                          ? "bg-green-500"
                          : currentStep > step.id
                          ? "bg-blue-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Unable to create client
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <main className="px-4 pb-32">
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Personal Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Let&apos;s start with basic details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      onBlur={() => handleBlur("first_name")}
                      className={inputClasses(
                        Boolean(errors.first_name && touched.first_name)
                      )}
                      placeholder="Enter first name"
                      maxLength={50}
                      autoComplete="given-name"
                      autoFocus
                    />
                    {errors.first_name && touched.first_name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.first_name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      onBlur={() => handleBlur("last_name")}
                      className={inputClasses(
                        Boolean(errors.last_name && touched.last_name)
                      )}
                      placeholder="Enter last name"
                      maxLength={50}
                      autoComplete="family-name"
                    />
                    {errors.last_name && touched.last_name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.last_name}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value.toLowerCase())
                      }
                      onBlur={() => handleBlur("email")}
                      className={`${inputClasses(
                        Boolean(errors.email && touched.email)
                      )} pl-12`}
                      placeholder="Enter email address"
                      maxLength={100}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      onBlur={() => handleBlur("phone")}
                      className={`${inputClasses(
                        Boolean(errors.phone && touched.phone)
                      )} pl-12`}
                      placeholder="+267 7123 4567"
                      maxLength={20}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={(e) =>
                          handleInputChange("date_of_birth", e.target.value)
                        }
                        onBlur={() => handleBlur("date_of_birth")}
                        className={`${inputClasses(
                          Boolean(errors.date_of_birth && touched.date_of_birth)
                        )} pl-12`}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    {errors.date_of_birth && touched.date_of_birth && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.date_of_birth}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      onBlur={() => handleBlur("gender")}
                      className={selectClasses(
                        Boolean(errors.gender && touched.gender)
                      )}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">
                        Prefer not to say
                      </option>
                    </select>
                    {errors.gender && touched.gender && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.gender}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address & Work */}
            {currentStep === 2 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Address & Employment
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Where can we reach you?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={(e) =>
                        handleInputChange("address_line1", e.target.value)
                      }
                      onBlur={() => handleBlur("address_line1")}
                      className={`${inputClasses(
                        Boolean(errors.address_line1 && touched.address_line1)
                      )} pl-12`}
                      placeholder="Enter street address"
                      maxLength={100}
                      autoComplete="address-line1"
                    />
                  </div>
                  {errors.address_line1 && touched.address_line1 && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.address_line1}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      onBlur={() => handleBlur("city")}
                      className={inputClasses(
                        Boolean(errors.city && touched.city)
                      )}
                      placeholder="Enter city"
                      maxLength={50}
                      autoComplete="address-level2"
                    />
                    {errors.city && touched.city && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      State/Region
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      onBlur={() => handleBlur("state")}
                      className={inputClasses(
                        Boolean(errors.state && touched.state)
                      )}
                      placeholder="Enter state/region"
                      maxLength={50}
                      autoComplete="address-level1"
                    />
                    {errors.state && touched.state && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.state}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className={selectClasses(false)}
                    autoComplete="country"
                  >
                    <option value="BW">Botswana</option>
                    <option value="ZA">South Africa</option>
                    <option value="ZW">Zimbabwe</option>
                    <option value="NA">Namibia</option>
                    <option value="ZM">Zambia</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Employment Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Occupation
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="occupation"
                          value={formData.occupation}
                          onChange={(e) =>
                            handleInputChange("occupation", e.target.value)
                          }
                          onBlur={() => handleBlur("occupation")}
                          className={`${inputClasses(
                            Boolean(errors.occupation && touched.occupation)
                          )} pl-12`}
                          placeholder="Enter occupation"
                          maxLength={100}
                          autoComplete="organization-title"
                        />
                      </div>
                      {errors.occupation && touched.occupation && (
                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.occupation}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Employer
                      </label>
                      <input
                        type="text"
                        name="employer"
                        value={formData.employer}
                        onChange={(e) =>
                          handleInputChange("employer", e.target.value)
                        }
                        onBlur={() => handleBlur("employer")}
                        className={inputClasses(
                          Boolean(errors.employer && touched.employer)
                        )}
                        placeholder="Enter employer name"
                        maxLength={100}
                        autoComplete="organization"
                      />
                      {errors.employer && touched.employer && (
                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.employer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Emergency & Notes */}
            {currentStep === 3 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Final Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Almost done! Just a few more details
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Emergency Contact
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) =>
                          handleInputChange(
                            "emergency_contact_name",
                            e.target.value
                          )
                        }
                        onBlur={() => handleBlur("emergency_contact_name")}
                        className={inputClasses(
                          Boolean(
                            errors.emergency_contact_name &&
                              touched.emergency_contact_name
                          )
                        )}
                        placeholder="Enter emergency contact name"
                        maxLength={100}
                      />
                      {errors.emergency_contact_name &&
                        touched.emergency_contact_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.emergency_contact_name}</span>
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                          Contact Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={(e) =>
                              handleInputChange(
                                "emergency_contact_phone",
                                e.target.value
                              )
                            }
                            onBlur={() => handleBlur("emergency_contact_phone")}
                            className={`${inputClasses(
                              Boolean(
                                errors.emergency_contact_phone &&
                                  touched.emergency_contact_phone
                              )
                            )} pl-12`}
                            placeholder="+267 7123 4567"
                            maxLength={20}
                          />
                        </div>
                        {errors.emergency_contact_phone &&
                          touched.emergency_contact_phone && (
                            <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.emergency_contact_phone}</span>
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                          Relationship
                        </label>
                        <input
                          type="text"
                          name="emergency_contact_relationship"
                          value={formData.emergency_contact_relationship}
                          onChange={(e) =>
                            handleInputChange(
                              "emergency_contact_relationship",
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            handleBlur("emergency_contact_relationship")
                          }
                          className={inputClasses(
                            Boolean(
                              errors.emergency_contact_relationship &&
                                touched.emergency_contact_relationship
                            )
                          )}
                          placeholder="e.g., Spouse, Parent"
                          maxLength={50}
                        />
                        {errors.emergency_contact_relationship &&
                          touched.emergency_contact_relationship && (
                            <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>
                                {errors.emergency_contact_relationship}
                              </span>
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      onBlur={() => handleBlur("notes")}
                      rows={4}
                      className={inputClasses(
                        Boolean(errors.notes && touched.notes)
                      )}
                      placeholder="Any additional information about the client..."
                      maxLength={1000}
                    />
                    {errors.notes && touched.notes && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.notes}</span>
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                      {formData.notes.length}/1000 characters
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                          handleInputChange("is_active", e.target.checked)
                        }
                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Client is active
                      </span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-8">
                      Active clients appear in your main client list
                    </p>
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
              disabled={creating}
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
            >
              <Save className="w-5 h-5" />
              <span>{creating ? "Creating..." : "Create Client"}</span>
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
