// lib/supabase/clients.ts
import {
  ClientFilters,
  ClientInsert,
  ClientSortOptions,
  ClientStats,
  ClientUpdate,
  ClientWithDetails,
} from "../types";

export interface ClientsResponse {
  data: ClientWithDetails[];
  error?: string;
  count: number;
  total_pages: number;
}

export interface ClientResponse {
  data: ClientWithDetails | null;
  error?: string;
}

export const clientService = {
  async getClients(
    filters: ClientFilters,
    sort: ClientSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<ClientsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_field: sort.field,
        sort_direction: sort.direction,
      });

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.is_active && filters.is_active !== "all") {
        params.append("is_active", filters.is_active);
      }

      const response = await fetch(`/api/clients?${params.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        return {
          data: [],
          error: `HTTP ${response.status}: ${errorText}`,
          count: 0,
          total_pages: 0,
        };
      }

      const result = await response.json();
      console.log("Get clients result:", result);

      return {
        data: result.data || [],
        count: result.count || 0,
        total_pages: result.total_pages || 0,
      };
    } catch (error) {
      console.error("Get clients error:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Network error",
        count: 0,
        total_pages: 0,
      };
    }
  },

  async getClient(id: string): Promise<ClientResponse> {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Get client API Error:", response.status, errorText);
        return {
          data: null,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json();
      console.log("Get client result:", result);

      return {
        data: result.data,
      };
    } catch (error) {
      console.error("Get client error:", error);
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  async createClient(data: ClientInsert): Promise<ClientResponse> {
    try {
      console.log("Client service: Creating client with data:", data);

      const response = await fetch("/api/clients", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Create client response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Create client API Error:", response.status, errorText);

        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }

        return {
          data: null,
          error: `HTTP ${response.status}: ${errorMessage}`,
        };
      }

      const result = await response.json();
      console.log("Create client success result:", result);

      return {
        data: result.data,
      };
    } catch (error) {
      console.error("Client service error:", error);
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  async updateClient(id: string, data: ClientUpdate): Promise<ClientResponse> {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json();
      return {
        data: result.data,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  },

  async deleteClient(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Delete client error:", response.status, errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Delete client error:", error);
      return false;
    }
  },

  async getClientStats(): Promise<ClientStats> {
    try {
      // TODO: Implement when stats endpoint is ready
      return {
        total: 0,
        active: 0,
        inactive: 0,
        new_this_month: 0,
      };
    } catch (error) {
      console.error("Failed to fetch client stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        new_this_month: 0,
      };
    }
  },
};
