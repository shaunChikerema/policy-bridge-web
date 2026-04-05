// src/app/dashboard/client-management/[id]/page.tsx
"use client";

import { useClients } from "@/hooks/useClients";
import { usePolicies } from "@/hooks/usePolicies";
import {
  AlertTriangle, ArrowLeft, Briefcase, Calendar,
  CheckCircle, Edit, Eye, Loader2, Mail, MapPin,
  Phone, Plus, Shield, Trash2, Users, X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// ── Brand palette ─────────────────────────────────────────────────────────────
const NAVY       = "#1B2B4B";
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

const policyStatusStyle = (status: string) => {
  switch (status) {
    case "active":   return { background: NAVY_MUTED, color: NAVY };
    case "pending":  return { background: "#FEF9C3", color: "#854D0E" };
    case "expired":  return { background: "#FEE2E2", color: "#991B1B" };
    case "suspended":return { background: "#FFEDD5", color: "#9A3412" };
    default:         return { background: "#F3F4F6", color: TEXT3 };
  }
};

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.id as string;
  const successMessage = searchParams.get("success");

  const { currentClient, fetchClient, deleteClient, loading, deleting, error, clearCurrentClient } = useClients();
  const { policies, fetchPolicies, loading: policiesLoading } = usePolicies();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (clientId) fetchClient(clientId);
    return () => clearCurrentClient();
  }, [clientId, fetchClient, clearCurrentClient]);

  useEffect(() => {
    if (clientId) {
      const sp = new URLSearchParams();
      sp.set("client_id", clientId);
      fetchPolicies(1, sp);
    }
  }, [clientId, fetchPolicies]);

  useEffect(() => {
    if (successMessage) {
      setShowSuccessAlert(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
      const t = setTimeout(() => setShowSuccessAlert(false), 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const clientPolicies = policies.filter(p => p.client_id === clientId);
  const clientStats = {
    totalPolicies: clientPolicies.length,
    totalPremium: clientPolicies.reduce((s, p) => s + (p.premium_amount || 0), 0),
    totalCoverage: clientPolicies.reduce((s, p) => s + (p.coverage_amount || 0), 0),
    activePolicies: clientPolicies.filter(p => p.status === "active").length,
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP" }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-BW", { year: "numeric", month: "long", day: "numeric" });
  const fmtShort = (d: string) => new Date(d).toLocaleDateString("en-BW", { month: "short", day: "numeric", year: "numeric" });
  const calcAge = (dob: string) => {
    const today = new Date(), birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleDelete = async () => {
    if (!currentClient) return;
    const ok = await deleteClient(currentClient.id);
    if (ok) { setShowDeleteModal(false); router.push("/dashboard/client-management?success=Client deleted successfully"); }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && !currentClient) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2.5px solid ${NAVY}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 14, color: TEXT3 }}>Loading client…</div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error && !currentClient) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <AlertTriangle style={{ width: 26, height: 26, color: "#DC2626" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT1, marginBottom: 6 }}>Client Not Found</div>
          <div style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>{error}</div>
          <button onClick={() => router.back()} style={{ padding: "10px 24px", background: NAVY, color: "#fff", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600 }}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!currentClient) return null;

  const initials = (currentClient.full_name || `${currentClient.first_name} ${currentClient.last_name}`)
    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const displayName = currentClient.full_name || `${currentClient.first_name || ""} ${currentClient.last_name || ""}`.trim();
  const color = avatarColor(displayName);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 80 }}>

      {/* ── Success toast ── */}
      {showSuccessAlert && successMessage && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50, maxWidth: 360, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle style={{ width: 18, height: 18, color: "#22C55E", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#166534", flex: 1 }}>{successMessage}</span>
          <button onClick={() => setShowSuccessAlert(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", padding: 0 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <button onClick={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: SURFACE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2, flexShrink: 0 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>

          {/* Avatar */}
          <div style={{ width: 52, height: 52, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials}
          </div>

          {/* Name + status */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px" }}>{displayName}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99,
                background: currentClient.is_active ? NAVY_MUTED : "#F3F4F6",
                color: currentClient.is_active ? NAVY : TEXT3,
              }}>
                {currentClient.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: TEXT3, marginTop: 2 }}>Client since {fmtDate(currentClient.created_at)}</div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => router.push(`/dashboard/client-management/${clientId}/edit`)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: NAVY, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Edit style={{ width: 14, height: 14 }} /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={typeof deleting === "string" && deleting === currentClient.id}
              style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF2F2", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#DC2626", opacity: typeof deleting === "string" && deleting === currentClient.id ? 0.5 : 1 }}>
              {typeof deleting === "string" && deleting === currentClient.id
                ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
                : <Trash2 style={{ width: 15, height: 15 }} />}
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 4px rgba(27,43,75,0.05)" }}>
          {[
            { label: "Policies", value: clientStats.totalPolicies },
            { label: "Active", value: clientStats.activePolicies },
            { label: "Premium", value: fmt(clientStats.totalPremium) },
            { label: "Coverage", value: fmt(clientStats.totalCoverage) },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ padding: "14px 12px", textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: TEXT3, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Info grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }} className="grid-cols-1 lg:grid-cols-2">

          {/* Personal */}
          <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 18px", boxShadow: "0 1px 4px rgba(27,43,75,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Personal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: Mail, label: "Email", value: currentClient.email },
                { icon: Phone, label: "Phone", value: currentClient.formatted_phone || currentClient.phone || "Not provided" },
                { icon: MapPin, label: "Address", value: currentClient.formatted_address || "Not provided" },
                {
                  icon: Calendar, label: "Date of Birth",
                  value: currentClient.date_of_birth
                    ? `${fmtDate(currentClient.date_of_birth)} · ${calcAge(currentClient.date_of_birth)} yrs`
                    : "Not provided"
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: NAVY_MUTED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: NAVY }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: TEXT3, marginBottom: 1 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT1 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employment */}
          <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 18px", boxShadow: "0 1px 4px rgba(27,43,75,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Employment</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: Briefcase, label: "Occupation", value: currentClient.occupation || "Not specified" },
                { icon: Users, label: "Employer", value: currentClient.employer || "Not specified" },
                {
                  icon: Shield, label: "Gender",
                  value: currentClient.gender
                    ? currentClient.gender.charAt(0).toUpperCase() + currentClient.gender.slice(1).replace("_", " ")
                    : "Not specified"
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: NAVY_MUTED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 14, height: 14, color: NAVY }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: TEXT3, marginBottom: 1 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT1 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes inline */}
            {currentClient.notes && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, color: TEXT3, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes</div>
                <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.5 }}>{currentClient.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Policies ── */}
        <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(27,43,75,0.05)" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
              Policies <span style={{ fontSize: 12, fontWeight: 500, color: TEXT3, marginLeft: 4 }}>({clientStats.totalPolicies})</span>
            </div>
            <button
              onClick={() => router.push(`/dashboard/policy-management/create?client_id=${clientId}`)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: NAVY, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus style={{ width: 14, height: 14 }} /> Add Policy
            </button>
          </div>

          {policiesLoading ? (
            <div style={{ padding: "36px", textAlign: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${NAVY}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, color: TEXT3 }}>Loading policies…</div>
            </div>
          ) : clientPolicies.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: NAVY_MUTED, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Shield style={{ width: 20, height: 20, color: NAVY }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1, marginBottom: 4 }}>No policies yet</div>
              <div style={{ fontSize: 13, color: TEXT3, marginBottom: 16 }}>Add the first policy for this client.</div>
              <button
                onClick={() => router.push(`/dashboard/policy-management/create?client_id=${clientId}`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: NAVY, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus style={{ width: 14, height: 14 }} /> Add First Policy
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {clientPolicies.map((policy, i) => (
                <div
                  key={policy.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px",
                    borderTop: i > 0 ? `1px solid ${BORDER}` : "none",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                  onClick={() => router.push(`/dashboard/policy-management/${policy.id}`)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = BG}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: NAVY_MUTED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Shield style={{ width: 15, height: 15, color: NAVY }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: TEXT1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{policy.policy_name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, flexShrink: 0, ...policyStatusStyle(policy.status) }}>
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT3 }}>
                      {policy.policy_number} · {policy.policy_type}
                      {policy.effective_date && policy.expiration_date && (
                        <> · {fmtShort(policy.effective_date)} – {fmtShort(policy.expiration_date)}</>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{fmt(policy.premium_amount)}</div>
                    <div style={{ fontSize: 11, color: TEXT3 }}>premium</div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => router.push(`/dashboard/policy-management/${policy.id}`)}
                      style={{ width: 30, height: 30, borderRadius: 8, background: NAVY_MUTED, border: "none", cursor: "pointer", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Eye style={{ width: 13, height: 13 }} />
                    </button>
                    <button onClick={() => router.push(`/dashboard/policy-management/${policy.id}/edit`)}
                      style={{ width: 30, height: 30, borderRadius: 8, background: "#F3F4F6", border: "none", cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Edit style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: SURFACE, borderRadius: 18, padding: 24, maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle style={{ width: 18, height: 18, color: "#DC2626" }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: TEXT1 }}>Delete Client</div>
                <div style={{ fontSize: 12, color: TEXT3 }}>This action cannot be undone</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: TEXT2, marginBottom: 20, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: TEXT1 }}>{displayName}</strong>? This will also remove all associated policies and data.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteModal(false)} disabled={typeof deleting === "string"}
                style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: SURFACE, fontSize: 13, fontWeight: 600, color: TEXT2, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={typeof deleting === "string"}
                style={{ padding: "9px 18px", borderRadius: 10, background: "#DC2626", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: typeof deleting === "string" ? 0.6 : 1 }}>
                {typeof deleting === "string" ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}