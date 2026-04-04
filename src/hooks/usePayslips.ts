// hooks/usePayslips.ts
import { useCallback, useState } from "react";

export interface Payslip {
  id: string;
  user_id: string;
  payment_id: string;
  client_id: string;
  policy_id?: string;
  claim_id?: string;
  payslip_number: string;
  template_type: "default" | "modern" | "corporate" | "minimal" | "branded";
  template_data?: any;

  // Payment details
  payment_reference: string;
  payment_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_date: string;

  // Client details
  client_name: string;
  client_email: string;
  client_address?: string;

  // Policy/Claim details
  policy_number?: string;
  policy_name?: string;
  claim_number?: string;

  // Payslip metadata
  status: "draft" | "generated" | "sent" | "downloaded" | "archived";
  pdf_url?: string;
  pdf_generated_at?: string;
  email_sent_at?: string;
  email_sent_to?: string;
  downloaded_at?: string;
  download_count: number;

  // Notes and customization
  description?: string;
  notes?: string;
  custom_fields?: any;

  created_at: string;
  updated_at: string;

  // Relations (populated by joins)
  payment?: {
    id: string;
    payment_reference: string;
    payment_type: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
  };
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    full_name: string;
  };
}

export interface PayslipFormData {
  payment_id: string;
  template_type: "default" | "modern" | "corporate" | "minimal" | "branded";
  description?: string;
  notes?: string;
  custom_fields?: any;
}

export interface PayslipGenerationRequest {
  payment_ids: string[];
  template_type: "default" | "modern" | "corporate" | "minimal" | "branded";
  auto_email?: boolean;
  notes?: string;
}

export interface UsePayslipsReturn {
  // Data
  payslips: Payslip[];
  currentPayslip: Payslip | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;

  // Loading states
  loading: boolean;
  generating: boolean;
  updating: boolean;
  deleting: string | boolean;
  downloading: string | boolean;
  emailing: string | boolean;

  // Error state
  error: string | null;

  // Actions
  fetchPayslips: (
    page?: number,
    searchParams?: URLSearchParams
  ) => Promise<void>;
  fetchPayslip: (id: string) => Promise<void>;
  generatePayslip: (data: PayslipFormData) => Promise<Payslip | null>;
  generateBulkPayslips: (
    data: PayslipGenerationRequest
  ) => Promise<Payslip[] | null>;
  updatePayslip: (
    id: string,
    data: Partial<PayslipFormData>
  ) => Promise<Payslip | null>;
  deletePayslip: (id: string) => Promise<boolean>;
  downloadPayslip: (id: string) => Promise<boolean>;
  emailPayslip: (id: string, email?: string) => Promise<boolean>;
  regeneratePayslip: (id: string) => Promise<Payslip | null>;

  // Pagination actions
  setCurrentPage: (page: number) => void;

  // Utility actions
  clearError: () => void;
  clearCurrentPayslip: () => void;
}

export function usePayslips(): UsePayslipsReturn {
  // State
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [currentPayslip, setCurrentPayslip] = useState<Payslip | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | boolean>(false);
  const [downloading, setDownloading] = useState<string | boolean>(false);
  const [emailing, setEmailing] = useState<string | boolean>(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch payslips
  const fetchPayslips = useCallback(
    async (page: number = 1, searchParams?: URLSearchParams) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "10");

        if (searchParams) {
          searchParams.forEach((value, key) => {
            if (value && value.trim()) {
              params.set(key, value);
            }
          });
        }

        const response = await fetch(
          `/api/payments/payslips?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch payslips");
        }

        const data = await response.json();

        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format");
        }

        setPayslips(Array.isArray(data.data) ? data.data : []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 0);
        setCurrentPage(data.pagination?.page || page);
      } catch (err) {
        console.error("Error fetching payslips:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setPayslips([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch single payslip
  const fetchPayslip = useCallback(async (id: string) => {
    if (!id || typeof id !== "string") {
      setError("Invalid payslip ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/payments/payslips/${encodeURIComponent(id)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch payslip");
      }

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Invalid response format");
      }

      setCurrentPayslip(data.data);
    } catch (err) {
      console.error("Error fetching payslip:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setCurrentPayslip(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate single payslip
  const generatePayslip = useCallback(
    async (data: PayslipFormData): Promise<Payslip | null> => {
      if (!data || typeof data !== "object") {
        setError("Invalid payslip data");
        return null;
      }

      setGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/payments/payslips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate payslip");
        }

        const responseData = await response.json();

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response format");
        }

        // Refresh payslips list
        await fetchPayslips(currentPage);

        return responseData.data;
      } catch (err) {
        console.error("Error generating payslip:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [fetchPayslips, currentPage]
  );

  // Generate bulk payslips
  const generateBulkPayslips = useCallback(
    async (data: PayslipGenerationRequest): Promise<Payslip[] | null> => {
      if (
        !data ||
        typeof data !== "object" ||
        !Array.isArray(data.payment_ids)
      ) {
        setError("Invalid bulk generation data");
        return null;
      }

      setGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/payments/payslips/bulk-generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate payslips");
        }

        const responseData = await response.json();

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response format");
        }

        // Refresh payslips list
        await fetchPayslips(currentPage);

        return responseData.data;
      } catch (err) {
        console.error("Error generating bulk payslips:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [fetchPayslips, currentPage]
  );

  // Update payslip
  const updatePayslip = useCallback(
    async (
      id: string,
      data: Partial<PayslipFormData>
    ): Promise<Payslip | null> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payslip ID");
        return null;
      }

      if (!data || typeof data !== "object") {
        setError("Invalid payslip data");
        return null;
      }

      setUpdating(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/payments/payslips/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update payslip");
        }

        const responseData = await response.json();

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response format");
        }

        // Update current payslip if it's the one being updated
        if (currentPayslip && currentPayslip.id === id) {
          setCurrentPayslip(responseData.data);
        }

        // Update the payslip in the list
        setPayslips((prevPayslips) =>
          prevPayslips.map((payslip) =>
            payslip.id === id ? responseData.data : payslip
          )
        );

        return responseData.data;
      } catch (err) {
        console.error("Error updating payslip:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [currentPayslip]
  );

  // Delete payslip
  const deletePayslip = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payslip ID");
        return false;
      }

      setDeleting(id);
      setError(null);

      try {
        const response = await fetch(
          `/api/payments/payslips/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete payslip");
        }

        // Clear current payslip if it's the one being deleted
        if (currentPayslip && currentPayslip.id === id) {
          setCurrentPayslip(null);
        }

        // Remove from list
        setPayslips((prevPayslips) =>
          prevPayslips.filter((payslip) => payslip.id !== id)
        );

        // Adjust total count
        setTotalCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch (err) {
        console.error("Error deleting payslip:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [currentPayslip]
  );

  // Download payslip
  const downloadPayslip = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payslip ID");
        return false;
      }

      setDownloading(id);
      setError(null);

      try {
        const response = await fetch(
          `/api/payments/payslips/${encodeURIComponent(id)}/download`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to download payslip");
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `payslip-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Update download count in current payslip
        if (currentPayslip && currentPayslip.id === id) {
          setCurrentPayslip({
            ...currentPayslip,
            download_count: currentPayslip.download_count + 1,
            downloaded_at: new Date().toISOString(),
          });
        }

        return true;
      } catch (err) {
        console.error("Error downloading payslip:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      } finally {
        setDownloading(false);
      }
    },
    [currentPayslip]
  );

  // Email payslip
  const emailPayslip = useCallback(
    async (id: string, email?: string): Promise<boolean> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payslip ID");
        return false;
      }

      setEmailing(id);
      setError(null);

      try {
        const response = await fetch(
          `/api/payments/payslips/${encodeURIComponent(id)}/email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to email payslip");
        }

        // Update email status in current payslip
        if (currentPayslip && currentPayslip.id === id) {
          setCurrentPayslip({
            ...currentPayslip,
            email_sent_at: new Date().toISOString(),
            email_sent_to: email || currentPayslip.client_email,
            status: "sent",
          });
        }

        return true;
      } catch (err) {
        console.error("Error emailing payslip:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return false;
      } finally {
        setEmailing(false);
      }
    },
    [currentPayslip]
  );

  // Regenerate payslip
  const regeneratePayslip = useCallback(
    async (id: string): Promise<Payslip | null> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payslip ID");
        return null;
      }

      setGenerating(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/payments/payslips/${encodeURIComponent(id)}/regenerate`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to regenerate payslip");
        }

        const responseData = await response.json();

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response format");
        }

        // Update current payslip
        if (currentPayslip && currentPayslip.id === id) {
          setCurrentPayslip(responseData.data);
        }

        // Update in list
        setPayslips((prevPayslips) =>
          prevPayslips.map((payslip) =>
            payslip.id === id ? responseData.data : payslip
          )
        );

        return responseData.data;
      } catch (err) {
        console.error("Error regenerating payslip:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [currentPayslip]
  );

  // Utility actions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentPayslip = useCallback(() => {
    setCurrentPayslip(null);
  }, []);

  const setCurrentPageCallback = useCallback((page: number) => {
    if (typeof page === "number" && page > 0) {
      setCurrentPage(page);
    }
  }, []);

  return {
    // Data
    payslips,
    currentPayslip,

    // Pagination
    currentPage,
    totalPages,
    totalCount,

    // Loading states
    loading,
    generating,
    updating,
    deleting,
    downloading,
    emailing,

    // Error state
    error,

    // Actions
    fetchPayslips,
    fetchPayslip,
    generatePayslip,
    generateBulkPayslips,
    updatePayslip,
    deletePayslip,
    downloadPayslip,
    emailPayslip,
    regeneratePayslip,

    // Pagination actions
    setCurrentPage: setCurrentPageCallback,

    // Utility actions
    clearError,
    clearCurrentPayslip,
  };
}

// hooks/usePayslipGeneration.ts - Specialized hook for generation workflows
export function usePayslipGeneration() {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [generationSettings, setGenerationSettings] = useState({
    template_type: "default" as const,
    auto_email: false,
    notes: "",
  });

  const togglePaymentSelection = useCallback((paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  }, []);

  const selectAllPayments = useCallback((paymentIds: string[]) => {
    setSelectedPayments(paymentIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPayments([]);
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<typeof generationSettings>) => {
      setGenerationSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const canGenerate = selectedPayments.length > 0;

  return {
    selectedPayments,
    generationSettings,
    canGenerate,
    togglePaymentSelection,
    selectAllPayments,
    clearSelection,
    updateSettings,
  };
}
