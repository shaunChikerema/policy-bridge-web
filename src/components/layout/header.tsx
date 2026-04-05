"use client";

import { Bell, LogOut, Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLayout } from "@/components/layout/layout-context";
import { useProfile } from "@/components/layout/profile-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface HeaderProps {
  onSignOut?: () => Promise<void>;
}

/* ─── Theme toggle ───────────────────────────────────────────────────────── */

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

/* ─── User menu ──────────────────────────────────────────────────────────── */

function UserMenu({ onSignOut }: { onSignOut?: () => Promise<void> }) {
  const { user, profile } = useProfile();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Account";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    if (!onSignOut) return;
    setSigningOut(true);
    try {
      await onSignOut();
      router.replace("/landing");
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {[
              { href: "/dashboard/profile",  icon: User,     label: "Profile"  },
              { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Sign out */}
          <div className="py-1.5 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Header ────────────────────────────────────────────────────────── */

export function Header({ onSignOut }: HeaderProps) {
  const { openMobileMenu } = useLayout();

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 sm:px-6 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      {/* Mobile menu toggle */}
      <button
        onClick={openMobileMenu}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
        <Image src="/pb-logo-svg-trans.svg" alt="PolicyBridge" width={24} height={24} />
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <Link
          href="/dashboard/search"
          className="flex items-center gap-2.5 w-full h-9 px-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Search…</span>
        </Link>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Unread dot — connect to real data when ready */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </Link>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />

        <UserMenu onSignOut={onSignOut} />
      </div>
    </header>
  );
}