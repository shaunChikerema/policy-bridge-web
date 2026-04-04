import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for proper Tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "BWP",
  locale: string = "en-BW"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get status color classes based on status and theme
 */
export function getStatusColor(
  status: string,
  isDarkMode: boolean = false
): string {
  const statusLower = status.toLowerCase();

  const statusColors = {
    active: isDarkMode
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-green-100 text-green-800 border-green-200",
    pending: isDarkMode
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-yellow-100 text-yellow-800 border-yellow-200",
    expired: isDarkMode
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-red-100 text-red-800 border-red-200",
    cancelled: isDarkMode
      ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
      : "bg-gray-100 text-gray-800 border-gray-200",
    suspended: isDarkMode
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-orange-100 text-orange-800 border-orange-200",
    processing: isDarkMode
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-blue-100 text-blue-800 border-blue-200",
    approved: isDarkMode
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-green-100 text-green-800 border-green-200",
    rejected: isDarkMode
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-red-100 text-red-800 border-red-200",
    open: isDarkMode
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-purple-100 text-purple-800 border-purple-200",
    prospect: isDarkMode
      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
      : "bg-indigo-100 text-indigo-800 border-indigo-200",
  };

  return (
    statusColors[statusLower as keyof typeof statusColors] ||
    (isDarkMode
      ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
      : "bg-gray-100 text-gray-800 border-gray-200")
  );
}

/**
 * Format numbers for display (e.g., policy numbers, claim numbers)
 */
export function formatNumber(value: number, locale: string = "en-BW"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format dates for display
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale: string = "en-BW"
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 weeks")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = "en-BW"
): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMilliseconds = targetDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.ceil(diffInMilliseconds / (1000 * 60 * 60));
    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.ceil(diffInMilliseconds / (1000 * 60));
      return rtf.format(diffInMinutes, "minute");
    }
    return rtf.format(diffInHours, "hour");
  } else if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, "day");
  } else if (Math.abs(diffInDays) < 30) {
    const diffInWeeks = Math.ceil(diffInDays / 7);
    return rtf.format(diffInWeeks, "week");
  } else if (Math.abs(diffInDays) < 365) {
    const diffInMonths = Math.ceil(diffInDays / 30);
    return rtf.format(diffInMonths, "month");
  } else {
    const diffInYears = Math.ceil(diffInDays / 365);
    return rtf.format(diffInYears, "year");
  }
}

/**
 * Generate initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = "", length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Botswana format)
 */
export function isValidPhoneBW(phone: string): boolean {
  // Remove all non-digits
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if it matches Botswana mobile patterns
  // +267 7X XXX XXXX or 267 7X XXX XXXX or 7X XXX XXXX
  const bwMobileRegex = /^(267)?[7][0-9]{7}$/;

  return bwMobileRegex.test(cleanPhone);
}

/**
 * Format phone number for display (Botswana format)
 */
export function formatPhoneBW(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 8 && cleanPhone.startsWith("7")) {
    // Format as: 7X XXX XXXX
    return cleanPhone.replace(/^(\d{2})(\d{3})(\d{3})$/, "$1 $2 $3");
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith("267")) {
    // Format as: +267 7X XXX XXXX
    return cleanPhone.replace(/^(\d{3})(\d{2})(\d{3})(\d{3})$/, "+$1 $2 $3 $4");
  }

  return phone; // Return original if doesn't match expected patterns
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (typeof obj === "object") {
    const clonedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
}

/**
 * Check if device is tablet
 */
export function isTabletDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
}

/**
 * Check if device is desktop
 */
export function isDesktopDevice(): boolean {
  if (typeof window === "undefined") return true;
  return window.innerWidth > 1024;
}

/**
 * Get device type
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (isMobileDevice()) return "mobile";
  if (isTabletDevice()) return "tablet";
  return "desktop";
}

/**
 * Check if device supports hover (not touch-only)
 */
export function supportsHover(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover)").matches;
}

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user is on iOS device
 */
export function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if user is on Android device
 */
export function isAndroidDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Get safe area insets for mobile devices
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue("env(safe-area-inset-top)")) || 0,
    right: parseInt(style.getPropertyValue("env(safe-area-inset-right)")) || 0,
    bottom:
      parseInt(style.getPropertyValue("env(safe-area-inset-bottom)")) || 0,
    left: parseInt(style.getPropertyValue("env(safe-area-inset-left)")) || 0,
  };
}

/**
 * Mobile Navigation Utilities
 */
export const mobileNav = {
  /**
   * Check if current path is active for navigation highlighting
   */
  isPathActive: (currentPath: string, navPath: string): boolean => {
    if (navPath === "/dashboard/dashboard") {
      return (
        currentPath === "/dashboard/dashboard" || currentPath === "/dashboard"
      );
    }
    return currentPath.startsWith(navPath);
  },

  /**
   * Get navigation badge count (example implementation)
   */
  getBadgeCount: (section: string): number | undefined => {
    // This would typically connect to your app's state/API
    const mockCounts: Record<string, number> = {
      notifications: 3,
      claims: 5,
      renewals: 12,
    };
    return mockCounts[section];
  },

  /**
   * Format badge display text
   */
  formatBadge: (count: number): string => {
    if (count > 99) return "99+";
    if (count > 9) return count.toString();
    return count.toString();
  },

  /**
   * Get navigation priority (for ordering)
   */
  getNavPriority: (section: string): number => {
    const priorities: Record<string, number> = {
      dashboard: 1,
      clients: 2,
      policies: 3,
      claims: 4,
      payments: 5,
      calendar: 6,
      reports: 7,
      notifications: 8,
      settings: 9,
    };
    return priorities[section] || 99;
  },
};

/**
 * Insurance-specific utilities
 */
export const insurance = {
  /**
   * Generate policy number
   */
  generatePolicyNumber: (prefix: string = "POL"): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  /**
   * Generate claim number
   */
  generateClaimNumber: (prefix: string = "CLM"): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  /**
   * Calculate premium with tax
   */
  calculatePremiumWithTax: (
    basePremium: number,
    taxRate: number = 0.14
  ): number => {
    return basePremium * (1 + taxRate);
  },

  /**
   * Format policy status
   */
  formatPolicyStatus: (status: string): { label: string; color: string } => {
    const statusMap = {
      active: { label: "Active", color: "text-success" },
      pending: { label: "Pending", color: "text-warning" },
      expired: { label: "Expired", color: "text-destructive" },
      cancelled: { label: "Cancelled", color: "text-muted-foreground" },
      suspended: { label: "Suspended", color: "text-warning" },
    };

    return (
      statusMap[status.toLowerCase() as keyof typeof statusMap] || {
        label: status,
        color: "text-muted-foreground",
      }
    );
  },

  /**
   * Format claim status
   */
  formatClaimStatus: (status: string): { label: string; color: string } => {
    const statusMap = {
      submitted: { label: "Submitted", color: "text-primary" },
      "under-review": { label: "Under Review", color: "text-warning" },
      approved: { label: "Approved", color: "text-success" },
      rejected: { label: "Rejected", color: "text-destructive" },
      paid: { label: "Paid", color: "text-success" },
      "more-info-required": {
        label: "More Info Required",
        color: "text-warning",
      },
    };

    return (
      statusMap[status.toLowerCase() as keyof typeof statusMap] || {
        label: status,
        color: "text-muted-foreground",
      }
    );
  },

  /**
   * Calculate policy renewal date
   */
  calculateRenewalDate: (
    startDate: Date | string,
    termMonths: number = 12
  ): Date => {
    const start = new Date(startDate);
    const renewal = new Date(start);
    renewal.setMonth(renewal.getMonth() + termMonths);
    return renewal;
  },

  /**
   * Check if policy is due for renewal (within specified days)
   */
  isDueForRenewal: (
    renewalDate: Date | string,
    daysThreshold: number = 30
  ): boolean => {
    const renewal = new Date(renewalDate);
    const today = new Date();
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= daysThreshold && diffDays >= 0;
  },

  /**
   * Validate insurance ID number (Botswana format)
   */
  validateBotswanaID: (id: string): boolean => {
    // Botswana ID format: 9 digits
    const cleanId = id.replace(/\D/g, "");
    return /^\d{9}$/.test(cleanId);
  },

  /**
   * Format insurance ID for display
   */
  formatBotswanaID: (id: string): string => {
    const cleanId = id.replace(/\D/g, "");
    if (cleanId.length === 9) {
      return cleanId.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");
    }
    return id;
  },

  /**
   * Calculate insurance age rating
   */
  getAgeRating: (birthDate: Date | string): "young" | "standard" | "senior" => {
    const age = calculateAge(birthDate);
    if (age < 25) return "young";
    if (age >= 65) return "senior";
    return "standard";
  },

  /**
   * Get risk assessment based on various factors
   */
  assessRisk: (factors: {
    age: number;
    previousClaims: number;
    coverageAmount: number;
    occupation?: string;
  }): "low" | "medium" | "high" | "critical" => {
    let riskScore = 0;

    // Age factor
    if (factors.age < 25 || factors.age > 65) riskScore += 2;
    else if (factors.age > 55) riskScore += 1;

    // Claims history
    riskScore += factors.previousClaims * 2;

    // Coverage amount
    if (factors.coverageAmount > 1000000) riskScore += 2;
    else if (factors.coverageAmount > 500000) riskScore += 1;

    // High-risk occupations
    const highRiskOccupations = ["miner", "pilot", "construction", "fisherman"];
    if (
      factors.occupation &&
      highRiskOccupations.includes(factors.occupation.toLowerCase())
    ) {
      riskScore += 3;
    }

    if (riskScore >= 7) return "critical";
    if (riskScore >= 5) return "high";
    if (riskScore >= 3) return "medium";
    return "low";
  },
};
