"use client";

import {
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Home,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLayout } from "./layout-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface SidebarProps {
  onSignOut?: () => Promise<void>;
}

/* ─── Navigation data ────────────────────────────────────────────────────── */

const PRIMARY_NAV: NavItem[] = [
  { id: "dashboard", label: "Home",      href: "/dashboard",                     icon: Home            },
  { id: "clients",   label: "Clients",    href: "/dashboard/client-management",   icon: Users           },
  { id: "policies",  label: "Policies",   href: "/dashboard/policy-management",   icon: Shield          },
  { id: "claims",    label: "Claims",     href: "/dashboard/claims-management",   icon: ClipboardList   },
  { id: "payments",  label: "Payments",   href: "/dashboard/payment-management",  icon: CreditCard      },
  { id: "reports",   label: "Reports",    href: "/dashboard/reports",             icon: BarChart3       },
];

const SECONDARY_NAV: NavItem[] = [
  { id: "calendar",      label: "Calendar",       href: "/dashboard/calendar",       icon: Calendar   },
  { id: "notifications", label: "Notifications",  href: "/dashboard/notifications",  icon: Bell       },
];

const ACCOUNT_NAV: NavItem[] = [
  { id: "profile",  label: "Profile",       href: "/dashboard/profile",  icon: User      },
  { id: "settings", label: "Settings",      href: "/dashboard/settings", icon: Settings  },
  { id: "help",     label: "Help & Support", href: "/dashboard/help",     icon: HelpCircle},
];

/* ─── NavItem component ──────────────────────────────────────────────────── */

function SidebarLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${active
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
        }
      `}
    >
      <Icon className={`flex-shrink-0 w-4.5 h-4.5 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/* ─── Main Sidebar ───────────────────────────────────────────────────────── */

export function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebarCollapse, mobileMenuOpen, closeMobileMenu } = useLayout();
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    if (!onSignOut) return;
    setSigningOut(true);
    try {
      await onSignOut();
      router.replace("/landing");
    } finally {
      setSigningOut(false);
    }
  };

  const collapsed = sidebarCollapsed;

  const sidebarContent = (
    <aside
      className={`
        flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800
        transition-all duration-200
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 ${collapsed ? "justify-center" : "gap-3"}`}>
        <Image src="/pb-logo-svg-trans.svg" alt="PolicyBridge" width={28} height={28} />
        {!collapsed && (
          <span className="font-bold text-gray-900 dark:text-white tracking-tight">PolicyBridge</span>
        )}
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* Primary */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Main
            </p>
          )}
          {PRIMARY_NAV.map((item) => (
            <SidebarLink key={item.id} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </div>

        {/* Secondary */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Productivity
            </p>
          )}
          {SECONDARY_NAV.map((item) => (
            <SidebarLink key={item.id} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </div>

        {/* Account */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Account
            </p>
          )}
          {ACCOUNT_NAV.map((item) => (
            <SidebarLink key={item.id} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* Sign out + collapse toggle */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          title={collapsed ? "Sign out" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <LogOut className="flex-shrink-0 w-4.5 h-4.5" />
          {!collapsed && <span>{signingOut ? "Signing out…" : "Sign out"}</span>}
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleSidebarCollapse}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          {/* Drawer */}
          <div className="relative flex w-64 h-full">
            {sidebarContent}
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}