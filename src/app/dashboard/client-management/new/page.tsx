"use client";

import { useClients } from "@/hooks/useClients";
import { ClientFormData, ClientFormErrors } from "@/lib/types";
import {
  cleanClientFormData,
  hasValidationErrors,
  validateClientForm,
} from "@/lib/validation/clients";
import {
  AlertCircle, ArrowLeft, Briefcase, Calendar,
  Check, CheckCircle, ChevronLeft, ChevronRight,
  Mail, MapPin, Phone, Save, User, UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const NAVY         = "#1B2B4B";
const NAVY_LIGHT   = "#EEF1F7";
const NAVY_MUTED   = "rgba(27,43,75,0.08)";
const SURFACE      = "#FFFFFF";
const BG           = "#F4F6FA";
const BORDER       = "#E2E6EF";
const TEXT1        = "#111827";
const TEXT2        = "#6B7280";
const TEXT3        = "#9CA3AF";
const ERROR        = "#DC2626";
const ERROR_BG     = "#FEF2F2";
const ERROR_BORDER = "#FECACA";

const INITIAL: ClientFormData = {
  first_name: "", last_name: "", email: "", phone: "",
  date_of_birth: "", gender: "",
  address_line1: "", address_line2: "", city: "", state: "",
  postal_code: "", country: "BW",
  occupation: "", employer: "", annual_income: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  emergency_contact_relationship: "",
  notes: "", tags: [], is_active: true,
};

const STEPS = [
  { id: 1, title: "Personal", icon: User   },
  { id: 2, title: "Details",  icon: MapPin },
];

/* ─── Field components ───────────────────────────────────────────────────── */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {children}{required && <span style={{ color: ERROR, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
      <AlertCircle style={{ width: 12, height: 12, color: ERROR, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: ERROR }}>{msg}</span>
    </div>
  );
}

function baseInput(err: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "12px 13px", borderRadius: 10,
    border: `1.5px solid ${err ? ERROR_BORDER : BORDER}`,
    background: err ? ERROR_BG : SURFACE,
    fontSize: 14, color: TEXT1, outline: "none",
    transition: "border-color 0.15s", boxSizing: "border-box",
  };
}

function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT3, display: "flex", pointerEvents: "none" }}>
        {icon}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {children}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function NewClientPage() {
  const router = useRouter();
  const { createClient, creating, error } = useClients();

  const [step,        setStep]        = useState(1);
  const [form,        setForm]        = useState<ClientFormData>(INITIAL);
  const [errors,      setErrors]      = useState<ClientFormErrors>({});
  const [touched,     setTouched]     = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const set = (field: keyof ClientFormData, value: string | boolean | string[]) => {
    setForm(p => ({ ...p, [field]: value }));
    setTouched(p => ({ ...p, [field]: true }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const blur = (field: keyof ClientFormData) => {
    setTouched(p => ({ ...p, [field]: true }));
    const errs = validateClientForm(cleanClientFormData(form));
    if (errs[field]) setErrors(p => ({ ...p, [field]: errs[field] }));
  };

  const fieldErr = (f: keyof ClientFormErrors) => touched[f] ? errors[f] : undefined;

  const STEP1_FIELDS: (keyof ClientFormErrors)[] = ["first_name", "last_name", "email"];

  const validateStep1 = () => {
    const errs = validateClientForm(cleanClientFormData(form));
    const stepErrs: ClientFormErrors = {};
    STEP1_FIELDS.forEach(f => { if (errs[f]) stepErrs[f] = errs[f]; });
    const newTouched = { ...touched };
    STEP1_FIELDS.forEach(f => { newTouched[f] = true; });
    setTouched(newTouched);
    if (Object.keys(stepErrs).length > 0) { setErrors(p => ({ ...p, ...stepErrs })); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };
  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanClientFormData(form);
    const valErrors = validateClientForm(clean);
    if (hasValidationErrors(valErrors)) {
      setErrors(valErrors);
      const allTouched: Record<string, boolean> = {};
      Object.keys(clean).forEach(k => { allTouched[k] = true; });
      setTouched(allTouched);
      return;
    }
    setErrors({});
    try {
      const newClient = await createClient(clean);
      if (newClient) {
        setShowSuccess(true);
        setTimeout(() => router.push(`/dashboard/client-management/${newClient.id}?success=Client created successfully`), 1800);
      }
    } catch (e) { console.error(e); }
  };

  const handleCancel = useCallback(() => {
    const dirty = Object.keys(form).some(k => form[k as keyof ClientFormData] !== INITIAL[k as keyof ClientFormData]);
    if (dirty && !window.confirm("You have unsaved changes. Leave?")) return;
    router.back();
  }, [form, router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); handleCancel(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleCancel]);

  const iconSz = { width: 15, height: 15 };
  const progress = (step / STEPS.length) * 100;

  /* ── Success overlay ─────────────────────────────────────────────────── */
  if (showSuccess) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
        <div style={{ background: SURFACE, borderRadius: 20, padding: 36, maxWidth: 300, width: "100%", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: NAVY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle style={{ width: 28, height: 28, color: NAVY }} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, color: TEXT1, marginBottom: 6 }}>Client Created!</div>
          <div style={{ fontSize: 13, color: TEXT2 }}>Redirecting to their profile…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "13px 16px" }}>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <button onClick={handleCancel}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2 }}>
                <ArrowLeft style={{ width: 17, height: 17 }} />
              </button>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>New Client</div>
                <div style={{ fontSize: 11, color: TEXT3 }}>Step {step} of {STEPS.length}</div>
              </div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: NAVY_MUTED, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserPlus style={{ width: 16, height: 16, color: NAVY }} />
            </div>
          </div>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const done    = s.id < step;
              const current = s.id === step;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => done && setStep(s.id)}
                    disabled={!done}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: done ? "pointer" : "default" }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: done || current ? NAVY : NAVY_LIGHT,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: current ? "scale(1.08)" : "scale(1)",
                      transition: "all 0.2s", flexShrink: 0,
                    }}>
                      {done
                        ? <Check style={{ width: 14, height: 14, color: "#fff" }} />
                        : <Icon style={{ width: 14, height: 14, color: current ? "#fff" : TEXT3 }} />
                      }
                    </div>
                    <span style={{ fontSize: 12, fontWeight: current ? 700 : 500, color: current ? NAVY : done ? TEXT2 : TEXT3 }}>
                      {s.title}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1.5, background: done ? NAVY : BORDER, margin: "0 10px", transition: "background 0.3s" }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 12, height: 2.5, background: BORDER, borderRadius: 99 }}>
            <div style={{ height: "100%", background: NAVY, borderRadius: 99, width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>
        </div>
      </header>

      {/* ── API error ─────────────────────────────────────────────────── */}
      {error && (
        <div style={{ maxWidth: 560, margin: "12px auto 0", padding: "0 16px" }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: ERROR_BG, border: `1px solid ${ERROR_BORDER}`, display: "flex", gap: 10 }}>
            <AlertCircle style={{ width: 16, height: 16, color: ERROR, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: ERROR }}>Unable to create client</div>
              <div style={{ fontSize: 13, color: "#7f1d1d", marginTop: 2 }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "16px 16px 160px" }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 1px 6px rgba(27,43,75,0.06)" }}>

            {/* ── Step 1: Personal ───────────────────────────────────── */}
            {step === 1 && (
              <>
                <Row>
                  <div>
                    <Label required>First name</Label>
                    <input type="text" value={form.first_name} autoFocus autoComplete="given-name" maxLength={50}
                      onChange={e => set("first_name", e.target.value)}
                      onBlur={() => blur("first_name")}
                      style={baseInput(Boolean(fieldErr("first_name")))}
                      placeholder="First name" />
                    <FieldError msg={fieldErr("first_name")} />
                  </div>
                  <div>
                    <Label required>Last name</Label>
                    <input type="text" value={form.last_name} autoComplete="family-name" maxLength={50}
                      onChange={e => set("last_name", e.target.value)}
                      onBlur={() => blur("last_name")}
                      style={baseInput(Boolean(fieldErr("last_name")))}
                      placeholder="Last name" />
                    <FieldError msg={fieldErr("last_name")} />
                  </div>
                </Row>

                <div>
                  <Label required>Email</Label>
                  <IconInput icon={<Mail style={iconSz} />}>
                    <input type="email" value={form.email} autoComplete="email" maxLength={100}
                      onChange={e => set("email", e.target.value.toLowerCase())}
                      onBlur={() => blur("email")}
                      style={{ ...baseInput(Boolean(fieldErr("email"))), paddingLeft: 38 }}
                      placeholder="you@example.com" />
                  </IconInput>
                  <FieldError msg={fieldErr("email")} />
                </div>

                <div>
                  <Label>Phone</Label>
                  <IconInput icon={<Phone style={iconSz} />}>
                    <input type="tel" value={form.phone} autoComplete="tel" maxLength={20}
                      onChange={e => set("phone", e.target.value)}
                      style={{ ...baseInput(false), paddingLeft: 38 }}
                      placeholder="+267 7123 4567" />
                  </IconInput>
                </div>

                <Row>
                  <div>
                    <Label>Date of birth</Label>
                    <IconInput icon={<Calendar style={iconSz} />}>
                      <input type="date" value={form.date_of_birth}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={e => set("date_of_birth", e.target.value)}
                        style={{ ...baseInput(false), paddingLeft: 38, width: "100%" }} />
                    </IconInput>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select value={form.gender} onChange={e => set("gender", e.target.value)}
                      style={{ ...baseInput(false), appearance: "none", cursor: "pointer" }}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </Row>
              </>
            )}

            {/* ── Step 2: Details ────────────────────────────────────── */}
            {step === 2 && (
              <>
                <Row>
                  <div>
                    <Label>City</Label>
                    <IconInput icon={<MapPin style={iconSz} />}>
                      <input type="text" value={form.city} autoFocus autoComplete="address-level2" maxLength={50}
                        onChange={e => set("city", e.target.value)}
                        style={{ ...baseInput(false), paddingLeft: 38 }}
                        placeholder="City" />
                    </IconInput>
                  </div>
                  <div>
                    <Label>Country</Label>
                    <select value={form.country} autoComplete="country"
                      onChange={e => set("country", e.target.value)}
                      style={{ ...baseInput(false), appearance: "none", cursor: "pointer" }}>
                      <option value="BW">Botswana</option>
                      <option value="ZA">South Africa</option>
                      <option value="ZW">Zimbabwe</option>
                      <option value="NA">Namibia</option>
                      <option value="ZM">Zambia</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </Row>

                <div>
                  <Label>Occupation</Label>
                  <IconInput icon={<Briefcase style={iconSz} />}>
                    <input type="text" value={form.occupation} autoComplete="organization-title" maxLength={100}
                      onChange={e => set("occupation", e.target.value)}
                      style={{ ...baseInput(false), paddingLeft: 38 }}
                      placeholder="e.g. Accountant" />
                  </IconInput>
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea value={form.notes} rows={3} maxLength={500}
                    onChange={e => set("notes", e.target.value)}
                    style={{ ...baseInput(false), resize: "none", lineHeight: 1.55 }}
                    placeholder="Any additional notes…" />
                  <div style={{ fontSize: 11, color: TEXT3, textAlign: "right", marginTop: 3 }}>{form.notes.length}/500</div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => set("is_active", e.target.checked)}
                    style={{ width: 17, height: 17, accentColor: NAVY, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>Mark as active</div>
                    <div style={{ fontSize: 12, color: TEXT3 }}>Active clients appear in your main list</div>
                  </div>
                </label>
              </>
            )}

          </div>
        </form>
      </main>

      {/* ── Fixed footer ──────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
        background: SURFACE, borderTop: `1px solid ${BORDER}`,
        padding: "12px 16px",
        paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
        boxShadow: "0 -4px 20px rgba(27,43,75,0.07)",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 10 }}>
          {step === 1 ? (
            <>
              <button type="button" onClick={handleCancel}
                style={{ flex: 1, height: 46, borderRadius: 12, border: `1.5px solid ${BORDER}`, background: SURFACE, fontSize: 14, fontWeight: 600, color: TEXT2, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleNext}
                style={{ flex: 2, height: 46, borderRadius: 12, border: "none", background: NAVY, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                Next <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleBack}
                style={{ flex: 1, height: 46, borderRadius: 12, border: `1.5px solid ${BORDER}`, background: SURFACE, fontSize: 14, fontWeight: 600, color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <ChevronLeft style={{ width: 16, height: 16 }} /> Back
              </button>
              <button type="submit" disabled={creating} onClick={handleSubmit}
                style={{ flex: 2, height: 46, borderRadius: 12, border: "none", background: creating ? TEXT3 : NAVY, color: "#fff", fontSize: 14, fontWeight: 600, cursor: creating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}>
                {creating
                  ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} /> Saving…</>
                  : <><Save style={{ width: 15, height: 15 }} /> Save Client</>
                }
              </button>
            </>
          )}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}