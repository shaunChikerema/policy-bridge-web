// hooks/useClients.ts
import { useCallback, useEffect, useState } from "react";
import { clientService } from "../lib/supabase/clients";
import {
  ClientFilters,
  ClientFormData,
  ClientSortOptions,
  ClientStats,
  ClientUpdate,
  ClientWithDetails,
} from "../lib/types";

export interface UseClientsReturn {
  // Data
  clients: ClientWithDetails[];
  currentClient: ClientWithDetails | null;
  stats: ClientStats | null;

  // Pagination & Filtering
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: ClientFilters;
  sortOptions: ClientSortOptions;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: string | boolean;

  // Error state
  error: string | null;

  // Actions
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (data: ClientFormData) => Promise<ClientWithDetails | null>;
  updateClient: (
    id: string,
    data: Partial<ClientFormData>
  ) => Promise<ClientWithDetails | null>;
  deleteClient: (id: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;

  // Pagination & Filtering actions
  setPage: (page: number) => void;
  setFilters: (filters: Partial<ClientFilters>) => void;
  setSortOptions: (sort: ClientSortOptions) => void;
  resetFilters: () => void;

  // Utility actions
  clearError: () => void;
  clearCurrentClient: () => void;
}

const DEFAULT_FILTERS: ClientFilters = {
  search: "",
  is_active: "all",
};

const DEFAULT_SORT: ClientSortOptions = {
  field: "created_at",
  direction: "desc",
};

export function useClients(
  initialFilters: ClientFilters = DEFAULT_FILTERS,
  pageSize: number = 10
): UseClientsReturn {
  // State
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [currentClient, setCurrentClient] = useState<ClientWithDetails | null>(
    null
  );
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<ClientFilters>(initialFilters);
  const [sortOptions, setSortOptionsState] =
    useState<ClientSortOptions>(DEFAULT_SORT);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | boolean>(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch clients
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await clientService.getClients(
        filters,
        sortOptions,
        currentPage,
        pageSize
      );

      if (response.error) {
        setError(response.error);
        setClients([]);
        setTotalCount(0);
        setTotalPages(0);
      } else {
        setClients(response.data);
        setTotalCount(response.count);
        setTotalPages(response.total_pages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setClients([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOptions, currentPage, pageSize]);

  // Fetch single client
  const fetchClient = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await clientService.getClient(id);

      if (response.error) {
        setError(response.error);
        setCurrentClient(null);
      } else {
        setCurrentClient(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setCurrentClient(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert form data to insert format
  const formDataToInsert = (formData: ClientFormData) => {
    return {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || undefined,
      address_line1: formData.address_line1 || undefined,
      address_line2: formData.address_line2 || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      postal_code: formData.postal_code || undefined,
      country: formData.country || "BW",
      occupation: formData.occupation || undefined,
      employer: formData.employer || undefined,
      annual_income: formData.annual_income
        ? parseFloat(formData.annual_income)
        : undefined,
      emergency_contact_name: formData.emergency_contact_name || undefined,
      emergency_contact_phone: formData.emergency_contact_phone || undefined,
      emergency_contact_relationship:
        formData.emergency_contact_relationship || undefined,
      notes: formData.notes || undefined,
      tags: formData.tags || [],
      is_active: formData.is_active,
    };
  };

  // Create client
  const createClient = useCallback(
    async (data: ClientFormData): Promise<ClientWithDetails | null> => {
      setCreating(true);
      setError(null);

      try {
        console.log("Creating client with form data:", data);

        const insertData = formDataToInsert(data);
        console.log("Converted insert data:", insertData);

        const response = await clientService.createClient(insertData);
        console.log("Create client service response:", response);

        if (response.error) {
          setError(response.error);
          return null;
        }

        // Refresh the clients list
        await fetchClients();

        return response.data;
      } catch (err) {
        console.error("Error creating client:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setCreating(false);
      }
    },
    [fetchClients]
  );

  // Update client
  const updateClient = useCallback(
    async (
      id: string,
      data: Partial<ClientFormData>
    ): Promise<ClientWithDetails | null> => {
      setUpdating(true);
      setError(null);

      try {
        const updateData: ClientUpdate = {};

        // Only include fields that are provided
        Object.keys(data).forEach((key) => {
          if (data[key as keyof ClientFormData] !== undefined) {
            updateData[key as keyof ClientUpdate] = data[
              key as keyof ClientFormData
            ] as any;
          }
        });

        const response = await clientService.updateClient(id, updateData);

        if (response.error) {
          setError(response.error);
          return null;
        }

        // Update current client if it's the one being updated
        if (currentClient && currentClient.id === id) {
          setCurrentClient(response.data);
        }

        // Refresh the clients list
        await fetchClients();

        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [fetchClients, currentClient]
  );

  // Delete client
  const deleteClient = useCallback(
    async (id: string): Promise<boolean> => {
      setDeleting(id);
      setError(null);

      try {
        const success = await clientService.deleteClient(id);

        if (!success) {
          setError("Failed to delete client");
          return false;
        }

        // Clear current client if it's the one being deleted
        if (currentClient && currentClient.id === id) {
          setCurrentClient(null);
        }

        // Refresh the clients list
        await fetchClients();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [fetchClients, currentClient]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await clientService.getClientStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch client stats:", err);
      // Don't set error for stats failure as it's not critical
    }
  }, []);

  // Pagination & Filtering actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setFilters = useCallback((newFilters: Partial<ClientFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const setSortOptions = useCallback((sort: ClientSortOptions) => {
    setSortOptionsState(sort);
    setCurrentPage(1); // Reset to first page when sort changes
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSortOptionsState(DEFAULT_SORT);
    setCurrentPage(1);
  }, []);

  // Utility actions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentClient = useCallback(() => {
    setCurrentClient(null);
  }, []);

  // Effect to fetch clients when dependencies change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Effect to fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Data
    clients,
    currentClient,
    stats,

    // Pagination & Filtering
    currentPage,
    totalPages,
    totalCount,
    filters,
    sortOptions,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error state
    error,

    // Actions
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    fetchStats,

    // Pagination & Filtering actions
    setPage,
    setFilters,
    setSortOptions,
    resetFilters,

    // Utility actions
    clearError,
    clearCurrentClient,
  };
}
