import { LucideIcon } from "lucide-react";

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  role: "admin" | "agent" | "user";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  company: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// User Management Types (for dashboard users)
export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Manager";
  avatar?: string;
  department: string;
  permissions: string[];
}

// Client Management Types - Legacy interface for compatibility
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  policies: number;
  totalPremium: number;
  status: "Active" | "Inactive" | "Prospect";
  lastContact: string;
  avatar?: string;
}

// Database Client Types (matching your Supabase schema exactly)
export interface DatabaseClient {
  id: string;
  user_id: string; // Required - references auth.users(id)
  first_name: string; // Required
  last_name: string; // Required
  email: string; // Required, unique
  phone: string | null;
  date_of_birth: string | null; // ISO date string
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null; // Default 'US' in database
  occupation: string | null;
  employer: string | null;
  annual_income: number | null; // numeric(12, 2) in database
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  notes: string | null;
  tags: string[] | null;
  is_active: boolean; // Default true in database
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Client with computed fields for display
export interface ClientWithDetails extends DatabaseClient {
  full_name: string;
  age?: number;
  formatted_address: string;
  formatted_phone: string;
  total_policies: number;
  total_premium: number;
  dependents_count: number; // Added missing property
  join_date: string;
}

// Form data interface for client forms (all strings for form handling)
export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string; // Empty string or one of the valid values
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  occupation: string;
  employer: string;
  annual_income: string; // Form uses string, converts to number
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  notes: string;
  tags: string[];
  is_active: boolean;
}

// Client validation errors
export interface ClientFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  occupation?: string;
  employer?: string;
  annual_income?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  tags?: string;
  is_active?: string;
  submit?: string; // For general form submission errors
}

// For creating clients (user_id will be added by service) - FIXED VERSION
export interface ClientInsert {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | undefined;
  date_of_birth?: string | undefined;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | undefined;
  address_line1?: string | undefined;
  address_line2?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  postal_code?: string | undefined;
  country?: string | undefined;
  occupation?: string | undefined;
  employer?: string | undefined;
  annual_income?: number | undefined;
  emergency_contact_name?: string | undefined;
  emergency_contact_phone?: string | undefined;
  emergency_contact_relationship?: string | undefined;
  notes?: string | undefined;
  tags?: string[];
  is_active: boolean;
}

// For updating clients - Fixed empty interface issue
export type ClientUpdate = Partial<
  Omit<DatabaseClient, "id" | "user_id" | "created_at" | "updated_at">
>;

// Client search and filter types
export interface ClientFilters {
  search?: string;
  is_active?: boolean | "all";
  gender?: string;
  city?: string;
  state?: string;
  min_income?: number;
  max_income?: number;
  has_phone?: boolean;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}

export type ClientSortField =
  | "first_name"
  | "last_name"
  | "email"
  | "created_at"
  | "updated_at"
  | "annual_income"
  | "city"
  | "state";

export interface ClientSortOptions {
  field: ClientSortField;
  direction: "asc" | "desc";
}

// API response types for clients
export interface ClientResponse {
  data: ClientWithDetails | null;
  error?: string;
}

export interface ClientsResponse {
  data: ClientWithDetails[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
  error?: string;
}

// Client statistics
export interface ClientStats {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  new_this_month: number;
  total_premium_value: number;
  average_annual_income: number;
  clients_by_city: Array<{ city: string; count: number }>;
  clients_by_age_group: Array<{ age_group: string; count: number }>;
  growth_rate: number;
}

// Policy Management Types
export interface Policy {
  id: string;
  type: string;
  client: string;
  premium: number;
  status: "Active" | "Pending" | "Expired" | "Cancelled";
  renewalDate: string;
  commission: number;
  insurer: string;
  icon: LucideIcon;
}

// Enhanced Policy Types for Database
export interface DatabasePolicy {
  id: string;
  client_id: string;
  policy_number: string;
  policy_type:
    | "life"
    | "health"
    | "auto"
    | "home"
    | "business"
    | "travel"
    | "disability";
  insurer_name: string;
  premium_amount: number;
  coverage_amount: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: "active" | "pending" | "expired" | "cancelled" | "suspended";
  payment_frequency: "monthly" | "quarterly" | "semi_annual" | "annual";
  agent_commission: number;
  beneficiaries?: string[];
  policy_documents?: string[]; // URLs or file references
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyWithDetails extends DatabasePolicy {
  client_name: string;
  days_until_renewal: number;
  is_renewable: boolean;
  formatted_premium: string;
  formatted_coverage: string;
}

// Claims Management Types
export interface Claim {
  id: string;
  type: string;
  client: string;
  amount: number;
  status: "Open" | "Processing" | "Approved" | "Rejected" | "Paid";
  submittedDate: string;
  description: string;
}

// Enhanced Claims Types for Database
export interface DatabaseClaim {
  id: string;
  policy_id: string;
  client_id: string;
  claim_number: string;
  claim_type:
    | "accident"
    | "illness"
    | "death"
    | "disability"
    | "property_damage"
    | "theft"
    | "other";
  incident_date: string; // ISO date string
  reported_date: string; // ISO date string
  claim_amount: number;
  approved_amount?: number;
  status:
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "paid"
    | "closed";
  description: string;
  supporting_documents?: string[]; // URLs or file references
  adjuster_notes?: string;
  settlement_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimWithDetails extends DatabaseClaim {
  client_name: string;
  policy_number: string;
  policy_type: string;
  days_since_reported: number;
  formatted_claim_amount: string;
  formatted_approved_amount?: string;
}

// Payment Management Types
export interface Payment {
  id: string;
  client: string;
  policy: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue" | "Failed";
  method: "Bank Transfer" | "Credit Card" | "Debit Order" | "Cash";
  paidDate?: string;
}

// Enhanced Payment Types for Database
export interface DatabasePayment {
  id: string;
  policy_id: string;
  client_id: string;
  payment_amount: number;
  due_date: string; // ISO date string
  paid_date?: string; // ISO date string
  status: "pending" | "paid" | "overdue" | "failed" | "refunded";
  payment_method:
    | "bank_transfer"
    | "credit_card"
    | "debit_card"
    | "cash"
    | "check"
    | "mobile_money";
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithDetails extends DatabasePayment {
  client_name: string;
  policy_number: string;
  policy_type: string;
  days_overdue?: number;
  formatted_amount: string;
}

// Dashboard & Analytics Types
export interface DashboardStats {
  totalPolicies: StatItem;
  totalClients: StatItem;
  monthlyRevenue: StatItem;
  activeClaims: StatItem;
  renewalRate: StatItem;
  avgProcessTime: StatItem;
}

export interface StatItem {
  value: number;
  change: number;
  trend: "up" | "down";
}

// Activity & Notifications Types
export interface RecentActivity {
  id: string;
  type: "policy" | "claim" | "client" | "payment";
  title: string;
  description: string;
  time: string;
  user: string;
  status?: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Enhanced Notification Types for Database
export interface DatabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "reminder";
  category: "policy" | "claim" | "payment" | "client" | "system" | "renewal";
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>; // JSON field for additional data - Fixed 'any' type
  created_at: string;
  updated_at: string;
}

// Navigation Types
export interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: Omit<MenuItem, "subItems">[];
}

// Common Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: "appointment" | "renewal" | "follow_up" | "deadline";
  clientId?: string;
  policyId?: string;
}

// Enhanced Calendar Types for Database
export interface DatabaseCalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string; // ISO datetime string
  end_date?: string; // ISO datetime string
  event_type:
    | "appointment"
    | "renewal"
    | "follow_up"
    | "deadline"
    | "meeting"
    | "reminder";
  client_id?: string;
  policy_id?: string;
  claim_id?: string;
  location?: string;
  attendees?: string[]; // Array of user IDs or email addresses
  is_all_day: boolean;
  reminder_minutes?: number; // Minutes before event to send reminder
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  created_at: string;
  updated_at: string;
}

// Settings Types
export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    currency: string;
  };
  privacy: {
    profileVisibility: "public" | "private";
    activityTracking: boolean;
  };
}

export interface CompanySettings {
  name: string;
  logo?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  licenseNumber?: string;
}

// Enhanced User Profile Types for Database
export interface DatabaseUserProfile {
  id: string;
  user_id: string; // References auth.users(id)
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  manager_id?: string;
  settings: UserSettings;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Theme Types
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}

// Layout Types
export interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// File Upload Types
export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  url?: string;
}

// Document Types for file management
export interface DocumentType {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: "policy" | "claim" | "client" | "payment" | "other";
  client_id?: string;
  policy_id?: string;
  claim_id?: string;
  uploaded_by: string;
  tags?: string[];
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type:
    | "client"
    | "policy"
    | "claim"
    | "payment"
    | "user"
    | "settings";
  resource_id: string;
  old_values?: Record<string, unknown>; // Fixed 'any' type
  new_values?: Record<string, unknown>; // Fixed 'any' type
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Report Types
export interface ReportData {
  id: string;
  name: string;
  type: "revenue" | "claims" | "renewals" | "performance" | "custom";
  parameters: Record<string, unknown>; // Fixed 'any' type
  data: unknown[]; // Fixed 'any' type
  generated_at: string;
  generated_by: string;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | undefined; // Fixed 'any' type
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}
