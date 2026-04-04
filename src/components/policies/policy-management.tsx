"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Policy {
  id: string;
  policyNumber: string;
  clientName: string;
  clientId: string;
  type: "auto" | "home" | "life" | "health" | "business";
  premium: number;
  coverage: number;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string;
  endDate: string;
  renewalDate: string;
  paymentFrequency: "monthly" | "quarterly" | "annually";
  lastPayment: string;
  agent: string;
}

const mockPolicies: Policy[] = [
  {
    id: "1",
    policyNumber: "POL-2024-001",
    clientName: "Thabo Mokgadi",
    clientId: "CLI-001",
    type: "auto",
    premium: 1250,
    coverage: 350000,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    renewalDate: "2025-01-15",
    paymentFrequency: "monthly",
    lastPayment: "2024-12-15",
    agent: "John Smith",
  },
  {
    id: "2",
    policyNumber: "POL-2024-002",
    clientName: "Lesego Motsepe",
    clientId: "CLI-002",
    type: "home",
    premium: 850,
    coverage: 500000,
    status: "active",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    renewalDate: "2025-03-01",
    paymentFrequency: "quarterly",
    lastPayment: "2024-12-01",
    agent: "Sarah Johnson",
  },
  {
    id: "3",
    policyNumber: "POL-2024-003",
    clientName: "Kagiso Phiri",
    clientId: "CLI-003",
    type: "life",
    premium: 2100,
    coverage: 1000000,
    status: "pending",
    startDate: "2024-12-01",
    endDate: "2025-12-01",
    renewalDate: "2025-12-01",
    paymentFrequency: "annually",
    lastPayment: "2024-12-01",
    agent: "Michael Brown",
  },
];

interface PolicyManagementPageProps {
  isDarkMode?: boolean;
}

export default function PolicyManagementPage({
  isDarkMode = false,
}: PolicyManagementPageProps) {
  const router = useRouter();
  const [policies] = useState<Policy[]>(mockPolicies);
  const [filteredPolicies, setFilteredPolicies] =
    useState<Policy[]>(mockPolicies);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let filtered = policies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (policy) =>
          policy.policyNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          policy.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          policy.agent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((policy) => policy.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((policy) => policy.type === typeFilter);
    }

    setFilteredPolicies(filtered);
  }, [policies, searchQuery, statusFilter, typeFilter]);

  const getStatusIcon = (status: Policy["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "expired":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Policy["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "expired":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const getPolicyTypeColor = (type: Policy["type"]) => {
    switch (type) {
      case "auto":
        return "text-blue-600 bg-blue-100";
      case "home":
        return "text-green-600 bg-green-100";
      case "life":
        return "text-purple-600 bg-purple-100";
      case "health":
        return "text-red-600 bg-red-100";
      case "business":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

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

  const handleSelectPolicy = (policyId: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policyId)
        ? prev.filter((id) => id !== policyId)
        : [...prev, policyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPolicies.length === filteredPolicies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(filteredPolicies.map((policy) => policy.id));
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Policy Management
          </h1>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage and track all insurance policies
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""} ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </button>
          <button
            onClick={() => router.push("/dashboard/policy-management/create")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Policy</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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
                Total Policies
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {policies.length}
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
                Active
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {policies.filter((p) => p.status === "active").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
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
                Expiring Soon
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                2
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
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
                Total Premium
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(
                  policies.reduce((sum, p) => sum + p.premium, 0)
                )}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by policy number, client name, or agent..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-all ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-all ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Types</option>
              <option value="auto">Auto</option>
              <option value="home">Home</option>
              <option value="life">Life</option>
              <option value="health">Health</option>
              <option value="business">Business</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter
                className={`w-4 h-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPolicies.length > 0 && (
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-blue-700"
              }`}
            >
              {selectedPolicies.length} policies selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Selected
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Bulk Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policies Table */}
      <div
        className={`rounded-lg border overflow-hidden ${
          isDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPolicies.length === filteredPolicies.length &&
                      filteredPolicies.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Policy
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Client
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Type
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Premium
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Coverage
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`p-3 text-left text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Renewal Date
                </th>
                <th
                  className={`p-3 text-center text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr
                  key={policy.id}
                  className={`border-t ${
                    isDarkMode ? "border-gray-800" : "border-gray-200"
                  } hover:${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedPolicies.includes(policy.id)}
                      onChange={() => handleSelectPolicy(policy.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-3">
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {policy.policyNumber}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Agent: {policy.agent}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/client-management/${policy.clientId}`
                        )
                      }
                      className={`hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {policy.clientName}
                    </button>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPolicyTypeColor(
                        policy.type
                      )}`}
                    >
                      {policy.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <div>
                      <p
                        className={`font-medium ${
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
                  </td>
                  <td className="p-3">
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(policy.coverage)}
                    </p>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        policy.status
                      )}`}
                    >
                      {getStatusIcon(policy.status)}
                      <span className="capitalize">{policy.status}</span>
                    </span>
                  </td>
                  <td className="p-3">
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatDate(policy.renewalDate)}
                    </p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/policy-management/${policy.id}`
                          )
                        }
                        className={`p-1 rounded hover:bg-gray-200 ${
                          isDarkMode ? "hover:bg-gray-700" : ""
                        }`}
                      >
                        <Eye
                          className={`w-4 h-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/policy-management/${policy.id}/edit`
                          )
                        }
                        className={`p-1 rounded hover:bg-gray-200 ${
                          isDarkMode ? "hover:bg-gray-700" : ""
                        }`}
                      >
                        <Edit
                          className={`w-4 h-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        />
                      </button>
                      <button
                        className={`p-1 rounded hover:bg-gray-200 ${
                          isDarkMode ? "hover:bg-gray-700" : ""
                        }`}
                      >
                        <MoreHorizontal
                          className={`w-4 h-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPolicies.length === 0 && (
          <div className="p-8 text-center">
            <Shield
              className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-lg font-medium mb-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No policies found
            </p>
            <p
              className={`text-sm mb-4 ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first policy"}
            </p>
            {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
              <button
                onClick={() =>
                  router.push("/dashboard/policy-management/create")
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Policy
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPolicies.length > 0 && (
        <div className="flex items-center justify-between">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Showing {filteredPolicies.length} of {policies.length} policies
          </p>
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              className={`px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
