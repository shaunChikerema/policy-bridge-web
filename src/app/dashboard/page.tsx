"use client";

import EnhancedQuickActions from "@/components/dashboard/quick-actions";
import EnhancedRecentActivity from "@/components/dashboard/recent-activity";
import { useProfile } from "@/components/layout/profile-context";
import { useClaims } from "@/hooks/useClaims";
import { useClients } from "@/hooks/useClients";
import { usePayments } from "@/hooks/usePayments";
import { usePolicies } from "@/hooks/usePolicies";
import { AlertCircle, BarChart3, FileText, RefreshCw, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { user, profile, loading: profileLoading } = useProfile();
  const { clients, loading: clientsLoading, fetchClients, error: clientsError } = useClients();
  const { policies, loading: policiesLoading, fetchPolicies, error: policiesError } = usePolicies();
  const { claims, loading: claimsLoading, fetchClaims, error: claimsError } = useClaims();
  const { payments, loading: paymentsLoading, fetchPayments, error: paymentsError } = usePayments();

  const anyLoading = clientsLoading || policiesLoading || claimsLoading || paymentsLoading || profileLoading;
  const anyError = clientsError || policiesError || claimsError || paymentsError;

  const userDisplayName = useMemo(() => {
    if (profileLoading) return "";
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }
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
    const activeClients = clients.filter(c => c.is_active).length;
    const activePolicies = policies.filter(p => ["Active", "active"].includes(p.status)).length;
    const openClaims = claims.filter(c => ["Open", "Processing", "Under Review", "Pending"].includes(c.status)).length;
    const totalRevenue = payments
      .filter(p => ["completed", "success"].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      {
        label: "Clients",
        value: clients.length,
        sub: `${activeClients} active`,
        icon: Users,
        href: "/dashboard/client-management",
        accent: "#e8f0fe",
      },
      {
        label: "Policies",
        value: activePolicies,
        sub: `of ${policies.length} total`,
        icon: Shield,
        href: "/dashboard/policy-management",
        accent: "#e6f4ea",
      },
      {
        label: "Claims",
        value: openClaims,
        sub: `${claims.length} total`,
        icon: FileText,
        href: "/dashboard/claims-management",
        accent: "#fef3e2",
      },
      {
        label: "Revenue",
        value: `P ${totalRevenue.toLocaleString()}`,
        sub: "confirmed",
        icon: BarChart3,
        href: "/dashboard/payment-management",
        accent: "#fce8e6",
      },
    ];
  }, [clients, policies, claims, payments]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 md:pb-8 md:px-6 md:pt-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1" style={{ fontFamily: "system-ui, sans-serif" }}>
              {greeting}
            </p>
            {profileLoading ? (
              <div className="h-8 w-36 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                {userDisplayName || "Welcome back"}
              </h1>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading || anyLoading}
            className="p-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors disabled:opacity-40 active:scale-95"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading || anyLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Error ── */}
        {anyError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5" style={{ fontFamily: "system-ui, sans-serif" }}>
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600">Error loading data. Try refreshing.</p>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.label}
                onClick={() => router.push(stat.href)}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-gray-200 hover:shadow-sm transition-all active:scale-[0.98]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: stat.accent }}
                >
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                {isLoading || anyLoading ? (
                  <>
                    <div className="h-6 w-14 bg-gray-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="text-xl font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "'Georgia', serif" }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
                      {stat.label} · {stat.sub}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
          <div className="px-5 pt-5 pb-3 border-b border-gray-50">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
              Quick actions
            </p>
          </div>
          <div className="p-3">
            <EnhancedQuickActions
              isDarkMode={false}
              onActionClick={(actionId) => console.log("Action:", actionId)}
            />
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-50">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
              Recent activity
            </p>
          </div>
          <div className="p-3">
            <EnhancedRecentActivity
              isDarkMode={false}
              onActivityClick={(id) => console.log("Activity:", id)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}