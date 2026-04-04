// src/hooks/usePolicies.ts
import { useCallback, useState } from "react";

export interface Policy {
  id: string;
  user_id: string;
  client_id: string;
  policy_number: string;
  policy_type: string;
  policy_name: string;
  description?: string;
  coverage_amount: number;
  premium_amount: number;
  deductible: number;
  effective_date: string;
  expiration_date: string;
  renewal_date?: string;
  status: string;
  priority: string;
  terms_conditions?: string;
  policy_document_url?: string;
  beneficiaries?: Array<{ name: string; relationship: string; percentage: number }>;
  riders?: Array<{ name: string; description: string; premium: number }>;
  notes?: string;
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
}

export interface PolicyFormData {
  client_id: string;
  policy_name: string;
  policy_type: string;
  description?: string;
  coverage_amount: number;
  premium_amount: number;
  deductible?: number;
  effective_date: string;
  expiration_date: string;
  renewal_date?: string;
  status: string;
  priority: string;
  terms_conditions?: string;
  beneficiaries?: Array<{ name: string; relationship: string; percentage: number }>;
  riders?: Array<{ name: string; description: string; premium: number }>;
  notes?: string;
  tags?: string[];
}

export interface UsePoliciesReturn {
  policies: Policy[];
  currentPolicy: Policy | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: string | boolean;
  error: string | null;
  fetchPolicies: (page?: number, searchParams?: URLSearchParams) => Promise<void>;
  fetchPolicy: (id: string) => Promise<void>;
  createPolicy: (data: PolicyFormData) => Promise<{ success: boolean; data?: Policy; error?: string }>;
  updatePolicy: (id: string, data: Partial<PolicyFormData>) => Promise<{ success: boolean; data?: Policy; error?: string }>;
  deletePolicy: (id: string) => Promise<boolean>;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearCurrentPolicy: () => void;
}

export function usePolicies(): UsePoliciesReturn {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(
    async (page: number = 1, searchParams?: URLSearchParams) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "10");
        if (searchParams) {
          searchParams.forEach((value, key) => { if (value) params.set(key, value); });
        }
        const response = await fetch(`/api/policies?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch policies");
        }
        const data = await response.json();
        setPolicies(data.data || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 0);
        setCurrentPage(data.pagination?.page || page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setPolicies([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Retries up to 4 times on 404 - handles post-creation timing
  const fetchPolicy = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const attempt = async (retriesLeft: number): Promise<void> => {
      const response = await fetch(`/api/policies/${id}`);

      if (response.status === 404 && retriesLeft > 0) {
        await new Promise((res) => setTimeout(res, 800));
        return attempt(retriesLeft - 1);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch policy");
      }

      const data = await response.json();
      setCurrentPolicy(data.data);
    };

    try {
      await attempt(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setCurrentPolicy(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(
    async (data: PolicyFormData): Promise<{ success: boolean; data?: Policy; error?: string }> => {
      setCreating(true);
      setError(null);
      try {
        const response = await fetch("/api/policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || "Failed to create policy");
        }
        return { success: true, data: responseData.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setCreating(false);
      }
    },
    []
  );

  const updatePolicy = useCallback(
    async (id: string, data: Partial<PolicyFormData>): Promise<{ success: boolean; data?: Policy; error?: string }> => {
      setUpdating(true);
      setError(null);
      try {
        const response = await fetch(`/api/policies/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || "Failed to update policy");
        }
        if (currentPolicy && currentPolicy.id === id) {
          setCurrentPolicy(responseData.data);
        }
        await fetchPolicies(currentPage);
        return { success: true, data: responseData.data };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setUpdating(false);
      }
    },
    [fetchPolicies, currentPage, currentPolicy]
  );

  const deletePolicy = useCallback(
    async (id: string): Promise<boolean> => {
      setDeleting(id);
      setError(null);
      try {
        const response = await fetch(`/api/policies/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete policy");
        }
        if (currentPolicy && currentPolicy.id === id) {
          setCurrentPolicy(null);
        }
        await fetchPolicies(currentPage);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [fetchPolicies, currentPage, currentPolicy]
  );

  const clearError = useCallback(() => setError(null), []);
  const clearCurrentPolicy = useCallback(() => setCurrentPolicy(null), []);
  const setCurrentPageCallback = useCallback((page: number) => setCurrentPage(page), []);

  return {
    policies, currentPolicy,
    currentPage, totalPages, totalCount,
    loading, creating, updating, deleting,
    error,
    fetchPolicies, fetchPolicy, createPolicy, updatePolicy, deletePolicy,
    setCurrentPage: setCurrentPageCallback,
    clearError, clearCurrentPolicy,
  };
}