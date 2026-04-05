"use client";

import EnhancedQuickActions from "@/components/dashboard/quick-actions";
import EnhancedRecentActivity from "@/components/dashboard/recent-activity";
import { useProfile } from "@/components/layout/profile-context";
import { useClaims } from "@/hooks/useClaims";
import { useClients } from "@/hooks/useClients";
import { usePayments } from "@/hooks/usePayments";
import { usePolicies } from "@/hooks/usePolicies";
import { useStats } from "@/hooks/useStats";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// ── Brand palette (navy, matches landing page) ──────────────────────────────
const NAVY        = "#1B2B4B";          // primary brand
const NAVY_MED    = "#2C3E63";          // hover / pressed
const NAVY_MUTED  = "rgba(27,43,75,0.08)";  // icon backgrounds
const NAVY_LIGHT  = "#EEF1F7";          // hero tint

const ACCENT      = "#4A7FD4";          // blue accent for links / highlights
const ACCENT_MUTED = "rgba(74,127,212,0.10)";

// ── Surface / text ───────────────────────────────────────────────────────────
const BG      = "#F4F6FA";
const SURFACE = "#FFFFFF";
const BORDER  = "#E2E6EF";
const TEXT1   = "#111827";
const TEXT2   = "#6B7280";
const TEXT3   = "#9CA3AF";
const SKELETON = "#EEF1F7";

/* ─── Rotating ticker ─── */
function HeroTicker({ lines }: { lines: { text: string; href: string }[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (lines.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % lines.length);
        setVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, [lines.length]);

  if (!lines.length) return null;
  const current = lines[index];

  return (
    <button
      onClick={() => router.push(current.href)}
      className="flex items-center gap-1.5 mt-3 group"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
      <span className="text-[12px] font-medium" style={{ color: ACCENT }}>
        {current.text}
      </span>
      <ArrowUpRight className="w-3 h-3 flex-shrink-0" style={{ color: ACCENT }} />
    </button>
  );
}

function PolicyCard({
  name, clientName, status, premium, href,
}: {
  name: string; clientName: string; status: string;
  premium: number; href: string;
}) {
  const router = useRouter();
  const isActive = ["Active", "active"].includes(status);
  const premiumDisplay =
    premium >= 1_000_000 ? `P ${(premium / 1_000_000).toFixed(1)}M`
    : premium >= 1_000   ? `P ${(premium / 1_000).toFixed(0)}K`
    :                      `P ${premium.toLocaleString()}`;

  return (
    <button
      onClick={() => router.push(href)}
      className="flex-shrink-0 flex flex-col justify-between rounded-2xl p-4 active:scale-[0.97] transition-transform text-left"
      style={{
        width: "72vw",
        maxWidth: 260,
        minHeight: 140,
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 2px 10px rgba(27,43,75,0.07)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: NAVY_MUTED }}
        >
          <Shield className="w-4 h-4" strokeWidth={1.75} style={{ color: NAVY }} />
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
          style={{
            background: isActive ? NAVY_MUTED : SKELETON,
            color: isActive ? NAVY : TEXT2,
          }}
        >
          {status}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm font-bold leading-tight line-clamp-1" style={{ color: TEXT1 }}>{name}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: TEXT2 }}>{clientName}</p>
        <p className="text-base font-bold mt-2" style={{ color: NAVY }}>{premiumDisplay}</p>
      </div>
    </button>
  );
}

/* ─── Page ─── */
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { user, profile, loading: profileLoading } = useProfile();
  const { clients, loading: clientsLoading, fetchClients } = useClients();
  const { policies, loading: policiesLoading, fetchPolicies } = usePolicies();
  const { claims, loading: claimsLoading, fetchClaims } = useClaims();
  const { payments, loading: paymentsLoading, fetchPayments } = usePayments();
  const { stats, isLoading: statsLoading } = useStats();

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
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [fetchClients, fetchPolicies, fetchClaims, fetchPayments]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try { await Promise.all([fetchClients(), fetchPolicies(), fetchClaims(), fetchPayments()]); }
    finally { setIsLoading(false); }
  };

  const loading = isLoading || anyLoading;

  const derived = useMemo(() => {
    const openClaims = claims.filter((c) =>
      ["Open", "Processing", "Under Review", "Pending"].includes(c.status)
    ).length;
    const totalRevenue = payments
      .filter((p) => ["completed", "success"].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueDisplay =
      totalRevenue >= 1_000_000 ? `${(totalRevenue / 1_000_000).toFixed(1)}M`
      : totalRevenue >= 1_000   ? `${(totalRevenue / 1_000).toFixed(0)}K`
      :                           totalRevenue.toLocaleString();
    return { clientCount: clients.length, openClaims, revenueDisplay };
  }, [clients, policies, claims, payments]);

  const tickerLines = useMemo(() => {
    if (loading || statsLoading) return [];
    const lines: { text: string; href: string }[] = [];

    if (stats) {
      if (stats.new_this_month > 0)
        lines.push({ text: `${stats.new_this_month} new client${stats.new_this_month > 1 ? "s" : ""} joined this month`, href: "/dashboard/client-management" });
      if (stats.growth_rate > 0)
        lines.push({ text: `Portfolio growing at ${stats.growth_rate.toFixed(1)}% this month`, href: "/dashboard/client-management" });
      if (stats.active_clients > 0)
        lines.push({ text: `${stats.active_clients} of ${stats.total_clients} clients currently active`, href: "/dashboard/client-management" });
      if (stats.total_premium_value > 0) {
        const val = stats.total_premium_value >= 1_000_000
          ? `${(stats.total_premium_value / 1_000_000).toFixed(1)}M`
          : stats.total_premium_value >= 1_000
          ? `${(stats.total_premium_value / 1_000).toFixed(0)}K`
          : stats.total_premium_value.toLocaleString();
        lines.push({ text: `Total portfolio value: P ${val}`, href: "/dashboard/policy-management" });
      }
    }

    const openClaims = claims.filter((c) =>
      ["Open", "Processing", "Under Review", "Pending"].includes(c.status)
    );
    if (openClaims.length > 0)
      lines.push({ text: `${openClaims.length} open claim${openClaims.length > 1 ? "s" : ""} need attention`, href: "/dashboard/claims-management" });

    const pending = payments.filter((p) => p.status === "pending");
    if (pending.length > 0)
      lines.push({ text: `${pending.length} payment${pending.length > 1 ? "s" : ""} pending`, href: "/dashboard/payment-management" });

    const soon = policies.filter((p) => {
      if (!p.end_date) return false;
      const days = (new Date(p.end_date).getTime() - Date.now()) / 86_400_000;
      return days >= 0 && days <= 30;
    });
    if (soon.length > 0)
      lines.push({ text: `${soon.length} polic${soon.length > 1 ? "ies" : "y"} expiring within 30 days`, href: "/dashboard/policy-management" });

    return lines;
  }, [loading, statsLoading, stats, claims, payments, policies]);

  const recentPolicies = useMemo(() =>
    [...policies]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [policies]
  );

  const policyScrollRef = useRef<HTMLDivElement>(null);
  const [activePolicyDot, setActivePolicyDot] = useState(0);

  useEffect(() => {
    const el = policyScrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.scrollWidth / recentPolicies.length;
      setActivePolicyDot(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [recentPolicies.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "system-ui, -apple-system, sans-serif" }}>


      <div className="max-w-2xl mx-auto px-4 pt-5 pb-28 space-y-5">

        {/* ── Hero ── */}
        <div
          className="rounded-2xl px-5 py-5 border"
          style={{
            background: NAVY,
            borderColor: NAVY_MED,
          }}
        >
          <p className="text-[11px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>{dateStr}</p>
          {profileLoading ? (
            <div className="h-8 w-44 rounded-lg animate-pulse mb-1" style={{ background: "rgba(255,255,255,0.1)" }} />
          ) : (
            <h1 className="text-[23px] font-bold tracking-tight leading-tight" style={{ color: "#FFFFFF" }}>
              {greeting}, <span style={{ color: "#A8C4E8" }}>{userDisplayName || "there"}</span> 👋
            </h1>
          )}
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>Here's what's happening today.</p>
          <HeroTicker lines={tickerLines} />
        </div>

        {/* ── Urgent claim alert ── */}
        {!loading && derived.openClaims > 0 && (
          <button
            onClick={() => router.push("/dashboard/claims-management")}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left active:scale-[0.99] transition-all border"
            style={{ background: "#fffbeb", borderColor: "#fde68a" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#fef3c7" }}>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700">
                {derived.openClaims} claim{derived.openClaims > 1 ? "s" : ""} need attention
              </p>
              <p className="text-xs mt-0.5 text-amber-500">Tap to review pending cases</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {/* ── Quick Actions ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide px-0.5 mb-3" style={{ color: TEXT3 }}>Quick actions</p>
          <div className="rounded-2xl border px-2 py-1" style={{ background: SURFACE, borderColor: BORDER, boxShadow: "0 1px 6px rgba(27,43,75,0.05)" }}>
            <EnhancedQuickActions isDarkMode={false} onActionClick={(id) => console.log("Action:", id)} />
          </div>
        </div>

        {/* ── Recent Policies ── */}
        <div>
          <div className="flex items-center justify-between px-0.5 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT3 }}>Recent policies</p>
            <button
              className="text-xs font-semibold flex items-center gap-0.5"
              style={{ color: ACCENT }}
              onClick={() => router.push("/dashboard/policy-management")}
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 rounded-2xl animate-pulse"
                  style={{ width: "72vw", maxWidth: 260, minHeight: 140, background: SKELETON }} />
              ))}
            </div>
          ) : recentPolicies.length === 0 ? (
            <div className="rounded-2xl border py-8 text-center" style={{ background: SURFACE, borderColor: BORDER }}>
              <p className="text-sm" style={{ color: TEXT2 }}>No policies yet.</p>
              <p className="text-xs mt-1" style={{ color: TEXT3 }}>Create your first policy to get started.</p>
            </div>
          ) : (
            <>
              <div
                ref={policyScrollRef}
                className="flex gap-3 overflow-x-auto"
                style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 2 }}
              >
                {recentPolicies.map((p) => (
                  <div key={p.id} style={{ scrollSnapAlign: "start" }}>
                    <PolicyCard
                      name={p.policy_name || p.policy_number}
                      clientName={p.client?.full_name || "—"}
                      status={p.status}
                      premium={p.premium_amount}
                      href={`/dashboard/policy-management/${p.id}`}
                    />
                  </div>
                ))}
                <div className="flex-shrink-0 w-4" />
              </div>

              {recentPolicies.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {recentPolicies.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-300"
                      style={{
                        width: i === activePolicyDot ? 16 : 6,
                        height: 6,
                        background: i === activePolicyDot ? NAVY : NAVY_LIGHT,
                      }} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <div className="flex items-center justify-between px-0.5 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT3 }}>Recent activity</p>
            <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color: ACCENT }}>
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="rounded-2xl border p-2" style={{ background: SURFACE, borderColor: BORDER, boxShadow: "0 1px 6px rgba(27,43,75,0.05)" }}>
            <EnhancedRecentActivity isDarkMode={false} onActivityClick={(id) => console.log("Activity:", id)} />
          </div>
        </div>

      </div>
    </div>
  );
}