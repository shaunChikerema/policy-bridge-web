"use client";

import React from "react";
import { Header } from "./header";
import { useLayout } from "./layout-context";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { Sidebar } from "./sidebar";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UnifiedLayoutProps {
  children: React.ReactNode;
  onSignOut?: () => Promise<void>;
  badgeCounts?: {
    policies?: number;
    claims?: number;
    notifications?: number;
    calendar?: number;
    [key: string]: number | undefined;
  };
}

// ============================================================================
// MAIN UNIFIED LAYOUT COMPONENT
// ============================================================================

export function UnifiedLayout({
  children,
  onSignOut,
  badgeCounts = {},
}: UnifiedLayoutProps) {
  const {
    sidebarVisible,
    sidebarCollapsed,
    mobileMenuOpen,
    isMobile,
    isTablet,
  } = useLayout();

  // Calculate layout dimensions
  const getSidebarWidth = () => {
    if (isMobile || isTablet) return 0; // Mobile uses overlay
    if (!sidebarVisible) return 0;
    return sidebarCollapsed ? 80 : 288; // 20rem = 320px, but we use 288px (18rem)
  };

  const sidebarWidth = getSidebarWidth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - Always visible at top */}
      <Header onSignOut={onSignOut} />

      {/* Main Layout Container */}
      <div className="flex h-[calc(100vh-4rem)]">
        {" "}
        {/* 4rem = header height */}
        {/* Sidebar - Desktop only (mobile uses overlay) */}
        <Sidebar onSignOut={onSignOut} />
        {/* Main Content Area */}
        <main
          className={`
            flex-1 overflow-auto transition-all duration-300 ease-in-out
            ${isMobile || isTablet ? "ml-0" : `ml-0`}
          `}
          style={{
            marginLeft: isMobile || isTablet ? 0 : `${sidebarWidth}px`,
          }}
        >
          {/* Content Wrapper with proper padding */}
          <div className="h-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
              {children}
            </div>

            {/* Mobile bottom spacing for navigation */}
            <div className="h-20 md:hidden" />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only on mobile/tablet */}
      <MobileBottomNav
        badgeCounts={badgeCounts}
        onNavigate={(itemId, href) => {
          // This would be handled by Next.js routing in real implementation
          console.log(`Navigate to ${href} from ${itemId}`);
        }}
      />

      {/* Mobile Menu Overlay Background */}
      {mobileMenuOpen && (isMobile || isTablet) && (
        <div
          className="fixed inset-0 bg-black/50 z-35"
          onClick={() => {
            // This would close the mobile menu
            console.log("Close mobile menu");
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// LAYOUT WRAPPER FOR DASHBOARD PAGES
// ============================================================================

interface DashboardLayoutProps extends UnifiedLayoutProps {
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  description,
  headerActions,
  onSignOut,
  badgeCounts,
}: DashboardLayoutProps) {
  return (
    <UnifiedLayout onSignOut={onSignOut} badgeCounts={badgeCounts}>
      {/* Optional Page Header */}
      {(title || description || headerActions) && (
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-3">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      {children}
    </UnifiedLayout>
  );
}

export default UnifiedLayout;
