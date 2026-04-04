// src/hooks/useClaims.ts
import { useCallback, useState } from "react";

export interface Claim {
  id: string;
  user_id: string;
  client_id: string;
  policy_id: string;
  claim_number: string;
  claim_type: string;
  incident_date: string;
  reported_date: string;
  description: string;
  incident_location?: string;
  claim_amount?: number;
  approved_amount?: number;
  settled_amount?: number;
  status: string;
  priority: string;
  assigned_adjuster?: string;
  assigned_investigator?: string;
  investigation_start_date?: string;
  investigation_end_date?: string;
  settlement_date?: string;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    uploaded_date: string;
  }>;
  evidence?: Array<{
    type: string;
    description: string;
    url?: string;
    collected_date: string;
  }>;
  witness_information?: Array<{
    name: string;
    contact: string;
    statement: string;
    relationship: string;
  }>;
  notes?: string;
  internal_notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    full_name: string;
  };
  policy?: {
    id: string;
    policy_number: string;
    policy_name: string;
    policy_type: string;
    coverage_amount: number;
  };
}

export interface ClaimFormData {
  client_id: string;
  policy_id: string;
  claim_type: string;
  incident_date: string;
  reported_date?: string;
  description: string;
  incident_location?: string;
  claim_amount?: number;
  status: string;
  priority: string;
  assigned_adjuster?: string;
  assigned_investigator?: string;
  investigation_start_date?: string;
  investigation_end_date?: string;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    uploaded_date: string;
  }>;
  evidence?: Array<{
    type: string;
    description: string;
    url?: string;
    collected_date: string;
  }>;
  witness_information?: Array<{
    name: string;
    contact: string;
    statement: string;
    relationship: string;
  }>;
  notes?: string;
  internal_notes?: string;
  tags?: string[];
}

export interface ClaimFilters {
  search?: string;
  status?: string;
  claim_type?: string;
  priority?: string;
  assigned_adjuster?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface UseClaimsReturn {
  // Data
  claims: Claim[];
  currentClaim: Claim | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: string | boolean;

  // Error state
  error: string | null;

  // Actions
  fetchClaims: (page?: number, params?: URLSearchParams) => Promise<void>;
  fetchClaim: (id: string) => Promise<void>;
  createClaim: (data: ClaimFormData) => Promise<Claim | null>;
  updateClaim: (
    id: string,
    data: Partial<ClaimFormData>
  ) => Promise<Claim | null>;
  deleteClaim: (id: string) => Promise<boolean>;

  // Pagination actions
  setCurrentPage: (page: number) => void;

  // Utility actions
  clearError: () => void;
  clearCurrentClaim: () => void;
}

export function useClaims(): UseClaimsReturn {
  // State
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentClaim, setCurrentClaim] = useState<Claim | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | boolean>(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(
    async (page: number = 1, searchParams?: URLSearchParams) => {
      setLoading(true);
      setError(null);

      try {
        // Build the final query parameters
        const finalParams = new URLSearchParams();
        finalParams.set("page", page.toString());
        finalParams.set("limit", "10");

        // Merge with provided search params
        if (searchParams) {
          searchParams.forEach((value, key) => {
            if (value && value.trim()) {
              finalParams.set(key, value);
            }
          });
        }

        const response = await fetch(`/api/claims?${finalParams.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch claims");
        }

        const data = await response.json();

        // Better error handling for malformed responses
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format");
        }

        setClaims(Array.isArray(data.data) ? data.data : []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 0);
        setCurrentPage(data.pagination?.page || page);
      } catch (err) {
        console.error("Error fetching claims:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setClaims([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch single claim
  const fetchClaim = useCallback(async (id: string) => {
    if (!id || typeof id !== "string") {
      setError("Invalid claim ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/claims/${encodeURIComponent(id)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch claim");
      }

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Invalid response format");
      }

      setCurrentClaim(data.data);
    } catch (err) {
      console.error("Error fetching claim:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setCurrentClaim(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create claim - **FIXED: Better error handling for duplicate claim numbers**
  const createClaim = useCallback(
    async (data: ClaimFormData): Promise<Claim | null> => {
      if (!data || typeof data !== "object") {
        setError("Invalid claim data");
        return null;
      }

      setCreating(true);
      setError(null);

      try {
        const response = await fetch("/api/claims", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          // Handle duplicate claim number error specifically
          if (
            response.status === 409 &&
            responseData.error?.includes("claim number")
          ) {
            throw new Error(
              "Claim number conflict. Please try submitting again."
            );
          }
          throw new Error(responseData.error || "Failed to create claim");
        }

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response format");
        }

        console.log("Claim created successfully:", responseData.data);
        return responseData.data;
      } catch (err) {
        console.error("Error creating claim:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);

        // If it's a duplicate claim number error, suggest retry
        if (
          errorMessage.includes("claim number") ||
          errorMessage.includes("conflict")
        ) {
          setError(`${errorMessage} Please try submitting again.`);
        }

        return null;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  // Update claim
  const updateClaim = useCallback(
    async (id: string, data: Partial<ClaimFormData>): Promise<Claim | null> => {
      if (!id || typeof id !== "string") {
        setError("Invalid claim ID");
        return null;
      }

      if (!data || typeof data !== "object") {
        setError("Invalid claim data");
        return null;
      }

      setUpdating(true);
      setError(null);

      try {
        const response = await fetch(`/api/claims/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update claim");
        }

        const responseData = await response.json();

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response format");
        }

        // Update current claim if it's the one being updated
        if (currentClaim && currentClaim.id === id) {
          setCurrentClaim(responseData.data);
        }

        // Update the claim in the claims list if it exists
        setClaims((prevClaims) =>
          prevClaims.map((claim) =>
            claim.id === id ? responseData.data : claim
          )
        );

        return responseData.data;
      } catch (err) {
        console.error("Error updating claim:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [currentClaim]
  );

  // Delete claim
  const deleteClaim = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id || typeof id !== "string") {
        setError("Invalid claim ID");
        return false;
      }

      setDeleting(id);
      setError(null);

      try {
        const response = await fetch(`/api/claims/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete claim");
        }

        // Clear current claim if it's the one being deleted
        if (currentClaim && currentClaim.id === id) {
          setCurrentClaim(null);
        }

        // Remove the claim from the claims list
        setClaims((prevClaims) =>
          prevClaims.filter((claim) => claim.id !== id)
        );

        // Adjust total count
        setTotalCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch (err) {
        console.error("Error deleting claim:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [currentClaim]
  );

  // Utility actions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentClaim = useCallback(() => {
    setCurrentClaim(null);
  }, []);

  const setCurrentPageCallback = useCallback((page: number) => {
    if (typeof page === "number" && page > 0) {
      setCurrentPage(page);
    }
  }, []);

  return {
    // Data
    claims,
    currentClaim,

    // Pagination
    currentPage,
    totalPages,
    totalCount,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error state
    error,

    // Actions
    fetchClaims,
    fetchClaim,
    createClaim,
    updateClaim,
    deleteClaim,

    // Pagination actions
    setCurrentPage: setCurrentPageCallback,

    // Utility actions
    clearError,
    clearCurrentClaim,
  };
}
