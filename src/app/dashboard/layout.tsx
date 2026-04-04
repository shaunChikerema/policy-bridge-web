// src/app/dashboard/layout.tsx
"use client";

import { LayoutProvider } from "@/components/layout/layout-context";
import { ProfileProvider } from "@/components/layout/profile-context";
import { UnifiedLayout } from "@/components/layout/unified-layout";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useTheme } from "@/context/theme-context";
import { useClaims } from "@/hooks/useClaims";
import { usePolicies } from "@/hooks/usePolicies";
import { useMemo } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useSupabase();
  const themeContext = useTheme();

  // Get real data for badge counts
  const { policies } = usePolicies();
  const { claims } = useClaims();

  // Handle sign out with proper error handling
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Calculate minimal badge counts - only show critical items
  const badgeCounts = useMemo(() => {
    // Only show urgent items to reduce mobile nav clutter
    const urgentClaims = claims.filter(
      (claim) =>
        (claim.status === "Open" || claim.status === "Processing") &&
        claim.priority === "high"
    ).length;

    const expiringPolicies = policies.filter(
      (policy) =>
        policy.renewal_date &&
        new Date(policy.renewal_date) <=
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    ).length;

    return {
      // Only show badges for truly urgent items
      claims: urgentClaims > 0 ? urgentClaims : undefined,
      policies: expiringPolicies > 0 ? expiringPolicies : undefined,
      // Remove notifications badge to reduce clutter
      // notifications: undefined,
    };
  }, [policies, claims]);

  return (
    <LayoutProvider themeContext={themeContext}>
      <ProfileProvider>
        <UnifiedLayout onSignOut={handleSignOut} badgeCounts={badgeCounts}>
          {children}
        </UnifiedLayout>
      </ProfileProvider>
    </LayoutProvider>
  );
}
