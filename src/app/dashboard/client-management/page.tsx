"use client";

import { useClients } from "@/hooks/useClients";
import { ClientFilters } from "@/lib/types";
import { formatPhoneNumber } from "@/lib/validation/clients";
import {
  AlertCircle, ChevronLeft, ChevronRight, Edit, Eye,
  Plus, Search, Trash2, Users, Download, Upload, Grid, List,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const NAVY       = "#1B2B4B";
const NAVY_MED   = "#2C3E63";
const NAVY_MUTED = "rgba(27,43,75,0.08)";
const NAVY_LIGHT = "#EEF1F7";
const ACCENT     = "#4A7FD4";
const SURFACE    = "#FFFFFF";
const BG         = "#F4F6FA";
const BORDER     = "#E2E6EF";
const TEXT1      = "#111827";
const TEXT2      = "#6B7280";
const TEXT3      = "#9CA3AF";

const AVATAR_COLORS = [
  "#1B2B4B", "#2C3E63", "#4A7FD4", "#0F766E", "#7C3AED", "#B45309", "#BE123C", "#065F46",
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function ClientManagementLoading() {
  return (
    <div style={{ padding: 16, background: BG, minHeight: "100vh" }}>
      <div style={{ height: 28, background: BORDER, borderRadius: 8, width: 160, marginBottom: 8 }} className="animate-pulse" />
      <div style={{ height: 16, background: BORDER, borderRadius: 8, width: 120, marginBottom: 20 }} className="animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 80, background: BORDER, borderRadius: 14, marginBottom: 10 }} className="animate-pulse" />
      ))}
    </div>
  );
}

function ClientCard({ client, onView, onEdit, onDelete, deleting }: any) {
  const initials = `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`.toUpperCase();
  const color = avatarColor(client.full_name);

  return (
    <div
      onClick={() => onView(client.id)}
      style={{
        background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`,
        padding: "16px", boxShadow: "0 1px 4px rgba(27,43,75,0.06)",
        display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(27,43,75,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(27,43,75,0.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 14, background: color, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.02em",
      }}>
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 650, color: TEXT1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {client.full_name}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, flexShrink: 0,
            background: client.is_active ? NAVY_MUTED : "#F3F4F6",
            color: client.is_active ? NAVY : TEXT3,
          }}>
            {client.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div style={{ fontSize: 12, color: TEXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.email}</div>
        {client.city && <div style={{ fontSize: 11, color: TEXT3, marginTop: 2 }}>{client.city}</div>}
      </div>

      <div style={{ display: "flex", gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onEdit(client.id)} title="Edit"
          style={{ width: 32, height: 32, borderRadius: 9, background: "#F3F4F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2 }}>
          <Edit style={{ width: 14, height: 14 }} />
        </button>
        <button onClick={() => onDelete(client.id)} disabled={deleting === client.id} title="Delete"
          style={{ width: 32, height: 32, borderRadius: 9, background: "#FEF2F2", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#DC2626", opacity: deleting === client.id ? 0.5 : 1 }}>
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

function ClientTableRow({ client, onView, onEdit, onDelete, deleting }: any) {
  const initials = `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`.toUpperCase();
  const color = avatarColor(client.full_name);
  return (
    <tr
      onClick={() => onView(client.id)}
      style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer", transition: "background 0.1s" }}
      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = BG}
      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
    >
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>{client.full_name}</div>
            <div style={{ fontSize: 12, color: TEXT3 }}>{client.occupation || "—"}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "14px 16px", fontSize: 13, color: TEXT2 }}>
        <div>{client.email}</div>
        {client.phone && <div style={{ marginTop: 2, color: TEXT3 }}>{formatPhoneNumber(client.phone)}</div>}
      </td>
      <td style={{ padding: "14px 16px", fontSize: 13, color: TEXT2 }}>{client.city || "—"}</td>
      <td style={{ padding: "14px 16px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: client.is_active ? NAVY_MUTED : "#F3F4F6", color: client.is_active ? NAVY : TEXT3 }}>
          {client.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td style={{ padding: "14px 16px", fontSize: 13, color: TEXT2 }}>{new Date(client.join_date).toLocaleDateString("en-BW")}</td>
      <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onView(client.id)} style={{ width: 30, height: 30, borderRadius: 8, background: NAVY_MUTED, border: "none", cursor: "pointer", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}><Eye style={{ width: 14, height: 14 }} /></button>
          <button onClick={() => onEdit(client.id)} style={{ width: 30, height: 30, borderRadius: 8, background: "#F3F4F6", border: "none", cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center" }}><Edit style={{ width: 14, height: 14 }} /></button>
          <button onClick={() => onDelete(client.id)} disabled={deleting === client.id} style={{ width: 30, height: 30, borderRadius: 8, background: "#FEF2F2", border: "none", cursor: "pointer", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", opacity: deleting === client.id ? 0.5 : 1 }}><Trash2 style={{ width: 14, height: 14 }} /></button>
        </div>
      </td>
    </tr>
  );
}

function ClientManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "premium">("date");

  const parseStatus = (s: string | null): boolean | "all" =>
    s === "true" ? true : s === "false" ? false : "all";

  const [filters, setFiltersState] = useState<ClientFilters>({
    search: searchParams.get("search") || "",
    is_active: parseStatus(searchParams.get("status")),
  });

  const { clients, stats, currentPage, totalPages, totalCount, loading, deleting, error, fetchClients, deleteClient, setPage, setFilters, clearError } = useClients(filters, 8);
  const successMessage = searchParams.get("success");

  const realStats = (() => {
    if (!clients.length) return null;
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const active = clients.filter(c => c.is_active).length;
    const newMonth = clients.filter(c => { const d = new Date(c.join_date); return d.getMonth() === cm && d.getFullYear() === cy; }).length;
    return { total: clients.length, active, newMonth, activePct: Math.round((active / clients.length) * 100) };
  })();

  const handleSearch = (v: string) => { const f = { ...filters, search: v }; setFiltersState(f); setFilters(f); };
  const handleStatus = (v: string) => { const f = { ...filters, is_active: v === "all" ? "all" : v === "active" ? true : false }; setFiltersState(f as ClientFilters); setFilters(f as ClientFilters); };
  const handleDelete = async (id: string) => { if (window.confirm("Delete this client? This cannot be undone.")) await deleteClient(id); };
  const getStatusVal = () => filters.is_active === "all" ? "all" : filters.is_active === true ? "active" : "inactive";

  const sorted = [...clients].sort((a, b) =>
    sortBy === "name" ? a.full_name.localeCompare(b.full_name)
    : sortBy === "premium" ? (b.annual_income || 0) - (a.annual_income || 0)
    : new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
  );

  if (error && !clients.length) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <AlertCircle style={{ width: 26, height: 26, color: "#DC2626" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT1, marginBottom: 6 }}>Unable to Load Clients</div>
          <div style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>{error}</div>
          <button onClick={() => { clearError(); fetchClients(); }} style={{ padding: "10px 24px", background: NAVY, color: "#fff", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600 }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 100 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px" }}>Clients</div>
            {!loading && realStats && (
              <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>
                <span style={{ color: ACCENT, fontWeight: 600 }}>{realStats.active} active</span>
                <span style={{ margin: "0 5px" }}>·</span>
                {realStats.total} total
                {realStats.newMonth > 0 && <>
                  <span style={{ margin: "0 5px" }}>·</span>
                  <span style={{ color: "#22C55E", fontWeight: 600 }}>+{realStats.newMonth} this month</span>
                </>}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: SURFACE, fontSize: 12, color: TEXT2, cursor: "pointer", fontWeight: 500 }}>
              <Upload style={{ width: 13, height: 13 }} /> Import
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: SURFACE, fontSize: 12, color: TEXT2, cursor: "pointer", fontWeight: 500 }}>
              <Download style={{ width: 13, height: 13 }} /> Export
            </button>
          </div>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 20 20" fill="white"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#166534" }}>{successMessage}</span>
          </div>
        )}

        {/* Search + filters */}
        <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "12px 14px", marginBottom: 14, boxShadow: "0 1px 4px rgba(27,43,75,0.05)" }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: TEXT3 }} />
            <input
              type="text" value={filters.search || ""} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, email or city…"
              style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, color: TEXT1, background: BG, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => (e.target.style.borderColor = ACCENT)}
              onBlur={e => (e.target.style.borderColor = BORDER)}
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={getStatusVal()} onChange={e => handleStatus(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT2, background: SURFACE, outline: "none" }}>
              <option value="all">All clients</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT2, background: SURFACE, outline: "none" }}>
              <option value="date">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="premium">Highest income</option>
            </select>
            <div className="hidden lg:flex" style={{ display: "flex", background: BG, borderRadius: 10, padding: 3, gap: 2 }}>
              <button onClick={() => setViewMode("grid")} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: viewMode === "grid" ? SURFACE : "transparent", color: viewMode === "grid" ? NAVY : TEXT3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
                <Grid style={{ width: 14, height: 14 }} />
              </button>
              <button onClick={() => setViewMode("list")} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: viewMode === "list" ? SURFACE : "transparent", color: viewMode === "list" ? NAVY : TEXT3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
                <List style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Client list */}
        {loading && !clients.length ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${NAVY}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 13, color: TEXT3 }}>Loading clients…</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 20px", background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: NAVY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Users style={{ width: 22, height: 22, color: NAVY }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT1, marginBottom: 5 }}>No clients found</div>
            <div style={{ fontSize: 13, color: TEXT3 }}>{filters.search ? "Try adjusting your search or filters." : "Add your first client to get started."}</div>
          </div>
        ) : (
          <>
            <div className="lg:hidden" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.map(c => (
                <ClientCard key={c.id} client={c}
                  onView={(id: string) => router.push(`/dashboard/client-management/${id}`)}
                  onEdit={(id: string) => router.push(`/dashboard/client-management/${id}/edit`)}
                  onDelete={handleDelete} deleting={deleting} />
              ))}
            </div>
            <div className="hidden lg:block">
              {viewMode === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {sorted.map(c => (
                    <ClientCard key={c.id} client={c}
                      onView={(id: string) => router.push(`/dashboard/client-management/${id}`)}
                      onEdit={(id: string) => router.push(`/dashboard/client-management/${id}/edit`)}
                      onDelete={handleDelete} deleting={deleting} />
                  ))}
                </div>
              ) : (
                <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
                        {["Client", "Contact", "Location", "Status", "Joined", "Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 10, fontWeight: 700, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(c => (
                        <ClientTableRow key={c.id} client={c}
                          onView={(id: string) => router.push(`/dashboard/client-management/${id}`)}
                          onEdit={(id: string) => router.push(`/dashboard/client-management/${id}/edit`)}
                          onDelete={handleDelete} deleting={deleting} />
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
              {(currentPage - 1) * 8 + 1}–{Math.min(currentPage * 8, totalCount)} of {totalCount}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: SURFACE, cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2 }}>
                <ChevronLeft style={{ width: 15, height: 15 }} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                if (p > totalPages || p < 1) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: p === currentPage ? NAVY : SURFACE, color: p === currentPage ? "#fff" : TEXT2, outline: p === currentPage ? "none" : `1.5px solid ${BORDER}` }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}
                style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: SURFACE, cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2 }}>
                <ChevronRight style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push("/dashboard/client-management/new")}
        style={{
          position: "fixed", bottom: 80, right: 20, zIndex: 50,
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 20px", borderRadius: 99,
          background: NAVY, color: "#fff", border: "none",
          boxShadow: "0 4px 20px rgba(27,43,75,0.35)",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(27,43,75,0.4)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(27,43,75,0.35)";
        }}
      >
        <Plus style={{ width: 18, height: 18 }} />
        Add Client
      </button>
    </div>
  );
}

export default function ClientManagementPage() {
  return (
    <Suspense fallback={<ClientManagementLoading />}>
      <ClientManagementContent />
    </Suspense>
  );
}