// app/api/stats/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    const cacheKey = `stats-${user.id}-${dateFrom || "all"}-${dateTo || "all"}`;

    // Build base query for clients
    let clientQuery = supabase
      .from("clients")
      .select("id, is_active, created_at, annual_income, city, updated_at")
      .eq("user_id", user.id);

    if (dateFrom) clientQuery = clientQuery.gte("created_at", dateFrom);
    if (dateTo) clientQuery = clientQuery.lte("created_at", dateTo);

    const { data: clients, error: clientsError } = await clientQuery;

    if (clientsError) {
      console.error("Database error (clients):", clientsError);
      return NextResponse.json(
        { error: "Failed to fetch client statistics" },
        { status: 500 }
      );
    }

    // Calculate comprehensive statistics
    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter((c) => c.is_active).length || 0;

    // Time-based calculations
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const newClientsThisMonth =
      clients?.filter((c) => new Date(c.created_at) >= thisMonth).length || 0;

    const newClientsLastMonth =
      clients?.filter((c) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= lastMonth && createdAt < thisMonth;
      }).length || 0;

    // Calculate growth rate
    const growthRate =
      newClientsLastMonth > 0
        ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) *
          100
        : newClientsThisMonth > 0
        ? 100
        : 0;

    // Income calculations with better error handling
    const validIncomes =
      clients
        ?.map((c) => c.annual_income)
        .filter(
          (income): income is number =>
            income != null && !isNaN(Number(income)) && Number(income) > 0
        ) || [];

    const averageAnnualIncome =
      validIncomes.length > 0
        ? validIncomes.reduce((sum, income) => sum + Number(income), 0) /
          validIncomes.length
        : 0;

    // Placeholder values for features not yet implemented
    const totalPremiumValue = 0; // TODO: Calculate from policies/payments

    // Geographic distribution
    const clientsByCity =
      clients?.reduce((acc, client) => {
        const city = client.city || "Unknown";
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Response with comprehensive stats
    const stats = {
      // Core metrics
      total_clients: totalClients,
      active_clients: activeClients,
      inactive_clients: totalClients - activeClients,
      new_this_month: newClientsThisMonth,

      // Financial metrics
      total_premium_value: totalPremiumValue,
      average_annual_income: Math.round(averageAnnualIncome * 100) / 100,

      // Growth metrics
      growth_rate: Math.round(growthRate * 100) / 100,
      new_last_month: newClientsLastMonth,

      // Geographic distribution
      clients_by_city: Object.entries(clientsByCity)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count),

      // Metadata
      last_updated: new Date().toISOString(),
      data_range: {
        from: dateFrom || null,
        to: dateTo || null,
      },
    };

    // Add cache headers for performance
    const response = NextResponse.json(stats);
    response.headers.set("Cache-Control", "private, max-age=300"); // 5 minutes

    return response;
  } catch (error) {
    console.error("Unexpected error in stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
