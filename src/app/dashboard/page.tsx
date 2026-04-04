"use client";

import EnhancedQuickActions from "@/components/dashboard/quick-actions";
import EnhancedRecentActivity from "@/components/dashboard/recent-activity";
import { useProfile } from "@/components/layout/profile-context";
import { useClaims } from "@/hooks/useClaims";
import { useClients } from "@/hooks/useClients";
import { usePayments } from "@/hooks/usePayments";
import { usePolicies } from "@/hooks/usePolicies";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { user, profile, loading: profileLoading } = useProfile();
  const { clients, loading: clientsLoading, fetchClients } = useClients();
  const { policies, loading: policiesLoading, fetchPolicies } = usePolicies();
  const { claims, loading: claimsLoading, fetchClaims } = useClaims();
  const { payments, loading: paymentsLoading, fetchPayments } = usePayments();

  const anyLoading = clientsLoading || policiesLoading || claimsLoading || paymentsLoading || profileLoading;

  const userDisplayName = useMemo(() => {
    if (profileLoading) return "";
    if (profile?.first_name) return profile.first_name;
    return user?.email?.split("@")[0] || "there";
  }, [profile, user, profileLoading]);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchClients(), fetchPolicies(), fetchClaims(), fetchPayments()]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [fetchClients, fetchPolicies, fetchClaims, fetchPayments]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchClients(), fetchPolicies(), fetchClaims(), fetchPayments()]);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activePolicies = policies.filter(p => ["Active", "active"].includes(p.status)).length;
    const openClaims = claims.filter(c => ["Open", "Processing", "Under Review", "Pending"].includes(c.status)).length;
    const totalRevenue = payments
      .filter(p => ["completed", "success"].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      { label: "Clients",  value: clients.length,                   href: "/dashboard/client-management"  },
      { label: "Policies", value: activePolicies,                   href: "/dashboard/policy-management"  },
      { label: "Claims",   value: openClaims,                       href: "/dashboard/claims-management"  },
      { label: "Revenue",  value: `P ${totalRevenue.toLocaleString()}`, href: "/dashboard/payment-management" },
    ];
  }, [clients, policies, claims, payments]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const loading = isLoading || anyLoading;

  return (
    <div className="min-h-screen bg-[#f8f7f4]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 md:pb-10 md:px-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {greeting}
            </p>
            {profileLoading ? (
              <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
            ) : (
              <h1 className="text-2xl font-normal text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                {userDisplayName || "Welcome back"}
              </h1>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="mt-1 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all disabled:opacity-30"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats — small pill row, not a big grid */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => router.push(stat.href)}
              className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 hover:border-gray-400 transition-all active:scale-95"
            >
              {loading ? (
                <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 px-0.5">
            Quick actions
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-3">
            <EnhancedQuickActions
              isDarkMode={false}
              onActionClick={(actionId) => console.log("Action:", actionId)}
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 px-0.5">
            Recent activity
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-3">
            <EnhancedRecentActivity
              isDarkMode={false}
              onActivityClick={(id) => console.log("Activity:", id)}
            />
          </div>
        </section>

      </div>
    </div>
  );
}