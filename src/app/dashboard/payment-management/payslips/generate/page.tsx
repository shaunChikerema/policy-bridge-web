// src/app/dashboard/payment-management/payslips/generate/page.tsx
"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  Loader2,
  Search,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePayments } from "../../../../../hooks/usePayments";

interface Payment {
  id: string;
  payment_reference: string;
  client?: {
    full_name: string;
    email: string;
  };
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  payment_date?: string;
  created_at: string;
  description?: string;
  payslip_generated?: boolean;
}

interface PaymentSelectionProps {
  payments: Payment[];
  selectedPayments: string[];
  onTogglePayment: (paymentId: string) => void;
  onSelectAll: (paymentIds: string[]) => void;
  onClearAll: () => void;
  loading: boolean;
}

interface GenerationSettings {
  template_type: "default" | "modern" | "corporate" | "minimal" | "branded";
  auto_email: boolean;
  notes: string;
  include_payment_details: boolean;
  include_company_logo: boolean;
}

interface FilterState {
  search: string;
  status: string;
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Enhanced Payment Selection Component
function PaymentSelection({
  payments,
  selectedPayments,
  onTogglePayment,
  onSelectAll,
  onClearAll,
  loading,
}: PaymentSelectionProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    type: "all",
    dateRange: { start: "", end: "" },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "client">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredAndSortedPayments = useMemo(() => {
    const filtered = payments.filter((payment) => {
      const matchesSearch =
        payment.payment_reference
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        payment.client?.full_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        payment.description
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" || payment.status === filters.status;
      const matchesType =
        filters.type === "all" || payment.payment_type === filters.type;

      const matchesDateRange = (() => {
        if (!filters.dateRange.start && !filters.dateRange.end) return true;
        const paymentDate = new Date(
          payment.payment_date || payment.created_at
        );
        const startDate = filters.dateRange.start
          ? new Date(filters.dateRange.start)
          : null;
        const endDate = filters.dateRange.end
          ? new Date(filters.dateRange.end)
          : null;

        if (startDate && paymentDate < startDate) return false;
        if (endDate && paymentDate > endDate) return false;
        return true;
      })();

      const hasNoPayslip = !payment.payslip_generated;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesDateRange &&
        hasNoPayslip
      );
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.payment_date || a.created_at).getTime() -
            new Date(b.payment_date || b.created_at).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "client":
          comparison = (a.client?.full_name || "").localeCompare(
            b.client?.full_name || ""
          );
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [payments, filters, sortBy, sortOrder]);

  const allFilteredIds = filteredAndSortedPayments.map((p) => p.id);
  const isAllSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedPayments.includes(id));

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      type: "all",
      dateRange: { start: "", end: "" },
    });
  };

  const totalAmount = filteredAndSortedPayments
    .filter((p) => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Select Payments
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedPayments.length} of {filteredAndSortedPayments.length}{" "}
              selected
            </span>
            {selectedPayments.length > 0 && (
              <span className="text-sm font-medium text-blue-600">
                Total: BWP {totalAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Search and Quick Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, client, or description..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
              showFilters
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="premium">Premium</option>
                <option value="claim_settlement">Claim Settlement</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>

              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Start date"
              />

              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="End date"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="client">Client</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Selection Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onSelectAll(allFilteredIds)}
              disabled={loading || isAllSelected}
              className="px-3 py-2 border border-gray-300 bg-transparent text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Select All ({filteredAndSortedPayments.length})
            </button>
            <button
              onClick={onClearAll}
              disabled={loading || selectedPayments.length === 0}
              className="px-3 py-2 border border-gray-300 bg-transparent text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Clear All
            </button>
          </div>
          {filteredAndSortedPayments.length !== payments.length && (
            <span className="text-sm text-gray-500">
              Showing {filteredAndSortedPayments.length} of {payments.length}{" "}
              payments
            </span>
          )}
        </div>
      </div>

      {/* Payment List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : filteredAndSortedPayments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No eligible payments found</p>
            <p className="text-sm text-gray-400">
              Only payments without existing payslips can be selected
            </p>
            {filters.search ||
            filters.status !== "all" ||
            filters.type !== "all" ? (
              <button
                onClick={resetFilters}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters to see all payments
              </button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedPayments.map((payment) => (
              <div
                key={payment.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPayments.includes(payment.id)
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => onTogglePayment(payment.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.id)}
                    onChange={() => onTogglePayment(payment.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {payment.payment_reference}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {payment.client?.full_name || "Unknown Client"}
                        </p>
                      </div>

                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">
                          {payment.currency || "BWP"}{" "}
                          {payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {payment.payment_type?.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(
                            payment.payment_date || payment.created_at
                          ).toLocaleDateString()}
                        </span>
                        {payment.description && (
                          <span className="truncate max-w-xs">
                            {payment.description}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : payment.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Generation Settings Component
function GenerationSettings({
  settings,
  onUpdateSettings,
}: {
  settings: GenerationSettings;
  onUpdateSettings: (updates: Partial<GenerationSettings>) => void;
}) {
  const templates = [
    {
      value: "default",
      label: "Default Template",
      description: "Standard professional layout",
    },
    {
      value: "modern",
      label: "Modern Template",
      description: "Clean, contemporary design",
    },
    {
      value: "corporate",
      label: "Corporate Template",
      description: "Formal business style",
    },
    {
      value: "minimal",
      label: "Minimal Template",
      description: "Simple, distraction-free",
    },
    {
      value: "branded",
      label: "Branded Template",
      description: "Company branded design",
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Generation Settings
          </h2>
        </div>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Template Type
            </label>
            <div className="space-y-2">
              {templates.map((template) => (
                <label
                  key={template.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.template_type === template.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="template_type"
                    value={template.value}
                    checked={settings.template_type === template.value}
                    onChange={(e) =>
                      onUpdateSettings({
                        template_type: e.target
                          .value as GenerationSettings["template_type"],
                      })
                    }
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {template.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Options</h3>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={settings.auto_email}
                onChange={(e) =>
                  onUpdateSettings({ auto_email: e.target.checked })
                }
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Automatically email payslips to clients
                </p>
                <p className="text-xs text-gray-500">
                  Send generated payslips directly to client email addresses
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={settings.include_payment_details}
                onChange={(e) =>
                  onUpdateSettings({
                    include_payment_details: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Include detailed payment information
                </p>
                <p className="text-xs text-gray-500">
                  Show payment method, transaction ID, and other details
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={settings.include_company_logo}
                onChange={(e) =>
                  onUpdateSettings({ include_company_logo: e.target.checked })
                }
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Include company logo
                </p>
                <p className="text-xs text-gray-500">
                  Add your company logo to the payslip header
                </p>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={settings.notes}
              onChange={(e) => onUpdateSettings({ notes: e.target.value })}
              placeholder="Add any notes to include in the payslips..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function GeneratePayslipsPage() {
  const router = useRouter();
  const { payments, loading: paymentsLoading, fetchPayments } = usePayments();

  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationSettings, setGenerationSettings] =
    useState<GenerationSettings>({
      template_type: "default",
      auto_email: false,
      notes: "",
      include_payment_details: true,
      include_company_logo: true,
    });
  const [generationResults, setGenerationResults] = useState<{
    success: number;
    failed: number;
    payslips: any[];
  } | null>(null);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const selectAllPayments = (paymentIds: string[]) => {
    setSelectedPayments(paymentIds);
  };

  const clearSelection = () => {
    setSelectedPayments([]);
  };

  const updateSettings = (updates: Partial<GenerationSettings>) => {
    setGenerationSettings((prev) => ({ ...prev, ...updates }));
  };

  const canGenerate = selectedPayments.length > 0 && !generating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/payslips/bulk-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_ids: selectedPayments,
          template_type: generationSettings.template_type,
          auto_email: generationSettings.auto_email,
          notes: generationSettings.notes,
          include_payment_details: generationSettings.include_payment_details,
          include_company_logo: generationSettings.include_company_logo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate payslips");
      }

      setGenerationResults({
        success: data.data?.length || 0,
        failed: selectedPayments.length - (data.data?.length || 0),
        payslips: data.data || [],
      });

      clearSelection();
      await fetchPayments(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPayslips = () => {
    router.push("/dashboard/payment-management/payslips");
  };

  const selectedPaymentObjects = payments.filter((p) =>
    selectedPayments.includes(p.id)
  );
  const totalAmount = selectedPaymentObjects.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Generate Payslips
              </h1>
              <p className="mt-1 text-gray-600">
                Select payments and generate professional payslips in bulk
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleViewPayslips}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Existing Payslips</span>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Generation Error
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {generationResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800">
                  Payslip Generation Complete!
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Successfully generated {generationResults.success} payslips
                  {generationResults.failed > 0 &&
                    ` (${generationResults.failed} failed)`}
                  {generationSettings.auto_email && " and sent via email"}
                </p>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={handleViewPayslips}
                    className="text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                  >
                    View Generated Payslips
                  </button>
                  <button
                    onClick={() => setGenerationResults(null)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Pro tip:</strong> Only payments without existing
                payslips can be selected. Use the filters to find specific
                payments or date ranges quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Payment Selection - Takes up 3 columns */}
          <div className="xl:col-span-3">
            <PaymentSelection
              payments={payments}
              selectedPayments={selectedPayments}
              onTogglePayment={togglePaymentSelection}
              onSelectAll={selectAllPayments}
              onClearAll={clearSelection}
              loading={paymentsLoading}
            />
          </div>

          {/* Settings and Summary - Takes up 1 column */}
          <div className="space-y-6">
            <GenerationSettings
              settings={generationSettings}
              onUpdateSettings={updateSettings}
            />

            {/* Generation Summary */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generation Summary
                  </h3>
                </div>

                {selectedPayments.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Select payments to see generation summary
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedPayments.length}
                        </p>
                        <p className="text-xs text-blue-800">Payslips</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          BWP {totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-800">Total Amount</p>
                      </div>
                    </div>

                    {/* Settings Preview */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Template:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {generationSettings.template_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto Email:</span>
                        <span className="font-medium text-gray-900">
                          {generationSettings.auto_email ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Details:</span>
                        <span className="font-medium text-gray-900">
                          {generationSettings.include_payment_details
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Logo:</span>
                        <span className="font-medium text-gray-900">
                          {generationSettings.include_company_logo
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </div>

                    {/* Selected Payments Preview */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Selected Payments:
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedPaymentObjects.slice(0, 5).map((payment) => (
                          <div
                            key={payment.id}
                            className="flex justify-between text-xs text-gray-600"
                          >
                            <span className="truncate">
                              {payment.payment_reference}
                            </span>
                            <span>
                              {payment.currency}{" "}
                              {payment.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {selectedPaymentObjects.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{selectedPaymentObjects.length - 5} more...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate {selectedPayments.length} Payslip
                        {selectedPayments.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>

                  {selectedPayments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          /* Preview functionality */
                        }}
                        disabled={generating}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 flex items-center justify-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={clearSelection}
                        disabled={generating}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    {selectedPayments.length === 0
                      ? "Select payments to begin generation"
                      : `Ready to generate ${
                          selectedPayments.length
                        } professional payslip${
                          selectedPayments.length !== 1 ? "s" : ""
                        }`}
                  </p>
                </div>

                {/* Quick Stats */}
                {selectedPayments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-gray-500">Avg Amount</p>
                        <p className="font-medium">
                          BWP{" "}
                          {Math.round(
                            totalAmount / selectedPayments.length
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Est. Time</p>
                        <p className="font-medium">
                          {Math.ceil(selectedPayments.length / 10)} min
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {!generating && (
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      router.push("/dashboard/payment-management/payslips")
                    }
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View All Payslips
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/payment-management")}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Management
                  </button>
                  <button
                    onClick={() =>
                      router.push("/dashboard/payment-management/create")
                    }
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Create New Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
