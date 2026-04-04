"use client";

import { CreditCard, FileText, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  isDarkMode?: boolean;
  onActionClick?: (actionId: string) => void;
}

// Navy primary with distinct, harmonious accent colors
const quickActions = [
  {
    id: "add-client",
    label: "Client",
    icon: Users,
    href: "/dashboard/client-management/new",
    color: "#1B2B4B",              // navy
    bgLight: "rgba(27,43,75,0.08)",
    bgDark: "rgba(27,43,75,0.15)",
  },
  {
    id: "new-policy",
    label: "Policy",
    icon: Shield,
    href: "/dashboard/policy-management/create",
    color: "#4A7FD4",              // blue accent
    bgLight: "rgba(74,127,212,0.10)",
    bgDark: "rgba(74,127,212,0.15)",
  },
  {
    id: "new-claim",
    label: "Claim",
    icon: FileText,
    href: "/dashboard/claims-management/new",
    color: "#D97706",              // amber — signals urgency/action
    bgLight: "rgba(217,119,6,0.10)",
    bgDark: "rgba(217,119,6,0.15)",
  },
  {
    id: "log-payment",
    label: "Payment",
    icon: CreditCard,
    href: "/dashboard/payment-management/new",
    color: "#059669",              // emerald — money/positive
    bgLight: "rgba(5,150,105,0.10)",
    bgDark: "rgba(5,150,105,0.15)",
  },
];

export default function QuickActions({ isDarkMode = false, onActionClick }: QuickActionsProps) {
  const router = useRouter();
  const labelColor = isDarkMode ? "#9CA3AF" : "#6B7280";

  return (
    <div className="grid grid-cols-4 gap-1">
      {quickActions.map((action) => {
        const Icon = action.icon;
        const bg = isDarkMode ? action.bgDark : action.bgLight;

        return (
          <button
            key={action.id}
            onClick={() => { onActionClick?.(action.id); router.push(action.href); }}
            className="flex flex-col items-center gap-2.5 py-4 rounded-2xl active:scale-95 transition-all"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5" style={{ color: action.color }} strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-semibold" style={{ color: labelColor }}>
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}