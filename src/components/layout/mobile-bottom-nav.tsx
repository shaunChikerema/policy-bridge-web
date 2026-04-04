//src\components\layout\mobile-bottom-nav.tsx
"use client";

import {
  BarChart3,
  Bell,
  Calendar,
  ClipboardList,
  CreditCard,
  Home,
  MoreHorizontal,
  Receipt,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface NavItem {
  id: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  badge?: number;
  ariaLabel?: string;
  priority?: "high" | "medium" | "low";
}

interface MobileBottomNavProps {
  className?: string;
  badgeCounts?: Record<string, number>;
  onNavigate?: (itemId: string, href: string) => void;
}

// ============================================================================
// NAVIGATION DATA - OPTIMIZED FOR MOBILE UX
// ============================================================================

// Core workflow items - most frequently used (max 4 + more)
const primaryNavItems: NavItem[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    icon: Home,
    label: "Home",
    ariaLabel: "Go to Dashboard",
    priority: "high",
  },
  {
    id: "clients",
    href: "/dashboard/client-management",
    icon: Users,
    label: "Clients",
    ariaLabel: "Manage Clients",
    priority: "high",
  },
  {
    id: "policies",
    href: "/dashboard/policy-management",
    icon: Shield,
    label: "Policies",
    badge: 12, // renewals due
    ariaLabel: "Manage Policies",
    priority: "high",
  },
  {
    id: "claims",
    href: "/dashboard/claims-management",
    icon: ClipboardList,
    label: "Claims",
    badge: 3, // urgent claims
    ariaLabel: "Manage Claims",
    priority: "high",
  },
];

// Secondary items - shown in more menu
const secondaryNavItems: NavItem[] = [
  {
    id: "payments",
    href: "/dashboard/payment-management",
    icon: CreditCard,
    label: "Payments",
    ariaLabel: "Manage Payments",
    priority: "medium",
  },
  {
    id: "payslips",
    href: "/dashboard/payment-management/payslips",
    icon: Receipt,
    label: "Payslips",
    ariaLabel: "Manage Payslips",
    priority: "medium",
  },
  {
    id: "reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    label: "Reports",
    ariaLabel: "View Reports",
    priority: "medium",
  },
  {
    id: "calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    label: "Calendar",
    badge: 4,
    ariaLabel: "View Calendar",
    priority: "medium",
  },
  {
    id: "notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    label: "Notifications",
    badge: 8,
    ariaLabel: "View Notifications",
    priority: "low",
  },
  {
    id: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    label: "Settings",
    ariaLabel: "App Settings",
    priority: "low",
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const isPathActive = (currentPath: string, itemPath: string): boolean => {
  if (itemPath === "/dashboard" && currentPath === "/dashboard") return true;
  if (itemPath !== "/dashboard" && currentPath.startsWith(itemPath))
    return true;
  return false;
};

const formatBadge = (count: number): string => {
  if (count > 99) return "99+";
  return count.toString();
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MobileBottomNav({
  className = "",
  badgeCounts = {},
  onNavigate,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle SSR hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key and outside clicks
  useEffect(() => {
    if (!showMore) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMore(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-mobile-nav-more]")) {
        setShowMore(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showMore]);

  const isActive = useCallback(
    (href: string) => isPathActive(pathname, href),
    [pathname]
  );

  const getBadgeCount = useCallback(
    (item: NavItem): number | undefined => {
      return badgeCounts[item.id] ?? item.badge;
    },
    [badgeCounts]
  );

  const handleNavigateClick = useCallback(
    (item: NavItem, closeMenu = false) => {
      onNavigate?.(item.id, item.href);
      if (closeMenu) setShowMore(false);
    },
    [onNavigate]
  );

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const NavButton = React.memo(
    ({
      item,
      onClick,
      variant = "bottom",
    }: {
      item: NavItem;
      onClick?: () => void;
      variant?: "bottom" | "grid";
    }) => {
      const Icon = item.icon;
      const active = isActive(item.href);
      const badgeCount = getBadgeCount(item);

      const baseClasses = `
        relative flex flex-col items-center justify-center p-2 rounded-xl
        transition-all duration-200 active:scale-95 group
        ${
          variant === "bottom"
            ? "min-h-[64px] flex-1 max-w-[80px]"
            : "aspect-square"
        }
      `;

      const stateClasses = active
        ? "bg-blue-500 text-white shadow-lg"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800";

      return (
        <Link
          href={item.href}
          onClick={(e) => {
            handleNavigateClick(item, variant === "grid");
            onClick?.();
          }}
          className={`${baseClasses} ${stateClasses}`}
          aria-label={item.ariaLabel || item.label}
          role="tab"
          aria-selected={active}
        >
          <div className="relative mb-1">
            <Icon
              className={`w-5 h-5 ${variant === "grid" ? "w-6 h-6" : ""}`}
              aria-hidden="true"
            />
            {badgeCount && badgeCount > 0 && (
              <span
                className={`
                  absolute -top-2 -right-2 min-w-[18px] h-[18px] 
                  flex items-center justify-center rounded-full text-xs font-semibold
                  ${active ? "bg-white text-blue-500" : "bg-red-500 text-white"}
                  ${badgeCount > 9 ? "px-1" : ""}
                `}
                aria-label={`${badgeCount} pending`}
              >
                {formatBadge(badgeCount)}
              </span>
            )}
          </div>
          <span
            className={`text-xs font-medium leading-tight text-center
              ${variant === "grid" ? "text-sm" : ""}`}
          >
            {item.label}
          </span>
        </Link>
      );
    }
  );

  NavButton.displayName = "NavButton";

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return <div className="h-20 md:hidden" />;
  }

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg
          border-t border-gray-200 dark:border-gray-800
          safe-area-pb ${className}
        `}
        role="tablist"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-between px-2 py-1 max-w-screen-sm mx-auto">
          {primaryNavItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}

          {/* More Button */}
          <button
            onClick={() => setShowMore(true)}
            className={`
              relative flex flex-col items-center justify-center p-2 rounded-xl
              min-h-[64px] flex-1 max-w-[80px]
              transition-all duration-200 active:scale-95
              text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 
              hover:bg-gray-100 dark:hover:bg-gray-800
            `}
            aria-label="More navigation options"
            aria-expanded={showMore}
            type="button"
          >
            <MoreHorizontal className="w-5 h-5 mb-1" aria-hidden="true" />
            <span className="text-xs font-medium">More</span>

            {/* Indicator for items with badges */}
            {secondaryNavItems.some((item) => getBadgeCount(item)) && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="more-menu-title"
          data-mobile-nav-more
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />

          {/* Menu Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-800 animate-slide-up">
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2
                id="more-menu-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                More Options
              </h2>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                aria-label="Close menu"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Grid */}
            <div className="px-6 pb-8 safe-area-pb">
              <div className="grid grid-cols-3 gap-4">
                {secondaryNavItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    variant="grid"
                    onClick={() => setShowMore(false)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Area Spacer */}
      <div className="h-20 md:hidden safe-area-pb" />

      <style jsx>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

export default MobileBottomNav;
