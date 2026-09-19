"use client";

import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Grid,
  List,
  Plus,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/* ─── Design tokens (matches client page) ───────────────────────────────── */
const NAVY       = "#1B2B4B";
const ACCENT     = "#4A7FD4";
const SURFACE    = "#FFFFFF";
const BG         = "#F4F6FA";
const BORDER     = "#E2E6EF";
const TEXT1      = "#111827";
const TEXT2      = "#6B7280";
const TEXT3      = "#9CA3AF";
const NAVY_MUTED = "rgba(27,43,75,0.08)";
const NAVY_LIGHT = "#EEF1F7";

/* ─── Policy type colours ────────────────────────────────────────────────── */
const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  life:     { bg: "#EFF6FF", color: "#1D4ED8" },
  motor:    { bg: "#F0FDF4", color: "#15803D" },
  home:     { bg: "#F5F3FF", color: "#6D28D9" },
  health:   { bg: "#FDF2F8", color: "#9D174D" },
  travel:   { bg: "#ECFEFF", color: "#0E7490" },
  business: { bg: "#EEF2FF", color: "#3730A3" },
};
const typeStyle = (t: string) =>
  TYPE_STYLES[t?.toLowerCase()] ?? { bg: "#F3F4F6", color: TEXT2 };

/* ─── Status colours ─────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active:    { bg: NAVY_MUTED,  color: NAVY },
  pending:   { bg: "#FEF3C7",   color: "#92400E" },
  expired:   { bg: "#FEF2F2",   color: "#991B1B" },
  cancelled: { bg: "#F3F4F6",   color: TEXT3 },
  suspended: { bg: "#FFF7ED",   color: "#9A3412" },
};
const statusStyle = (s: string) =>
  STATUS_STYLES[s?.toLowerCase()] ?? { bg: "#F3F4F6", color: TEXT3 };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-BW", { year: "numeric", month: "short", day: "numeric" });

function getExpiry(dateStr: string) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (days < 0)  return { label: "Expired",       days: Math.abs(days), urgency: "high",   Icon: Clock };
  if (days <= 7) return { label: "Expiring soon",  days,                urgency: "high",   Icon: Zap };
  if (days <= 30) return { label: "Due soon",       days,                urgency: "med",    Icon: Clock };
  if (days <= 90) return { label: "Renewal due",    days,                urgency: "low",    Icon: Calendar };
  return              { label: "Active",           days,                urgency: "none",   Icon: CheckCircle };
}

const URGENCY_COLOR: Record<string, string> = {
  high: "#DC2626",
  med:  "#EA580C",
  low:  "#D97706",
  none: "#16A34A",
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function IconBtn({
  icon, onClick, variant = "neutral", title,
}: {
  icon: React.ReactNode; onClick: () => void;
  variant?: "neutral" | "primary" | "danger"; title?: string;
}) {
  const styles = {
    neutral: { background: "#F3F4F6", color: TEXT2 },
    primary: { background: NAVY_MUTED, color: NAVY },
    danger:  { background: "#FEF2F2", color: "#DC2626" },
  }[variant];
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8, border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", ...styles,
      }}
    >
      {icon}
    </button>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: "6px 14px", borderRadius: 99,
        border: active ? "none" : `1px solid ${BORDER}`,
        background: active ? NAVY : SURFACE,
        color: active ? "#fff" : TEXT2,
        fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function TypePill({ type }: { type: string }) {
  const s = typeStyle(type);
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 600,
      padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color,
    }}>
      {type}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = statusStyle(status);
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 600,
      padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color,
      textTransform: "capitalize",
    }}>
      {status}
    </span>
  );
}

/* ─── Policy icon avatar ─────────────────────────────────────────────────── */
function PolicyIcon({ type, size = 42 }: { type: string; size?: number }) {
  const s = typeStyle(type);
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Shield style={{ width: size * 0.42, height: size * 0.42, color: s.color }} />
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
function PolicyCard({ policy, onView, onEdit }: any) {
  const expiry = getExpiry(policy.expiration_date);
  const urgColor = URGENCY_COLOR[expiry.urgency];

  return (
    <div
      onClick={() => onView(policy.id)}
      style={{
        background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`,
        padding: "14px", cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(27,43,75,0.10)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginBottom: 10 }}>
        <PolicyIcon type={policy.policy_type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {policy.policy_name}
          </div>
          <div style={{ fontSize: 11, color: TEXT3, marginTop: 1 }}>{policy.policy_number}</div>
          <div style={{ marginTop: 4, display: "flex", gap: 5, flexWrap: "wrap" }}>
            <StatusPill status={policy.status} />
            <TypePill type={policy.policy_type} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <IconBtn icon={<Eye style={{ width: 13, height: 13 }} />} onClick={() => onView(policy.id)} variant="primary" title="View" />
          <IconBtn icon={<Edit style={{ width: 13, height: 13 }} />} onClick={() => onEdit(policy.id)} title="Edit" />
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 10 }}>
        {[
          { label: "Client",  value: policy.client?.full_name || "—" },
          { label: "Premium", value: formatCurrency(policy.premium_amount || 0) },
          { label: "Started", value: formatDate(policy.start_date || policy.created_at) },
          { label: "Expires", value: formatDate(policy.expiration_date) },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: TEXT3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: 12, color: TEXT1, fontWeight: 500, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Expiry strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 10px", borderRadius: 8,
        background: expiry.urgency === "none" ? "#F0FDF4" : expiry.urgency === "high" ? "#FEF2F2" : expiry.urgency === "med" ? "#FFF7ED" : "#FFFBEB",
      }}>
        <expiry.Icon style={{ width: 12, height: 12, color: urgColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: urgColor }}>
          {expiry.label}
        </span>
        <span style={{ fontSize: 11, color: TEXT3, marginLeft: "auto" }}>
          {expiry.days}d
        </span>
      </div>
    </div>
  );
}

/* ─── Table row ──────────────────────────────────────────────────────────── */
function PolicyTableRow({ policy, onView, onEdit }: any) {
  const expiry = getExpiry(policy.expiration_date);
  return (
    <tr
      onClick={() => onView(policy.id)}
      style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer", transition: "background 0.1s" }}
      onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = BG)}
      onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
    >
      <td style={{ padding: "13px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PolicyIcon type={policy.policy_type} size={34} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>{policy.policy_name}</div>
            <div style={{ fontSize: 11, color: TEXT3 }}>{policy.policy_number}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT2 }}>
        {policy.client?.full_name || "—"}
      </td>
      <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: TEXT1 }}>
        {formatCurrency(policy.premium_amount || 0)}
      </td>
      <td style={{ padding: "13px 16px" }}>
        <StatusPill status={policy.status} />
      </td>
      <td style={{ padding: "13px 16px" }}>
        <TypePill type={policy.policy_type} />
      </td>
      <td style={{ padding: "13px 16px" }}>
        <div style={{ fontSize: 12, color: TEXT1 }}>{formatDate(policy.expiration_date)}</div>
        <div style={{ fontSize: 11, color: URGENCY_COLOR[expiry.urgency], marginTop: 1 }}>{expiry.label}</div>
      </td>
      <td style={{ padding: "13px 16px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 5 }}>
          <IconBtn icon={<Eye style={{ width: 13, height: 13 }} />} onClick={() => onView(policy.id)} variant="primary" title="View" />
          <IconBtn icon={<Edit style={{ width: 13, height: 13 }} />} onClick={() => onEdit(policy.id)} title="Edit" />
        </div>
      </td>
    </tr>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
function PolicyManagementLoading() {
  return (
    <div style={{ padding: 16, background: BG, minHeight: "100vh" }}>
      <div style={{ height: 28, background: BORDER, borderRadius: 8, width: 160, marginBottom: 6 }} className="animate-pulse" />
      <div style={{ height: 14, background: BORDER, borderRadius: 8, width: 120, marginBottom: 20 }} className="animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 148, background: BORDER, borderRadius: 14, marginBottom: 8 }} className="animate-pulse" />
      ))}
    </div>
  );
}

/* ─── Filter types ───────────────────────────────────────────────────────── */
type StatusFilter = "all" | "active" | "pending" | "expired" | "cancelled" | "suspended";
type TypeFilter   = "all" | "life" | "motor" | "home" | "health" | "travel" | "business";

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "active",    label: "Active"    },
  { value: "pending",   label: "Pending"   },
  { value: "expired",   label: "Expired"   },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_PILLS: { value: TypeFilter; label: string }[] = [
  { value: "all",      label: "All types" },
  { value: "life",     label: "Life"      },
  { value: "motor",    label: "Motor"     },
  { value: "home",     label: "Home"      },
  { value: "health",   label: "Health"    },
  { value: "travel",   label: "Travel"    },
  { value: "business", label: "Business"  },
];

/* ─── Main content ───────────────────────────────────────────────────────── */
function PolicyManagementContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [viewMode,      setViewMode]      = useState<"grid" | "list">("grid");
  const [sortBy,        setSortBy]        = useState<"date" | "premium" | "name">("date");
  const [search,        setSearch]        = useState(searchParams.get("search") || "");
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const [typeFilter,    setTypeFilter]    = useState<TypeFilter>("all");

  const {
    policies, loading, error,
    totalCount, currentPage, setCurrentPage, totalPages,
    fetchPolicies,
  } = usePolicies();

  const successMessage = searchParams.get("success");

  useEffect(() => {
    const p = new URLSearchParams();
    if (search)                    p.set("search",      search);
    if (statusFilter !== "all")    p.set("status",      statusFilter);
    if (typeFilter   !== "all")    p.set("policy_type", typeFilter);
    fetchPolicies(currentPage, p);
  }, [currentPage, search, statusFilter, typeFilter, fetchPolicies]);

  /* derived stats */
  const stats = (() => {
    if (!policies.length) return null;
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const active   = policies.filter(p => p.status === "active").length;
    const expiring = policies.filter(p => {
      const d = Math.ceil((new Date(p.expiration_date).getTime() - now.getTime()) / 86_400_000);
      return d > 0 && d <= 30;
    }).length;
    const newMonth = policies.filter(p => {
      const d = new Date(p.start_date || p.created_at);
      return d.getMonth() === cm && d.getFullYear() === cy;
    }).length;
    return { active, expiring, newMonth };
  })();

  const sorted = [...policies].sort((a, b) =>
    sortBy === "premium" ? (b.premium_amount || 0) - (a.premium_amount || 0)
    : sortBy === "name"  ? a.policy_name.localeCompare(b.policy_name)
    : new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime()
  );

  const goTo = (path: string) => router.push(path);

  /* ── Error full-screen ─────────────────────────────────────────────── */
  if (error && !policies.length) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <AlertCircle style={{ width: 24, height: 24, color: "#DC2626" }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT1, marginBottom: 6 }}>Unable to load policies</div>
          <div style={{ fontSize: 13, color: TEXT2, marginBottom: 20 }}>{error}</div>
          <button onClick={() => fetchPolicies(currentPage)}
            style={{ padding: "10px 24px", background: NAVY, color: "#fff", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600 }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ── Page ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui,-apple-system,sans-serif", paddingBottom: 100 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px", margin: 0 }}>
              Policies
            </h1>
            {!loading && stats && (
              <p style={{ fontSize: 12, color: TEXT3, margin: "3px 0 0" }}>
                <span style={{ color: ACCENT, fontWeight: 600 }}>{stats.active} active</span>
                <span style={{ margin: "0 4px" }}>·</span>
                {totalCount} total
                {stats.expiring > 0 && (
                  <>
                    <span style={{ margin: "0 4px" }}>·</span>
                    <span style={{ color: "#EA580C", fontWeight: 600 }}>{stats.expiring} expiring soon</span>
                  </>
                )}
                {stats.newMonth > 0 && (
                  <>
                    <span style={{ margin: "0 4px" }}>·</span>
                    <span style={{ color: "#22C55E", fontWeight: 600 }}>+{stats.newMonth} this month</span>
                  </>
                )}
              </p>
            )}
          </div>

          <button
            onClick={() => goTo("/dashboard/policy-management/create")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 99,
              background: NAVY, color: "#fff", border: "none",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 10px rgba(27,43,75,0.25)",
              transition: "transform 0.12s, box-shadow 0.12s",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(27,43,75,0.32)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 10px rgba(27,43,75,0.25)";
            }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            Add policy
          </button>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 20 20" fill="white">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#166534" }}>{successMessage}</span>
          </div>
        )}

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 10,
          boxShadow: "0 1px 4px rgba(27,43,75,0.04)",
        }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke={TEXT3} strokeWidth="2">
            <circle cx="8" cy="8" r="5" /><path d="M15 15l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by policy name, number, or client…"
            style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: TEXT1, outline: "none" }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ border: "none", background: "none", cursor: "pointer", color: TEXT3, padding: 0, display: "flex" }}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Status pill row */}
        <div style={{ display: "flex", gap: 7, marginBottom: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {STATUS_PILLS.map(({ value, label }) => (
            <FilterPill key={value} label={label} active={statusFilter === value}
              onClick={() => { setStatusFilter(value); setCurrentPage(1); }} />
          ))}

          <div style={{ flex: 1 }} />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              flexShrink: 0, padding: "6px 10px", borderRadius: 99,
              border: `1px solid ${BORDER}`, background: SURFACE,
              fontSize: 12, color: TEXT2, outline: "none", cursor: "pointer",
              appearance: "none", paddingRight: 24,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
            }}
          >
            <option value="date">Newest first</option>
            <option value="premium">Highest premium</option>
            <option value="name">Name A–Z</option>
          </select>

          {/* View toggle — desktop only */}
          <div className="hidden lg:flex" style={{ background: BG, borderRadius: 10, padding: 3, gap: 2, display: "flex" }}>
            {(["grid", "list"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: "none", cursor: "pointer",
                  background: viewMode === mode ? SURFACE : "transparent",
                  color: viewMode === mode ? NAVY : TEXT3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "background 0.12s",
                }}>
                {mode === "grid"
                  ? <Grid style={{ width: 13, height: 13 }} />
                  : <List style={{ width: 13, height: 13 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Type pill row */}
        <div style={{ display: "flex", gap: 7, marginBottom: 14, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {TYPE_PILLS.map(({ value, label }) => (
            <FilterPill key={value} label={label} active={typeFilter === value}
              onClick={() => { setTypeFilter(value); setCurrentPage(1); }} />
          ))}
        </div>

        {/* Content */}
        {loading && !policies.length ? (
          <div style={{ textAlign: "center", padding: "52px 0" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              border: `2px solid ${NAVY}`, borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 13, color: TEXT3 }}>Loading policies…</div>
          </div>

        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 20px", background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: NAVY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <FileText style={{ width: 20, height: 20, color: NAVY }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT1, marginBottom: 5 }}>No policies found</div>
            <div style={{ fontSize: 13, color: TEXT3 }}>
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first policy to get started."}
            </div>
          </div>

        ) : (
          <>
            {/* Mobile — card stack */}
            <div className="lg:hidden" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.map(p => (
                <PolicyCard key={p.id} policy={p}
                  onView={(id: string) => goTo(`/dashboard/policy-management/${id}`)}
                  onEdit={(id: string) => goTo(`/dashboard/policy-management/${id}/edit`)}
                />
              ))}
            </div>

            {/* Desktop — grid or list */}
            <div className="hidden lg:block">
              {viewMode === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {sorted.map(p => (
                    <PolicyCard key={p.id} policy={p}
                      onView={(id: string) => goTo(`/dashboard/policy-management/${id}`)}
                      onEdit={(id: string) => goTo(`/dashboard/policy-management/${id}/edit`)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
                        {["Policy", "Client", "Premium", "Status", "Type", "Expiry", ""].map((h, i) => (
                          <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(p => (
                        <PolicyTableRow key={p.id} policy={p}
                          onView={(id: string) => goTo(`/dashboard/policy-management/${id}`)}
                          onEdit={(id: string) => goTo(`/dashboard/policy-management/${id}/edit`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: TEXT3 }}>
              {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2 }}>
                <ChevronLeft style={{ width: 15, height: 15 }} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p =
                  totalPages <= 5            ? i + 1
                  : currentPage <= 3         ? i + 1
                  : currentPage >= totalPages - 2 ? totalPages - 4 + i
                  : currentPage - 2 + i;
                if (p < 1 || p > totalPages) return null;
                const active = p === currentPage;
                return (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: active ? NAVY : SURFACE, color: active ? "#fff" : TEXT2, outline: active ? "none" : `1px solid ${BORDER}` }}>
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2 }}>
                <ChevronRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Export ─────────────────────────────────────────────────────────────── */
export default function PolicyManagementPage() {
  return (
    <Suspense fallback={<PolicyManagementLoading />}>
      <PolicyManagementContent />
    </Suspense>
  );
}