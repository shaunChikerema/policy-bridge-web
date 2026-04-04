// hooks/usePayments.ts - COMPLETE FIXED VERSION
import { useCallback, useState } from "react";

export interface Payment {
  id: string;
  user_id: string;
  client_id: string;
  policy_id?: string;
  claim_id?: string;
  payment_reference: string;
  payment_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_details: any;
  status: string;
  due_date?: string;
  payment_date?: string;
  processed_date?: string;
  transaction_id?: string;
  external_reference?: string;
  gateway_response?: any;
  description?: string;
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
  policy?: {
    id: string;
    policy_number: string;
    policy_name: string;
    policy_type: string;
    coverage_amount: number;
  };
  claim?: {
    id: string;
    claim_number: string;
    claim_type: string;
    status: string;
  };
}

export interface PaymentFormData {
  client_id: string;
  policy_id?: string;
  claim_id?: string;
  payment_type: string;
  amount: string | number;
  currency: string;
  payment_method: string;
  payment_details: any;
  due_date?: string;
  payment_date?: string;
  transaction_id?: string;
  external_reference?: string;
  description?: string;
  notes?: string;
  tags?: string[];
}

export interface UsePaymentsReturn {
  // Data
  payments: Payment[];
  currentPayment: Payment | null;

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
  fetchPayments: (
    page?: number,
    searchParams?: URLSearchParams
  ) => Promise<void>;
  fetchPayment: (id: string) => Promise<void>;
  createPayment: (data: PaymentFormData) => Promise<Payment | null>;
  updatePayment: (
    id: string,
    data: Partial<PaymentFormData>
  ) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
  generatePayslip: (paymentId: string) => Promise<any>;

  // Pagination actions
  setCurrentPage: (page: number) => void;

  // Utility actions
  clearError: () => void;
  clearCurrentPayment: () => void;
}

export function usePayments(): UsePaymentsReturn {
  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
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

  // Fetch payments
  const fetchPayments = useCallback(
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

        const response = await fetch(`/api/payments?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        // Enhanced response structure validation
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response format");
        }

        // Handle different response structures
        const paymentsData = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.payments)
          ? data.payments
          : Array.isArray(data)
          ? data
          : [];

        setPayments(paymentsData);

        // Enhanced pagination handling
        setTotalCount(
          data.pagination?.total ||
            data.totalCount ||
            data.total ||
            paymentsData.length
        );
        setTotalPages(
          data.pagination?.totalPages ||
            data.totalPages ||
            Math.ceil(
              (data.pagination?.total ||
                data.totalCount ||
                paymentsData.length) / 10
            )
        );
        setCurrentPage(data.pagination?.page || data.currentPage || page);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch payments"
        );
        setPayments([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch single payment - FIXED VERSION
  const fetchPayment = useCallback(async (id: string) => {
    if (!id || typeof id !== "string") {
      setError("Invalid payment ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching payment with ID:", id);
      const response = await fetch(`/api/payments/${encodeURIComponent(id)}`);

      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Payment not found");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("📦 API Response data:", data);

      // FIXED: Handle multiple response structures
      let paymentData;
      
      if (data && data.data) {
        // Case 1: { data: payment }
        paymentData = data.data;
      } else if (data && data.payment) {
        // Case 2: { payment: payment }
        paymentData = data.payment;
      } else if (data && data.id) {
        // Case 3: direct payment object
        paymentData = data;
      } else {
        console.error("❌ No valid payment data found in response:", data);
        throw new Error("Invalid response format - no payment data found");
      }

      console.log("✅ Extracted payment data:", paymentData);
      
      if (!paymentData.id) {
        console.error("❌ Payment data missing ID:", paymentData);
        throw new Error("Invalid payment data - missing ID");
      }

      setCurrentPayment(paymentData);
      console.log("✅ Payment set successfully");
      
    } catch (err) {
      console.error("❌ Error fetching payment:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch payment");
      setCurrentPayment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create payment - Enhanced with better validation
  const createPayment = useCallback(
    async (data: PaymentFormData): Promise<Payment | null> => {
      if (!data || typeof data !== "object") {
        setError("Invalid payment data");
        return null;
      }

      setCreating(true);
      setError(null);

      try {
        // Convert string amount to number for API
        const apiData = {
          ...data,
          amount:
            typeof data.amount === "string"
              ? parseFloat(data.amount)
              : data.amount,
        };

        // Enhanced amount validation
        if (isNaN(apiData.amount) || apiData.amount <= 0) {
          throw new Error("Amount must be a positive number");
        }

        const response = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const responseData = await response.json();

        // FIXED: Handle multiple response structures for creation too
        const createdPayment = responseData.data || responseData.payment || responseData;
        
        if (!createdPayment) {
          throw new Error("Invalid response format");
        }

        return createdPayment;
      } catch (err) {
        console.error("Error creating payment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create payment"
        );
        return null;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  // Update payment - Enhanced with better error handling
  const updatePayment = useCallback(
    async (
      id: string,
      data: Partial<PaymentFormData>
    ): Promise<Payment | null> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payment ID");
        return null;
      }

      if (!data || typeof data !== "object") {
        setError("Invalid payment data");
        return null;
      }

      setUpdating(true);
      setError(null);

      try {
        // Convert string amount to number for API if provided
        const apiData = { ...data };
        if (apiData.amount !== undefined) {
          apiData.amount =
            typeof apiData.amount === "string"
              ? parseFloat(apiData.amount)
              : apiData.amount;

          // Enhanced amount validation
          if (
            isNaN(apiData.amount as number) ||
            (apiData.amount as number) <= 0
          ) {
            throw new Error("Amount must be a positive number");
          }
        }

        const response = await fetch(
          `/api/payments/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const responseData = await response.json();

        // FIXED: Handle multiple response structures
        const updatedPayment = responseData.data || responseData.payment || responseData;

        if (!updatedPayment) {
          throw new Error("Invalid response format");
        }

        // Update current payment if it's the one being updated
        if (currentPayment && currentPayment.id === id) {
          setCurrentPayment(updatedPayment);
        }

        // Update the payment in the payments list if it exists
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment.id === id ? updatedPayment : payment
          )
        );

        return updatedPayment;
      } catch (err) {
        console.error("Error updating payment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update payment"
        );
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [currentPayment]
  );

  // Delete payment - Enhanced with better error handling
  const deletePayment = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id || typeof id !== "string") {
        setError("Invalid payment ID");
        return false;
      }

      setDeleting(id);
      setError(null);

      try {
        const response = await fetch(
          `/api/payments/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        // Clear current payment if it's the one being deleted
        if (currentPayment && currentPayment.id === id) {
          setCurrentPayment(null);
        }

        // Remove the payment from the payments list
        setPayments((prevPayments) =>
          prevPayments.filter((payment) => payment.id !== id)
        );

        // Adjust total count
        setTotalCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch (err) {
        console.error("Error deleting payment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete payment"
        );
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [currentPayment]
  );

  // Generate payslip
  const generatePayslip = useCallback(async (paymentId: string) => {
    if (!paymentId || typeof paymentId !== "string") {
      setError("Invalid payment ID");
      throw new Error("Invalid payment ID");
    }

    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}/payslip`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      
      // FIXED: Handle multiple response structures
      const payslipData = data.data || data.payslip || data;
      
      return payslipData;
    } catch (err) {
      console.error("Error generating payslip:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate payslip"
      );
      throw err;
    }
  }, []);

  // Utility actions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentPayment = useCallback(() => {
    setCurrentPayment(null);
  }, []);

  const setCurrentPageCallback = useCallback((page: number) => {
    if (typeof page === "number" && page > 0) {
      setCurrentPage(page);
    }
  }, []);

  return {
    // Data
    payments,
    currentPayment,

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
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    deletePayment,
    generatePayslip,

    // Pagination actions
    setCurrentPage: setCurrentPageCallback,

    // Utility actions
    clearError,
    clearCurrentPayment,
  };
}