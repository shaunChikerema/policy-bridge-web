// hooks/useStats.ts
import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useState } from "react";

interface StatsData {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  new_this_month: number;
  total_premium_value: number;
  average_annual_income: number;
  growth_rate: number;
}

interface UseStatsReturn {
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/stats");

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch statistics"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
