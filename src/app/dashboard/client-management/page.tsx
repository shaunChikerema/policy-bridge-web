"use client";

import { useClients } from "@/hooks/useClients";
import { ClientFilters } from "@/lib/types";
import { formatPhoneNumber } from "@/lib/validation/clients";
import {
  AlertCircle, ChevronLeft, ChevronRight, Edit, Eye,
  Plus, SlidersHorizontal, Trash2, Users, Grid, List,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const NAVY        = "#1B2B4B";
const ACCENT      = "#4A7FD4";
const SURFACE     = "#FFFFFF";
const BG          = "#F4F6FA";
const BORDER      = "#E2E6EF";
const TEXT1       = "#111827";
const TEXT2       = "#6B7280";
const TEXT3       = "#9CA3AF";
const NAVY_MUTED  = "rgba(27,43,75,0.08)";
const NAVY_LIGHT  = "#EEF1F7";

const AVATAR_COLORS = [
  "#1B2B4B","#2C3E63","#4A7FD4","#0F766E",
  "#7C3AED","#B45309","#BE123C","#065F46",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── Skeleton / Loading ─────────────────────────────────────────────────── */
function ClientManagementLoading() {
  return (
    <div style={{ padding: 16, background: BG, minHeight: "100vh" }}>
      <div style={{ height: 28, background: BORDER, borderRadius: 8, width: 140, marginBottom: 6 }} className="animate-pulse" />
      <div style={{ height: 14, background: BORDER, borderRadius: 8, width: 110, marginBottom: 20 }} className="animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 76, background: BORDER, borderRadius: 14, marginBottom: 8 }} className="animate-pulse" />
      ))}
    </div>
  );
}

/* ─── Avatar circle ──────────────────────────────────────────────────────── */
function Avatar({ name, size = 42, radius = 12 }: { name: string; size?: number; radius?: number }) {
  const initials = name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: avatarColor(name), flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 600, color: "#fff", letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────────────────── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10, fontWeight: 600,
      padding: "2px 8px", borderRadius: 99,
      background: active ? NAVY_MUTED : "#F3F4F6",
      color: active ? NAVY : TEXT3,
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ─── Icon button ────────────────────────────────────────────────────────── */
function IconBtn({
  icon, onClick, danger = false, disabled = false, title,
}: {
  icon: React.ReactNode; onClick: () => void;
  danger?: boolean; disabled?: boolean; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8, border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: danger ? "#FEF2F2" : "#F3F4F6",
        color: danger ? "#DC2626" : TEXT2,
        opacity: disabled ? 0.45 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

/* ─── Card (mobile + grid) ───────────────────────────────────────────────── */
function ClientCard({
  client, onView, onEdit, onDelete, deleting,
}: any) {
  return (
    <div
      onClick={() => onView(client.id)}
      style={{
        background: SURFACE, borderRadius: 14,
        border: `1px solid ${BORDER}`,
        padding: "13px 14px",
        display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer",
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
      <Avatar name={client.full_name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {client.full_name}
          </span>
        </div>
        <div style={{ fontSize: 12, color: TEXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {client.email}
        </div>
        <div style={{ marginTop: 4 }}>
          <StatusBadge active={client.is_active} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <IconBtn icon={<Edit style={{ width: 13, height: 13 }} />} onClick={() => onEdit(client.id)} title="Edit" />
        <IconBtn icon={<Trash2 style={{ width: 13, height: 13 }} />} onClick={() => onDelete(client.id)} danger disabled={deleting === client.id} title="Delete" />
      </div>
    </div>
  );
}

/* ─── Table row (desktop list view) ─────────────────────────────────────── */
function ClientTableRow({
  client, onView, onEdit, onDelete, deleting,
}: any) {
  return (
    <tr
      onClick={() => onView(client.id)}
      style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer", transition: "background 0.1s" }}
      onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = BG)}
      onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
    >
      <td style={{ padding: "13px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={client.full_name} size={34} radius={9} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>{client.full_name}</div>
            <div style={{ fontSize: 12, color: TEXT3 }}>{client.occupation || "—"}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT2 }}>
        <div>{client.email}</div>
        {client.phone && <div style={{ marginTop: 2, color: TEXT3 }}>{formatPhoneNumber(client.phone)}</div>}
      </td>
      <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT2 }}>{client.city || "—"}</td>
      <td style={{ padding: "13px 16px" }}>
        <StatusBadge active={client.is_active} />
      </td>
      <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT2 }}>
        {new Date(client.join_date).toLocaleDateString("en-BW")}
      </td>
      <td style={{ padding: "13px 16px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 5 }}>
          <IconBtn icon={<Eye style={{ width: 13, height: 13 }} />} onClick={() => onView(client.id)} title="View" />
          <IconBtn icon={<Edit style={{ width: 13, height: 13 }} />} onClick={() => onEdit(client.id)} title="Edit" />
          <IconBtn icon={<Trash2 style={{ width: 13, height: 13 }} />} onClick={() => onDelete(client.id)} danger disabled={deleting === client.id} title="Delete" />
        </div>
      </td>
    </tr>
  );
}

/* ─── Filter pill ────────────────────────────────────────────────────────── */
function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "6px 14px",
        borderRadius: 99,
        border: active ? "none" : `1px solid ${BORDER}`,
        background: active ? NAVY : SURFACE,
        color: active ? "#fff" : TEXT2,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );
}

/* ─── Main content ───────────────────────────────────────────────────────── */
function ClientManagementContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy,   setSortBy]   = useState<"date" | "name" | "income">("date");

  const parseStatus = (s: string | null): boolean | "all" =>
    s === "true" ? true : s === "false" ? false : "all";

  const [filters, setFiltersState] = useState<ClientFilters>({
    search:    searchParams.get("search") || "",
    is_active: parseStatus(searchParams.get("status")),
  });

  const {
    clients, currentPage, totalPages, totalCount,
    loading, deleting, error,
    fetchClients, deleteClient, setPage, setFilters, clearError,
  } = useClients(filters, 10);

  const successMessage = searchParams.get("success");

  /* derived stats */
  const stats = (() => {
    if (!clients.length) return null;
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const active   = clients.filter(c => c.is_active).length;
    const newMonth = clients.filter(c => {
      const d = new Date(c.join_date);
      return d.getMonth() === cm && d.getFullYear() === cy;
    }).length;
    return { total: clients.length, active, newMonth };
  })();

  /* handlers */
  const applyFilters = (patch: Partial<ClientFilters>) => {
    const f = { ...filters, ...patch } as ClientFilters;
    setFiltersState(f);
    setFilters(f);
  };

  const handleSearch = (v: string) => applyFilters({ search: v });
  const handleStatus = (v: "all" | "active" | "inactive") =>
    applyFilters({ is_active: v === "all" ? "all" : v === "active" });

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this client? This cannot be undone.")) {
      await deleteClient(id);
    }
  };

  const goTo = (path: string) => router.push(path);
  const getStatus = (): "all" | "active" | "inactive" =>
    filters.is_active === "all" ? "all" : filters.is_active === true ? "active" : "inactive";

  const sorted = [...clients].sort((a, b) =>
    sortBy === "name"   ? a.full_name.localeCompare(b.full_name)
    : sortBy === "income" ? (b.annual_income || 0) - (a.annual_income || 0)
    : new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
  );

  /* ── Error full-screen ───────────────────────────────────────────────── */
  if (error && !clients.length) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <AlertCircle style={{ width: 24, height: 24, color: "#DC2626" }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT1, marginBottom: 6 }}>Unable to load clients</div>
          <div style={{ fontSize: 13, color: TEXT2, marginBottom: 20 }}>{error}</div>
          <button
            onClick={() => { clearError(); fetchClients(); }}
            style={{ padding: "10px 24px", background: NAVY, color: "#fff", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ── Page ────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui,-apple-system,sans-serif", paddingBottom: 100 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px", margin: 0 }}>
              Clients
            </h1>
            {!loading && stats && (
              <p style={{ fontSize: 12, color: TEXT3, margin: "3px 0 0" }}>
                <span style={{ color: ACCENT, fontWeight: 600 }}>{stats.active} active</span>
                <span style={{ margin: "0 4px" }}>·</span>
                {stats.total} total
                {stats.newMonth > 0 && (
                  <>
                    <span style={{ margin: "0 4px" }}>·</span>
                    <span style={{ color: "#22C55E", fontWeight: 600 }}>+{stats.newMonth} this month</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Add client button */}
          <button
            onClick={() => goTo("/dashboard/client-management/new")}
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
            Add client
          </button>
        </div>

        {/* ── Success banner ───────────────────────────────────────────── */}
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

        {/* ── Search bar ───────────────────────────────────────────────── */}
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
            value={filters.search || ""}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search name, email, city…"
            style={{
              flex: 1, border: "none", background: "transparent",
              fontSize: 14, color: TEXT1, outline: "none",
            }}
          />
          {filters.search && (
            <button
              onClick={() => handleSearch("")}
              style={{ border: "none", background: "none", cursor: "pointer", color: TEXT3, padding: 0, display: "flex" }}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Filter pill row ──────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 7, marginBottom: 14,
          overflowX: "auto", paddingBottom: 2,
          /* hide scrollbar cross-browser */
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
          {(["all", "active", "inactive"] as const).map(v => (
            <FilterPill
              key={v}
              label={v === "all" ? "All clients" : v === "active" ? "Active" : "Inactive"}
              active={getStatus() === v}
              onClick={() => handleStatus(v)}
            />
          ))}

          {/* spacer */}
          <div style={{ flex: 1 }} />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              flexShrink: 0,
              padding: "6px 10px", borderRadius: 99,
              border: `1px solid ${BORDER}`, background: SURFACE,
              fontSize: 12, color: TEXT2, outline: "none", cursor: "pointer",
              appearance: "none", paddingRight: 24,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="date">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="income">Highest income</option>
          </select>

          {/* View toggle — desktop only */}
          <div
            className="hidden lg:flex"
            style={{ background: BG, borderRadius: 10, padding: 3, gap: 2, display: "flex" }}
          >
            {(["grid", "list"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: "none",
                  cursor: "pointer",
                  background: viewMode === mode ? SURFACE : "transparent",
                  color: viewMode === mode ? NAVY : TEXT3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "background 0.12s",
                }}
              >
                {mode === "grid"
                  ? <Grid style={{ width: 13, height: 13 }} />
                  : <List style={{ width: 13, height: 13 }} />
                }
              </button>
            ))}
          </div>
        </div>

        {/* ── Client list ──────────────────────────────────────────────── */}
        {loading && !clients.length ? (
          <div style={{ textAlign: "center", padding: "52px 0" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              border: `2px solid ${NAVY}`, borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 13, color: TEXT3 }}>Loading clients…</div>
          </div>

        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 20px", background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: NAVY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Users style={{ width: 20, height: 20, color: NAVY }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT1, marginBottom: 5 }}>No clients found</div>
            <div style={{ fontSize: 13, color: TEXT3 }}>
              {filters.search ? "Try adjusting your search or filters." : "Add your first client to get started."}
            </div>
          </div>

        ) : (
          <>
            {/* Mobile — always card stack */}
            <div className="lg:hidden" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.map(c => (
                <ClientCard
                  key={c.id} client={c}
                  onView={(id: string) => goTo(`/dashboard/client-management/${id}`)}
                  onEdit={(id: string) => goTo(`/dashboard/client-management/${id}/edit`)}
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              ))}
            </div>

            {/* Desktop — grid or list */}
            <div className="hidden lg:block">
              {viewMode === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {sorted.map(c => (
                    <ClientCard
                      key={c.id} client={c}
                      onView={(id: string) => goTo(`/dashboard/client-management/${id}`)}
                      onEdit={(id: string) => goTo(`/dashboard/client-management/${id}/edit`)}
                      onDelete={handleDelete}
                      deleting={deleting}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
                        {["Client", "Contact", "Location", "Status", "Joined", ""].map((h, i) => (
                          <th
                            key={i}
                            style={{
                              textAlign: "left", padding: "10px 16px",
                              fontSize: 10, fontWeight: 700, color: TEXT3,
                              textTransform: "uppercase", letterSpacing: "0.06em",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(c => (
                        <ClientTableRow
                          key={c.id} client={c}
                          onView={(id: string) => goTo(`/dashboard/client-management/${id}`)}
                          onEdit={(id: string) => goTo(`/dashboard/client-management/${id}/edit`)}
                          onDelete={handleDelete}
                          deleting={deleting}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: TEXT3 }}>
              {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${BORDER}`, background: SURFACE,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2,
                }}
              >
                <ChevronLeft style={{ width: 15, height: 15 }} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p =
                  totalPages <= 5         ? i + 1
                  : currentPage <= 3      ? i + 1
                  : currentPage >= totalPages - 2 ? totalPages - 4 + i
                  : currentPage - 2 + i;
                if (p < 1 || p > totalPages) return null;
                const active = p === currentPage;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: "none",
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: active ? NAVY : SURFACE,
                      color: active ? "#fff" : TEXT2,
                      outline: active ? "none" : `1px solid ${BORDER}`,
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${BORDER}`, background: SURFACE,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2,
                }}
              >
                <ChevronRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page export ────────────────────────────────────────────────────────── */
export default function ClientManagementPage() {
  return (
    <Suspense fallback={<ClientManagementLoading />}>
      <ClientManagementContent />
    </Suspense>
  );
}