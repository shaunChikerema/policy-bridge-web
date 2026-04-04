"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  FileText,
  Plus,
  Receipt,
  Shield,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Policy {
  id: string;
  policyNumber: string;
  clientName: string;
  clientId: string;
  type: "auto" | "home" | "life" | "health" | "business";
  premium: number;
  coverage: number;
  deductible: number;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string;
  endDate: string;
  renewalDate: string;
  paymentFrequency: "monthly" | "quarterly" | "annually";
  lastPayment: string;
  nextPayment: string;
  agent: string;
  agentPhone: string;
  agentEmail: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  beneficiaries?: string[];
  coverageDetails: {
    liability?: number;
    collision?: number;
    comprehensive?: number;
    personalProperty?: number;
    dwelling?: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
  }[];
  claims: {
    id: string;
    claimNumber: string;
    date: string;
    amount: number;
    status: "pending" | "approved" | "denied" | "paid";
    description: string;
  }[];
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    method: string;
    status: "paid" | "pending" | "failed";
  }[];
}

const mockPolicy: Policy = {
  id: "1",
  policyNumber: "POL-2024-001",
  clientName: "Thabo Mokgadi",
  clientId: "CLI-001",
  type: "auto",
  premium: 1250,
  coverage: 350000,
  deductible: 5000,
  status: "active",
  startDate: "2024-01-15",
  endDate: "2025-01-15",
  renewalDate: "2025-01-15",
  paymentFrequency: "monthly",
  lastPayment: "2024-12-15",
  nextPayment: "2025-01-15",
  agent: "John Smith",
  agentPhone: "+267 71 123 456",
  agentEmail: "john.smith@insurance.com",
  clientPhone: "+267 72 987 654",
  clientEmail: "thabo.mokgadi@email.com",
  clientAddress: "123 Independence Ave, Gaborone, Botswana",
  beneficiaries: ["Neo Mokgadi", "Lebo Mokgadi"],
  coverageDetails: {
    liability: 100000,
    collision: 150000,
    comprehensive: 100000,
  },
  documents: [
    {
      id: "1",
      name: "Policy Agreement.pdf",
      type: "PDF",
      uploadDate: "2024-01-15",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "Vehicle Registration.pdf",
      type: "PDF",
      uploadDate: "2024-01-15",
      size: "1.2 MB",
    },
  ],
  claims: [
    {
      id: "1",
      claimNumber: "CLM-2024-001",
      date: "2024-08-15",
      amount: 15000,
      status: "paid",
      description: "Minor collision repair",
    },
  ],
  paymentHistory: [
    {
      id: "1",
      date: "2024-12-15",
      amount: 1250,
      method: "Bank Transfer",
      status: "paid",
    },
    {
      id: "2",
      date: "2024-11-15",
      amount: 1250,
      method: "Bank Transfer",
      status: "paid",
    },
  ],
};

interface PolicyDetailsPageProps {
  policyId?: string;
  isDarkMode?: boolean;
}

export default function PolicyDetailsPage({
  policyId,
  isDarkMode = false,
}: PolicyDetailsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [policy] = useState<Policy>(mockPolicy);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency: "BWP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5" />;
      case "expired":
        return <Clock className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      case "pending":
        return <AlertTriangle className="w-5 h-5" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "denied":
        return <XCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "expired":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "paid":
        return "text-green-600 bg-green-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "denied":
        return "text-red-600 bg-red-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "coverage", label: "Coverage Details" },
    { id: "claims", label: "Claims History" },
    { id: "payments", label: "Payment History" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <ArrowLeft
              className={`w-4 h-4 ${
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
              {policy.policyNumber}
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Policy Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Download
              className={`w-4 h-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </button>
          <button
            onClick={() =>
              router.push(`/dashboard/policy-management/${policy.id}/edit`)
            }
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Policy</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg border-l-4 ${
          policy.status === "active"
            ? "border-green-500 bg-green-50"
            : policy.status === "expired"
            ? "border-red-500 bg-red-50"
            : policy.status === "cancelled"
            ? "border-gray-500 bg-gray-50"
            : "border-yellow-500 bg-yellow-50"
        }`}
      >
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              policy.status
            )}`}
          >
            {getStatusIcon(policy.status)}
            <span className="capitalize">{policy.status}</span>
          </span>
          <span
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {policy.status === "active" &&
              `Renews on ${formatDate(policy.renewalDate)}`}
            {policy.status === "expired" &&
              `Expired on ${formatDate(policy.endDate)}`}
            {policy.status === "pending" && "Awaiting approval"}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Premium
              </p>
              <p
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(policy.premium)}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {policy.paymentFrequency}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Coverage
              </p>
              <p
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(policy.coverage)}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Deductible
              </p>
              <p
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(policy.deductible)}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Claims
              </p>
              <p
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {policy.claims.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`rounded-lg border ${
          isDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : `border-transparent ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      }`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Policy Information */}
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Policy Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Policy Type
                      </label>
                      <p
                        className={`capitalize ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {policy.type} Insurance
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Start Date
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(policy.startDate)}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        End Date
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(policy.endDate)}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Next Payment
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(policy.nextPayment)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Client Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Name
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {policy.clientName}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Phone
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {policy.clientPhone}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Email
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {policy.clientEmail}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Address
                      </label>
                      <p
                        className={`${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {policy.clientAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Information */}
              <div>
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Agent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Name
                    </label>
                    <p
                      className={`${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {policy.agent}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Phone
                    </label>
                    <p
                      className={`${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {policy.agentPhone}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Email
                    </label>
                    <p
                      className={`${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {policy.agentEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "coverage" && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Coverage Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(policy.coverageDetails).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <h4
                          className={`font-medium capitalize mb-2 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <p
                          className={`text-xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(value || 0)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {policy.beneficiaries && (
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Beneficiaries
                  </h3>
                  <div className="space-y-2">
                    {policy.beneficiaries.map((beneficiary, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <p
                          className={`${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {beneficiary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "claims" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Claims History
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Claim</span>
                </button>
              </div>

              {policy.claims.length > 0 ? (
                <div className="space-y-3">
                  {policy.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {claim.claimNumber}
                          </h4>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {claim.description}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {formatDate(claim.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {formatCurrency(claim.amount)}
                          </p>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              claim.status
                            )}`}
                          >
                            {getStatusIcon(claim.status)}
                            <span className="capitalize">{claim.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText
                    className={`w-12 h-12 mx-auto mb-4 ${
                      isDarkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-lg font-medium mb-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No claims filed
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    This policy has no claim history
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-4">
              <h3
                className={`text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Payment History
              </h3>

              <div className="space-y-3">
                {policy.paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatDate(payment.date)}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {payment.method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(payment.amount)}
                        </p>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Documents
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {policy.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText
                        className={`w-8 h-8 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {doc.name}
                        </h4>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {doc.type} • {doc.size} • {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                      <button
                        className={`p-2 rounded hover:bg-gray-100 ${
                          isDarkMode ? "hover:bg-gray-700" : ""
                        }`}
                      >
                        <Download
                          className={`w-4 h-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
