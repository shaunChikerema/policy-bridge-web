//src\app\dashboard\client-management\new\page.tsx
"use client";

import { useClients } from "@/hooks/useClients";
import { ClientFormData, ClientFormErrors } from "@/lib/types";
import {
  cleanClientFormData,
  hasValidationErrors,
  validateClientForm,
} from "@/lib/validation/clients";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

// ── Brand palette ────────────────────────────────────────────────────────────
const NAVY       = "#1B2B4B";
const NAVY_MED   = "#2C3E63";
const NAVY_LIGHT = "#EEF1F7";
const NAVY_MUTED = "rgba(27,43,75,0.08)";
const SURFACE    = "#FFFFFF";
const BG         = "#F4F6FA";
const BORDER     = "#E2E6EF";
const TEXT1      = "#111827";
const TEXT2      = "#6B7280";
const TEXT3      = "#9CA3AF";
const ERROR      = "#DC2626";
const ERROR_BG   = "#FEF2F2";
const ERROR_BORDER = "#FECACA";

const INITIAL_FORM_DATA: ClientFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "BW",
  occupation: "",
  employer: "",
  annual_income: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  notes: "",
  tags: [],
  is_active: true,
};

const STEPS = [
  {
    id: 1,
    title: "Personal",
    icon: User,
    fields: ["first_name", "last_name", "email", "phone", "date_of_birth", "gender"],
  },
  {
    id: 2,
    title: "Address",
    icon: MapPin,
    fields: ["address_line1", "city", "state", "country", "occupation", "employer"],
  },
  {
    id: 3,
    title: "Emergency",
    icon: Phone,
    fields: ["emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship", "notes"],
  },
];

// ── Shared field components ───────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT2, marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" as const }}>
      {children}{required && <span style={{ color: ERROR, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
      <AlertCircle style={{ width: 13, height: 13, color: ERROR, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: ERROR }}>{message}</span>
    </div>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${hasError ? ERROR_BORDER : BORDER}`,
    background: hasError ? ERROR_BG : SURFACE,
    fontSize: 15,
    color: TEXT1,
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box" as const,
  };
}

function iconInputStyle(hasError: boolean): React.CSSProperties {
  return { ...inputStyle(hasError), paddingLeft: 42 };
}

function selectStyle(hasError: boolean): React.CSSProperties {
  return { ...inputStyle(hasError), appearance: "none" as const, cursor: "pointer" };
}

function InputWrapper({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: TEXT3, display: "flex", pointerEvents: "none" as const }}>
        {icon}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, textTransform: "uppercase" as const, letterSpacing: "0.08em", paddingBottom: 10, borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>
      {children}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewClientPage() {
  const router = useRouter();
  const { createClient, creating, error } = useClients();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClientFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleInputChange = (field: keyof ClientFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field: keyof ClientFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const cleanData = cleanClientFormData(formData);
    const fieldErrors = validateClientForm(cleanData);
    if (fieldErrors[field]) setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const validateCurrentStep = useCallback(() => {
    const stepConfig = STEPS.find((s) => s.id === currentStep);
    if (!stepConfig) return true;
    const cleanData = cleanClientFormData(formData);
    const allErrors = validateClientForm(cleanData);
    const stepErrors: ClientFormErrors = {};
    stepConfig.fields.forEach((f) => {
      if (allErrors[f as keyof ClientFormErrors]) stepErrors[f as keyof ClientFormErrors] = allErrors[f as keyof ClientFormErrors];
    });
    const newTouched = { ...touched };
    stepConfig.fields.forEach((f) => { newTouched[f] = true; });
    setTouched(newTouched);
    if (Object.keys(stepErrors).length > 0) { setErrors((p) => ({ ...p, ...stepErrors })); return false; }
    return true;
  }, [currentStep, formData, touched]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps((p) => new Set([...p, currentStep]));
      if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleStepClick = (n: number) => {
    if (n < currentStep || (n === currentStep + 1 && validateCurrentStep())) {
      if (n === currentStep + 1) setCompletedSteps((p) => new Set([...p, currentStep]));
      setCurrentStep(n);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);
    const cleanData = cleanClientFormData(formData);
    const validationErrors = validateClientForm(cleanData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      const tf: Record<string, boolean> = {};
      Object.keys(cleanData).forEach((k) => { tf[k] = true; });
      setTouched(tf);
      for (const step of STEPS) {
        if (step.fields.some((f) => validationErrors[f as keyof ClientFormErrors])) { setCurrentStep(step.id); break; }
      }
      return;
    }
    setErrors({});
    try {
      const newClient = await createClient(cleanData);
      if (newClient) {
        setShowSuccess(true);
        setTimeout(() => router.push(`/dashboard/client-management/${newClient.id}?success=Client created successfully`), 2000);
      }
    } catch (err) { console.error("Error creating client:", err); }
  };

  const handleCancel = useCallback(() => {
    const hasChanges = Object.keys(formData).some((k) => formData[k as keyof ClientFormData] !== INITIAL_FORM_DATA[k as keyof ClientFormData]);
    if (hasChanges && !window.confirm("You have unsaved changes. Leave?")) return;
    router.back();
  }, [formData, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (currentStep === STEPS.length) {
          document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        } else if (validateCurrentStep()) {
          setCompletedSteps((p) => new Set([...p, currentStep]));
          if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
        }
      } else if (e.key === "Escape") { e.preventDefault(); handleCancel(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentStep, handleCancel, validateCurrentStep]);

  const progress = (currentStep / STEPS.length) * 100;

  // ── Success overlay ───────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
        <div style={{ background: SURFACE, borderRadius: 20, padding: 36, maxWidth: 320, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: NAVY_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle style={{ width: 30, height: 30, color: NAVY }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: TEXT1, marginBottom: 8 }}>Client Created!</h3>
          <p style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>Successfully added to your portfolio</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${NAVY}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── Header (sticky, z-20 — above fixed bottom nav) ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={handleCancel} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: TEXT2 }}>
                <ArrowLeft style={{ width: 18, height: 18 }} />
              </button>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>New Client</div>
                <div style={{ fontSize: 12, color: TEXT3 }}>Step {currentStep} of {STEPS.length}</div>
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: NAVY_MUTED, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserPlus style={{ width: 17, height: 17, color: NAVY }} />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 12, height: 3, background: BORDER, borderRadius: 99 }}>
            <div style={{ height: "100%", background: NAVY, borderRadius: 99, width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Step indicators — inside sticky header, so they never get covered by bottom nav */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 20px 14px" }}>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = step.id <= currentStep || completedSteps.has(step.id);
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAccessible}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: isAccessible ? "pointer" : "default", opacity: isAccessible ? 1 : 0.4, background: "none", border: "none", padding: 0 }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: isCompleted || isCurrent ? NAVY : NAVY_LIGHT,
                    border: isCurrent ? `2px solid ${NAVY}` : "2px solid transparent",
                    transform: isCurrent ? "scale(1.08)" : "scale(1)",
                    transition: "all 0.2s",
                  }}>
                    {isCompleted
                      ? <Check style={{ width: 16, height: 16, color: "#fff" }} />
                      : <Icon style={{ width: 16, height: 16, color: isCurrent ? "#fff" : TEXT3 }} />
                    }
                  </div>
                  <span style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? NAVY : isCompleted ? NAVY_MED : TEXT3 }}>
                    {step.title}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1.5, background: completedSteps.has(step.id) ? NAVY : BORDER, margin: "0 8px", marginBottom: 20, transition: "background 0.3s" }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>

      {/* ── Error alert ── */}
      {error && (
        <div style={{ margin: "12px 16px 0", padding: "12px 14px", borderRadius: 12, background: ERROR_BG, border: `1px solid ${ERROR_BORDER}`, display: "flex", gap: 10 }}>
          <AlertCircle style={{ width: 16, height: 16, color: ERROR, flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: ERROR }}>Unable to create client</div>
            <div style={{ fontSize: 13, color: "#7f1d1d", marginTop: 2 }}>{error}</div>
          </div>
        </div>
      )}

      {/* ── Form — pb ensures content clears the fixed bottom bar ── */}
      <main style={{ padding: "16px 16px 180px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 1px 6px rgba(27,43,75,0.06)" }}>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
                <SectionTitle>Personal Information</SectionTitle>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <FieldLabel required>First Name</FieldLabel>
                    <input type="text" name="first_name" value={formData.first_name} autoFocus maxLength={50} autoComplete="given-name"
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      onBlur={() => handleBlur("first_name")}
                      style={inputStyle(Boolean(errors.first_name && touched.first_name))}
                      placeholder="First name" />
                    <FieldError message={touched.first_name ? errors.first_name : undefined} />
                  </div>
                  <div>
                    <FieldLabel required>Last Name</FieldLabel>
                    <input type="text" name="last_name" value={formData.last_name} maxLength={50} autoComplete="family-name"
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      onBlur={() => handleBlur("last_name")}
                      style={inputStyle(Boolean(errors.last_name && touched.last_name))}
                      placeholder="Last name" />
                    <FieldError message={touched.last_name ? errors.last_name : undefined} />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <InputWrapper icon={<Mail style={{ width: 16, height: 16 }} />}>
                    <input type="email" name="email" value={formData.email} maxLength={100} autoComplete="email"
                      onChange={(e) => handleInputChange("email", e.target.value.toLowerCase())}
                      onBlur={() => handleBlur("email")}
                      style={iconInputStyle(Boolean(errors.email && touched.email))}
                      placeholder="you@example.com" />
                  </InputWrapper>
                  <FieldError message={touched.email ? errors.email : undefined} />
                </div>

                <div>
                  <FieldLabel>Phone Number</FieldLabel>
                  <InputWrapper icon={<Phone style={{ width: 16, height: 16 }} />}>
                    <input type="tel" name="phone" value={formData.phone} maxLength={20} autoComplete="tel"
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      style={iconInputStyle(Boolean(errors.phone && touched.phone))}
                      placeholder="+267 7123 4567" />
                  </InputWrapper>
                  <FieldError message={touched.phone ? errors.phone : undefined} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <FieldLabel>Date of Birth</FieldLabel>
                    <InputWrapper icon={<Calendar style={{ width: 16, height: 16 }} />}>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                        onBlur={() => handleBlur("date_of_birth")}
                        style={iconInputStyle(Boolean(errors.date_of_birth && touched.date_of_birth))} />
                    </InputWrapper>
                    <FieldError message={touched.date_of_birth ? errors.date_of_birth : undefined} />
                  </div>
                  <div>
                    <FieldLabel>Gender</FieldLabel>
                    <select name="gender" value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      onBlur={() => handleBlur("gender")}
                      style={selectStyle(Boolean(errors.gender && touched.gender))}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    <FieldError message={touched.gender ? errors.gender : undefined} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
                <SectionTitle>Address</SectionTitle>

                <div>
                  <FieldLabel>Street Address</FieldLabel>
                  <InputWrapper icon={<MapPin style={{ width: 16, height: 16 }} />}>
                    <input type="text" name="address_line1" value={formData.address_line1} maxLength={100} autoComplete="address-line1"
                      onChange={(e) => handleInputChange("address_line1", e.target.value)}
                      onBlur={() => handleBlur("address_line1")}
                      style={iconInputStyle(Boolean(errors.address_line1 && touched.address_line1))}
                      placeholder="Street address" />
                  </InputWrapper>
                  <FieldError message={touched.address_line1 ? errors.address_line1 : undefined} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <FieldLabel>City</FieldLabel>
                    <input type="text" name="city" value={formData.city} maxLength={50} autoComplete="address-level2"
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      style={inputStyle(Boolean(errors.city && touched.city))}
                      placeholder="City" />
                    <FieldError message={touched.city ? errors.city : undefined} />
                  </div>
                  <div>
                    <FieldLabel>District</FieldLabel>
                    <input type="text" name="state" value={formData.state} maxLength={50} autoComplete="address-level1"
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      onBlur={() => handleBlur("state")}
                      style={inputStyle(Boolean(errors.state && touched.state))}
                      placeholder="District" />
                    <FieldError message={touched.state ? errors.state : undefined} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Country</FieldLabel>
                  <select name="country" value={formData.country} autoComplete="country"
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    style={selectStyle(false)}>
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

                <SectionTitle>Employment</SectionTitle>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <FieldLabel>Occupation</FieldLabel>
                    <InputWrapper icon={<Briefcase style={{ width: 16, height: 16 }} />}>
                      <input type="text" name="occupation" value={formData.occupation} maxLength={100} autoComplete="organization-title"
                        onChange={(e) => handleInputChange("occupation", e.target.value)}
                        onBlur={() => handleBlur("occupation")}
                        style={iconInputStyle(Boolean(errors.occupation && touched.occupation))}
                        placeholder="Occupation" />
                    </InputWrapper>
                    <FieldError message={touched.occupation ? errors.occupation : undefined} />
                  </div>
                  <div>
                    <FieldLabel>Employer</FieldLabel>
                    <input type="text" name="employer" value={formData.employer} maxLength={100} autoComplete="organization"
                      onChange={(e) => handleInputChange("employer", e.target.value)}
                      onBlur={() => handleBlur("employer")}
                      style={inputStyle(Boolean(errors.employer && touched.employer))}
                      placeholder="Employer" />
                    <FieldError message={touched.employer ? errors.employer : undefined} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
                <SectionTitle>Emergency Contact</SectionTitle>

                <div>
                  <FieldLabel>Contact Name</FieldLabel>
                  <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} maxLength={100}
                    onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                    onBlur={() => handleBlur("emergency_contact_name")}
                    style={inputStyle(Boolean(errors.emergency_contact_name && touched.emergency_contact_name))}
                    placeholder="Full name" />
                  <FieldError message={touched.emergency_contact_name ? errors.emergency_contact_name : undefined} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <FieldLabel>Phone</FieldLabel>
                    <InputWrapper icon={<Phone style={{ width: 16, height: 16 }} />}>
                      <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} maxLength={20}
                        onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                        onBlur={() => handleBlur("emergency_contact_phone")}
                        style={iconInputStyle(Boolean(errors.emergency_contact_phone && touched.emergency_contact_phone))}
                        placeholder="+267 7123 4567" />
                    </InputWrapper>
                    <FieldError message={touched.emergency_contact_phone ? errors.emergency_contact_phone : undefined} />
                  </div>
                  <div>
                    <FieldLabel>Relationship</FieldLabel>
                    <input type="text" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} maxLength={50}
                      onChange={(e) => handleInputChange("emergency_contact_relationship", e.target.value)}
                      onBlur={() => handleBlur("emergency_contact_relationship")}
                      style={inputStyle(Boolean(errors.emergency_contact_relationship && touched.emergency_contact_relationship))}
                      placeholder="e.g. Spouse" />
                    <FieldError message={touched.emergency_contact_relationship ? errors.emergency_contact_relationship : undefined} />
                  </div>
                </div>

                <SectionTitle>Notes</SectionTitle>

                <div>
                  <textarea name="notes" value={formData.notes} rows={4} maxLength={1000}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    onBlur={() => handleBlur("notes")}
                    style={{ ...inputStyle(Boolean(errors.notes && touched.notes)), resize: "none", lineHeight: 1.5 }}
                    placeholder="Any additional notes about this client..." />
                  <div style={{ fontSize: 11, color: TEXT3, textAlign: "right", marginTop: 4 }}>{formData.notes.length}/1000</div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_active}
                    onChange={(e) => handleInputChange("is_active", e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: NAVY, borderRadius: 4 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>Mark as active</div>
                    <div style={{ fontSize: 12, color: TEXT3 }}>Active clients appear in your main list</div>
                  </div>
                </label>
              </div>
            )}

          </div>
        </form>
      </main>

      {/* ── Fixed bottom nav (z-10, below sticky header at z-20) ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
        background: SURFACE, borderTop: `1px solid ${BORDER}`,
        padding: "12px 16px",
        paddingBottom: "calc(90px + env(safe-area-inset-bottom))",
        boxShadow: "0 -4px 20px rgba(27,43,75,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Back button */}
          <button type="button" onClick={handlePrevious} disabled={currentStep === 1}
            style={{
              width: 44, height: 44, borderRadius: 12, border: `1.5px solid ${BORDER}`,
              background: currentStep === 1 ? BG : SURFACE,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: currentStep === 1 ? "not-allowed" : "pointer",
              opacity: currentStep === 1 ? 0.4 : 1, color: TEXT2, flexShrink: 0,
              transition: "all 0.15s",
            }}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>

          {/* Step dots */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
            {STEPS.map((s) => (
              <button key={s.id} onClick={() => handleStepClick(s.id)}
                style={{
                  height: 6, borderRadius: 99, border: "none", cursor: "pointer",
                  background: s.id === currentStep ? NAVY : completedSteps.has(s.id) ? NAVY_MED : BORDER,
                  width: s.id === currentStep ? 24 : 6,
                  transition: "all 0.25s",
                  opacity: completedSteps.has(s.id) || s.id === currentStep ? 1 : 0.5,
                }} />
            ))}
          </div>

          {/* Next / Save */}
          {currentStep < STEPS.length ? (
            <button type="button" onClick={handleNext}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 20px", height: 44, borderRadius: 12, border: "none",
                background: NAVY, color: "#fff", fontWeight: 600, fontSize: 14,
                cursor: "pointer", flexShrink: 0,
              }}>
              Next <ChevronRight style={{ width: 18, height: 18 }} />
            </button>
          ) : (
            <button type="submit" disabled={creating} onClick={handleSubmit}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 20px", height: 44, borderRadius: 12, border: "none",
                background: creating ? TEXT3 : NAVY, color: "#fff", fontWeight: 600, fontSize: 14,
                cursor: creating ? "not-allowed" : "pointer", flexShrink: 0,
              }}>
              <Save style={{ width: 16, height: 16 }} />
              {creating ? "Saving…" : "Save Client"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}