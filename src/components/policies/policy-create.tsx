"use client";

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Car,
  CheckCircle,
  DollarSign,
  FileText,
  Heart,
  Home,
  Plus,
  Save,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Move interface declaration to the top and make it properly typed
interface PolicyFormData {
  policyType: string;
  clientId: string;
  clientName: string;
  policyNumber: string;
  coverageAmount: string;
  premium: string;
  deductible: string;
  paymentFrequency: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  terms: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    vin: string;
  };
  propertyInfo: {
    address: string;
    propertyType: string;
    buildingValue: string;
    contentsValue: string;
  };
  lifeInfo: {
    beneficiary: string;
    relationship: string;
    medicalExam: boolean;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface PolicyCreatePageProps {
  isDarkMode?: boolean;
}

const mockClients: Client[] = [
  {
    id: "CLI-001",
    name: "Thabo Mokgadi",
    email: "thabo.mokgadi@email.com",
    phone: "+267 71 234 567",
    address: "123 Main Street, Gaborone",
  },
  {
    id: "CLI-002",
    name: "Lesego Motsepe",
    email: "lesego.motsepe@email.com",
    phone: "+267 72 345 678",
    address: "456 Independence Ave, Francistown",
  },
  {
    id: "CLI-003",
    name: "Kagiso Phiri",
    email: "kagiso.phiri@email.com",
    phone: "+267 73 456 789",
    address: "789 Hospital Way, Maun",
  },
];

const policyTypes = [
  { id: "auto", name: "Auto Insurance", icon: Car, color: "text-blue-600" },
  { id: "home", name: "Home Insurance", icon: Home, color: "text-green-600" },
  { id: "life", name: "Life Insurance", icon: Heart, color: "text-red-600" },
  {
    id: "health",
    name: "Health Insurance",
    icon: Shield,
    color: "text-purple-600",
  },
  {
    id: "business",
    name: "Business Insurance",
    icon: Briefcase,
    color: "text-orange-600",
  },
];

export default function PolicyCreatePage({
  isDarkMode = false,
}: PolicyCreatePageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data - now properly typed with the renamed interface
  const [formData, setFormData] = useState<PolicyFormData>({
    // Step 1: Policy Type & Client
    policyType: "",
    clientId: "",
    clientName: "",

    // Step 2: Policy Details
    policyNumber: "",
    coverageAmount: "",
    premium: "",
    deductible: "",
    paymentFrequency: "monthly",

    // Step 3: Dates & Terms
    startDate: "",
    endDate: "",
    renewalDate: "",
    terms: "",

    // Step 4: Additional Information (varies by type)
    vehicleInfo: {
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      vin: "",
    },
    propertyInfo: {
      address: "",
      propertyType: "",
      buildingValue: "",
      contentsValue: "",
    },
    lifeInfo: {
      beneficiary: "",
      relationship: "",
      medicalExam: false,
    },
  });

  const steps = [
    { id: 1, title: "Policy Type & Client", icon: Shield },
    { id: 2, title: "Policy Details", icon: FileText },
    { id: 3, title: "Dates & Terms", icon: Calendar },
    { id: 4, title: "Additional Information", icon: Plus },
  ];

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const handleInputChange = (field: keyof PolicyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNestedInputChange = (
    section: "vehicleInfo" | "propertyInfo" | "lifeInfo",
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const selectClient = (client: Client) => {
    setFormData((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
    }));
    setShowClientSearch(false);
    setClientSearchQuery("");
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.policyType)
          newErrors.policyType = "Policy type is required";
        if (!formData.clientId)
          newErrors.clientId = "Client selection is required";
        break;
      case 2:
        if (!formData.coverageAmount)
          newErrors.coverageAmount = "Coverage amount is required";
        if (!formData.premium) newErrors.premium = "Premium is required";
        if (!formData.deductible)
          newErrors.deductible = "Deductible is required";
        break;
      case 3:
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        break;
      case 4:
        if (formData.policyType === "auto") {
          if (!formData.vehicleInfo.make)
            newErrors["vehicleInfo.make"] = "Vehicle make is required";
          if (!formData.vehicleInfo.model)
            newErrors["vehicleInfo.model"] = "Vehicle model is required";
          if (!formData.vehicleInfo.year)
            newErrors["vehicleInfo.year"] = "Vehicle year is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real app, make API call here
      console.log("Creating policy:", formData);

      // Redirect to policy list or details
      router.push("/dashboard/policy-management");
    } catch (error) {
      console.error("Error creating policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Policy Type Selection */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Select Policy Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleInputChange("policyType", type.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.policyType === type.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : `border-gray-200 hover:border-gray-300 ${
                              isDarkMode
                                ? "border-gray-700 hover:border-gray-600"
                                : ""
                            }`
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {type.name}
                      </p>
                    </button>
                  );
                })}
              </div>
              {errors.policyType && (
                <p className="mt-1 text-sm text-red-600">{errors.policyType}</p>
              )}
            </div>

            {/* Client Selection */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Select Client *
              </label>
              {formData.clientId ? (
                <div
                  className={`p-4 rounded-lg border ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        } flex items-center justify-center`}
                      >
                        <User
                          className={`w-5 h-5 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formData.clientName}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Client ID: {formData.clientId}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          clientId: "",
                          clientName: "",
                        }));
                        setShowClientSearch(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClientSearch(true)}
                  className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors ${
                    isDarkMode
                      ? "border-gray-700 hover:border-gray-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Plus
                    className={`w-8 h-8 mx-auto mb-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Click to select a client
                  </p>
                </button>
              )}
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                  onChange={(e) =>
                    handleInputChange("policyNumber", e.target.value)
                  }
                  placeholder="Auto-generated if left empty"
                  className={`w-full px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Payment Frequency *
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) =>
                    handleInputChange("paymentFrequency", e.target.value)
                  }
                  className={`w-full px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    value={formData.coverageAmount}
                    onChange={(e) =>
                      handleInputChange("coverageAmount", e.target.value)
                    }
                    placeholder="0"
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors.coverageAmount ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.coverageAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.coverageAmount}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Premium ({formData.paymentFrequency}) *
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
                    onChange={(e) =>
                      handleInputChange("premium", e.target.value)
                    }
                    placeholder="0"
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
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
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors.deductible ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.deductible && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deductible}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
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
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } ${errors.startDate ? "border-red-500" : ""}`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate}
                  </p>
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
                      ? "bg-gray-800 border-gray-700 text-white"
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
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Terms & Conditions
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                rows={4}
                placeholder="Enter any specific terms and conditions for this policy..."
                className={`w-full px-3 py-2 rounded-lg border transition-all resize-none ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
        );

      case 4:
        if (formData.policyType === "auto") {
          return (
            <div className="space-y-6">
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Make *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleInfo.make}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "vehicleInfo",
                        "make",
                        e.target.value
                      )
                    }
                    placeholder="Toyota, BMW, etc."
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors["vehicleInfo.make"] ? "border-red-500" : ""}`}
                  />
                  {errors["vehicleInfo.make"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["vehicleInfo.make"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleInfo.model}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "vehicleInfo",
                        "model",
                        e.target.value
                      )
                    }
                    placeholder="Camry, X3, etc."
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors["vehicleInfo.model"] ? "border-red-500" : ""}`}
                  />
                  {errors["vehicleInfo.model"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["vehicleInfo.model"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.vehicleInfo.year}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "vehicleInfo",
                        "year",
                        e.target.value
                      )
                    }
                    placeholder="2024"
                    min="1900"
                    max="2030"
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors["vehicleInfo.year"] ? "border-red-500" : ""}`}
                  />
                  {errors["vehicleInfo.year"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["vehicleInfo.year"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleInfo.licensePlate}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "vehicleInfo",
                        "licensePlate",
                        e.target.value
                      )
                    }
                    placeholder="B123ABC"
                    className={`w-full px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  VIN (Vehicle Identification Number)
                </label>
                <input
                  type="text"
                  value={formData.vehicleInfo.vin}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "vehicleInfo",
                      "vin",
                      e.target.value
                    )
                  }
                  placeholder="1HGBH41JXMN109186"
                  className={`w-full px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div
                className={`p-8 text-center rounded-lg border-2 border-dashed ${
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                }`}
              >
                <CheckCircle
                  className={`w-12 h-12 mx-auto mb-4 text-green-600`}
                />
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Ready to Create Policy
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  All required information has been collected. Click "Create
                  Policy" to proceed.
                </p>
              </div>
            </div>
          );
        }

      default:
        return null;
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
              Create New Policy
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div
        className={`p-6 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm`}
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-2 ${
                    isActive
                      ? "text-blue-600"
                      : isCompleted
                      ? "text-green-600"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      isCompleted
                        ? "bg-green-600"
                        : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div
        className={`p-6 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm`}
      >
        {renderStepContent()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            currentStep === 1
              ? `opacity-50 cursor-not-allowed ${
                  isDarkMode
                    ? "border-gray-700 text-gray-600"
                    : "border-gray-300 text-gray-400"
                }`
              : `${
                  isDarkMode
                    ? "border-gray-700 hover:bg-gray-800 text-white"
                    : "border-gray-300 hover:bg-gray-50 text-gray-900"
                }`
          }`}
        >
          Previous
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/dashboard/policy-management")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800 text-white"
                : "border-gray-300 hover:bg-gray-50 text-gray-900"
            }`}
          >
            Cancel
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Policy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Client Search Modal */}
      {showClientSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`max-w-md w-full rounded-lg shadow-xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Select Client
                </h3>
                <button
                  onClick={() => setShowClientSearch(false)}
                  className={`p-1 rounded-lg hover:bg-gray-100 ${
                    isDarkMode ? "hover:bg-gray-700" : ""
                  }`}
                >
                  <X
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </button>
              </div>
              <div className="mt-4 relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredClients.length > 0 ? (
                <div className="p-2">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className={`w-full p-3 rounded-lg hover:bg-gray-50 ${
                        isDarkMode ? "hover:bg-gray-700" : ""
                      } text-left transition-colors`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          } flex items-center justify-center`}
                        >
                          <User
                            className={`w-4 h-4 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {client.name}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <User
                    className={`w-12 h-12 mx-auto mb-4 ${
                      isDarkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No clients found
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => router.push("/dashboard/client-management/new")}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                Create New Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
