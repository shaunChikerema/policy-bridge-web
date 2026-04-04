"use client";

import {
  AlertCircle,
  Clock,
  FileText,
  Filter,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface SearchResult {
  id: string;
  type: "client" | "policy" | "claim";
  title: string;
  subtitle: string;
  description: string;
  metadata: Record<string, string>;
  href: string;
  status?:
    | "active"
    | "inactive"
    | "pending"
    | "expired"
    | "approved"
    | "denied";
  priority?: "low" | "medium" | "high";
  lastUpdated: string;
}

interface SearchFilters {
  type: "all" | "client" | "policy" | "claim";
  status: "all" | "active" | "inactive" | "pending" | "expired";
  dateRange: "all" | "week" | "month" | "year";
}

// ============================================================================
// MOCK DATA - Replace with real API calls
// ============================================================================

const mockSearchResults: SearchResult[] = [
  {
    id: "client-1",
    type: "client",
    title: "Sarah Johnson",
    subtitle: "Personal Insurance",
    description: "Individual client with auto and home insurance policies",
    metadata: {
      Phone: "+1 (555) 123-4567",
      Email: "sarah.johnson@email.com",
      Policies: "3 Active",
    },
    href: "/dashboard/client-management/client-1",
    status: "active",
    lastUpdated: "2024-01-15",
  },
  {
    id: "policy-1",
    type: "policy",
    title: "Auto Insurance - PL-2024-001",
    subtitle: "Sarah Johnson",
    description: "Comprehensive auto insurance coverage",
    metadata: {
      Premium: "$1,200/year",
      Coverage: "$100,000",
      Expires: "2024-12-15",
    },
    href: "/dashboard/policy-management/policy-1",
    status: "active",
    lastUpdated: "2024-01-10",
  },
  {
    id: "claim-1",
    type: "claim",
    title: "Auto Accident - CL-2024-045",
    subtitle: "Policy: PL-2024-001",
    description: "Minor collision damage claim",
    metadata: {
      Amount: "$2,500",
      Date: "2024-01-12",
      Adjuster: "Mike Wilson",
    },
    href: "/dashboard/claims-management/claim-1",
    status: "pending",
    priority: "medium",
    lastUpdated: "2024-01-12",
  },
  {
    id: "client-2",
    type: "client",
    title: "TechCorp Solutions",
    subtitle: "Business Insurance",
    description: "Commercial client with liability and property coverage",
    metadata: {
      Contact: "John Smith",
      Phone: "+1 (555) 987-6543",
      Policies: "5 Active",
    },
    href: "/dashboard/client-management/client-2",
    status: "active",
    lastUpdated: "2024-01-08",
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getResultIcon(type: SearchResult["type"]) {
  switch (type) {
    case "client":
      return Users;
    case "policy":
      return Shield;
    case "claim":
      return FileText;
    default:
      return FileText;
  }
}

function getStatusColor(status?: SearchResult["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "expired":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
  }
}

function getPriorityColor(priority?: SearchResult["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

// ============================================================================
// SEARCH PAGE COMPONENT
// ============================================================================

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

// Skeleton loading component
function SearchPageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded-md w-32"></div>
        <div className="h-4 bg-gray-200 rounded-md w-64"></div>
      </div>

      {/* Search Input Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-12 bg-gray-100 rounded-lg"></div>
      </div>

      {/* Results Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-100 rounded-md w-48"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded-md w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial query from URL
  const initialQuery = searchParams.get("q") || "";

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    status: "all",
    dateRange: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================

  const performSearch = useCallback(
    async (query: string, currentFilters: SearchFilters) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Filter mock results based on query and filters
        let filteredResults = mockSearchResults.filter((result) => {
          const matchesQuery =
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.subtitle.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase()) ||
            Object.values(result.metadata).some((value) =>
              value.toLowerCase().includes(query.toLowerCase())
            );

          const matchesType =
            currentFilters.type === "all" ||
            result.type === currentFilters.type;
          const matchesStatus =
            currentFilters.status === "all" ||
            result.status === currentFilters.status;

          return matchesQuery && matchesType && matchesStatus;
        });

        // Sort by relevance (mock implementation)
        filteredResults = filteredResults.sort((a, b) => {
          const aScore = a.title.toLowerCase().includes(query.toLowerCase())
            ? 2
            : 1;
          const bScore = b.title.toLowerCase().includes(query.toLowerCase())
            ? 2
            : 1;
          return bScore - aScore;
        });

        setResults(filteredResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Perform search when query or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, performSearch]);

  // Update URL when search query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    const newUrl = params.toString()
      ? `/dashboard/search?${params.toString()}`
      : "/dashboard/search";

    router.replace(newUrl, { scroll: false });
  }, [searchQuery, router]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setResults([]);
    setFilters({
      type: "all",
      status: "all",
      dateRange: "all",
    });
  }, []);

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      router.push(result.href);
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasActiveFilters = useMemo(() => {
    return (
      filters.type !== "all" ||
      filters.status !== "all" ||
      filters.dateRange !== "all"
    );
  }, [filters]);

  const resultStats = useMemo(() => {
    const stats = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: results.length,
      clients: stats.client || 0,
      policies: stats.policy || 0,
      claims: stats.claim || 0,
    };
  }, [results]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Search
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Search across clients, policies, and claims
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, policies, claims..."
              className="w-full pl-9 md:pl-11 pr-10 md:pr-12 py-2 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm md:text-base"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                type="button"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 md:px-4 py-2 md:py-3 rounded-lg border transition-colors text-sm md:text-base ${
              hasActiveFilters || showFilters
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            type="button"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base"
                >
                  <option value="all">All Types</option>
                  <option value="client">Clients</option>
                  <option value="policy">Policies</option>
                  <option value="claim">Claims</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Results Header */}
        {searchQuery && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                  {isSearching
                    ? "Searching..."
                    : `Results for "${searchQuery}"`}
                </h2>
                {!isSearching && (
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Found {resultStats.total} results
                    {resultStats.total > 0 && (
                      <span className="ml-1 md:ml-2">
                        ({resultStats.clients} clients, {resultStats.policies}{" "}
                        policies, {resultStats.claims} claims)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {isSearching && (
                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {!searchQuery && (
            <div className="px-4 md:px-6 py-8 md:py-12 text-center">
              <Search className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">
                Start searching
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Enter keywords to search across clients, policies, and claims
              </p>
            </div>
          )}

          {searchQuery && !isSearching && results.length === 0 && (
            <div className="px-4 md:px-6 py-8 md:py-12 text-center">
              <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">
                No results found
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

          {results.map((result) => {
            const Icon = getResultIcon(result.type);

            return (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {result.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize hidden sm:inline">
                        {result.type}
                      </span>
                      {result.status && (
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                            result.status
                          )}`}
                        >
                          {result.status}
                        </span>
                      )}
                      {result.priority && (
                        <div
                          className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${getPriorityColor(
                            result.priority
                          )}`}
                        />
                      )}
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2 line-clamp-1">
                      {result.subtitle}
                    </p>

                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3 line-clamp-2">
                      {result.description}
                    </p>

                    <div className="flex flex-wrap gap-2 md:gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {Object.entries(result.metadata)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <span key={key} className="flex items-center">
                            <span className="font-medium hidden sm:inline">
                              {key}:
                            </span>
                            <span className="sm:ml-1">{value}</span>
                          </span>
                        ))}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">Updated</span>
                        <span>{result.lastUpdated}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
