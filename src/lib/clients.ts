// lib/supabase/clients.ts
import { createBrowserClient } from "@supabase/ssr";
import {
  ClientFilters,
  ClientInsert,
  ClientResponse,
  ClientSortOptions,
  ClientsResponse,
  ClientStats,
  ClientUpdate,
  ClientWithDetails,
  DatabaseClient,
} from "../types";

export class ClientService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get all clients with filtering, sorting, and pagination
  async getClients(
    filters: ClientFilters = {},
    sort: ClientSortOptions = { field: "created_at", direction: "desc" },
    page: number = 1,
    limit: number = 10
  ): Promise<ClientsResponse> {
    try {
      const { user } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      let query = this.supabase
        .from("clients")
        .select(
          `
          *,
          full_name:first_name || ' ' || last_name
        `,
          { count: "exact" }
        )
        .eq("user_id", user.id);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (typeof filters.is_active === "boolean") {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters.gender) {
        query = query.eq("gender", filters.gender);
      }

      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      if (filters.state) {
        query = query.ilike("state", `%${filters.state}%`);
      }

      if (filters.min_income) {
        query = query.gte("annual_income", filters.min_income);
      }

      if (filters.max_income) {
        query = query.lte("annual_income", filters.max_income);
      }

      if (filters.has_phone) {
        query = query.not("phone", "is", null);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching clients:", error);
        return {
          data: [],
          count: 0,
          page,
          limit,
          total_pages: 0,
          error: error.message,
        };
      }

      // Transform data to include computed fields
      const clientsWithDetails: ClientWithDetails[] = (data || []).map(
        (client) => ({
          ...client,
          full_name: `${client.first_name} ${client.last_name}`,
          total_policies: 0, // TODO: Get from policies table
          total_premium: 0, // TODO: Calculate from policies
          formatted_address: this.formatAddress(client),
          formatted_phone: this.formatPhone(client.phone),
          age: this.calculateAge(client.date_of_birth),
          join_date: client.created_at,
        })
      );

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: clientsWithDetails,
        count: count || 0,
        page,
        limit,
        total_pages: totalPages,
      };
    } catch (error) {
      console.error("Unexpected error fetching clients:", error);
      return {
        data: [],
        count: 0,
        page,
        limit,
        total_pages: 0,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get single client by ID
  async getClient(id: string): Promise<ClientResponse> {
    try {
      const { user } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await this.supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching client:", error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: "Client not found" };
      }

      // Transform data to include computed fields
      const clientWithDetails: ClientWithDetails = {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
        total_policies: 0, // TODO: Get from policies table
        total_premium: 0, // TODO: Calculate from policies
        formatted_address: this.formatAddress(data),
        formatted_phone: this.formatPhone(data.phone),
        age: this.calculateAge(data.date_of_birth),
        join_date: data.created_at,
      };

      return { data: clientWithDetails };
    } catch (error) {
      console.error("Unexpected error fetching client:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Create new client
  async createClient(clientData: ClientInsert): Promise<ClientResponse> {
    try {
      const { user } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Ensure user_id is set
      const insertData: ClientInsert = {
        ...clientData,
        user_id: user.id,
        country: clientData.country || "BW", // Default to Botswana
      };

      const { data, error } = await this.supabase
        .from("clients")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Error creating client:", error);
        return { data: null, error: error.message };
      }

      // Transform data to include computed fields
      const clientWithDetails: ClientWithDetails = {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
        total_policies: 0,
        total_premium: 0,
        formatted_address: this.formatAddress(data),
        formatted_phone: this.formatPhone(data.phone),
        age: this.calculateAge(data.date_of_birth),
        join_date: data.created_at,
      };

      return { data: clientWithDetails };
    } catch (error) {
      console.error("Unexpected error creating client:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Update existing client
  async updateClient(
    id: string,
    updates: ClientUpdate
  ): Promise<ClientResponse> {
    try {
      const { user } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const updateData: ClientUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("clients")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating client:", error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return {
          data: null,
          error: "Client not found or you do not have permission to update it",
        };
      }

      // Transform data to include computed fields
      const clientWithDetails: ClientWithDetails = {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
        total_policies: 0,
        total_premium: 0,
        formatted_address: this.formatAddress(data),
        formatted_phone: this.formatPhone(data.phone),
        age: this.calculateAge(data.date_of_birth),
        join_date: data.created_at,
      };

      return { data: clientWithDetails };
    } catch (error) {
      console.error("Unexpected error updating client:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Delete client
  async deleteClient(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await this.supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting client:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error deleting client:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Get client statistics
  async getClientStats(): Promise<ClientStats> {
    try {
      const { user } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get basic counts
      const { data: totalClients, error: totalError } = await this.supabase
        .from("clients")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      const { data: activeClients, error: activeError } = await this.supabase
        .from("clients")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: inactiveClients, error: inactiveError } =
        await this.supabase
          .from("clients")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("is_active", false);

      // Get new clients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: newClients, error: newError } = await this.supabase
        .from("clients")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      if (totalError || activeError || inactiveError || newError) {
        throw new Error("Error fetching client statistics");
      }

      return {
        total_clients: totalClients?.length || 0,
        active_clients: activeClients?.length || 0,
        inactive_clients: inactiveClients?.length || 0,
        new_this_month: newClients?.length || 0,
        total_premium_value: 0, // TODO: Calculate from policies
        average_annual_income: 0, // TODO: Calculate
        clients_by_city: [], // TODO: Implement
        clients_by_age_group: [], // TODO: Implement
        growth_rate: 0, // TODO: Calculate
      };
    } catch (error) {
      console.error("Error fetching client stats:", error);
      return {
        total_clients: 0,
        active_clients: 0,
        inactive_clients: 0,
        new_this_month: 0,
        total_premium_value: 0,
        average_annual_income: 0,
        clients_by_city: [],
        clients_by_age_group: [],
        growth_rate: 0,
      };
    }
  }

  // Utility functions
  private formatAddress(client: DatabaseClient): string {
    const parts = [
      client.address_line1,
      client.address_line2,
      client.city,
      client.state,
      client.country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  private formatPhone(phone?: string): string {
    if (!phone) return "";

    // Format Botswana phone numbers
    if (phone.startsWith("+267")) {
      return phone.replace("+267", "+267 ").replace(/(\d{4})(\d{4})/, "$1 $2");
    }

    return phone;
  }

  private calculateAge(dateOfBirth?: string): number | undefined {
    if (!dateOfBirth) return undefined;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

// Export singleton instance
export const clientService = new ClientService();
