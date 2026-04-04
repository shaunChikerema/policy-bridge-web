"use client";

import { CreditCard, FileText, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  isDarkMode?: boolean;
  onActionClick?: (actionId: string) => void;
}

// Supabase green as primary, others are distinct but not clashing
const quickActions = [
  {
    id: "add-client",
    label: "Client",
    icon: Users,
    href: "/dashboard/client-management/new",
    color: "#3ECF8E",
    bgLight: "rgba(62,207,142,0.1)",
    bgDark: "rgba(62,207,142,0.12)",
  },
  {
    id: "new-policy",
    label: "Policy",
    icon: Shield,
    href: "/dashboard/policy-management/create",
    color: "#60a5fa",
    bgLight: "rgba(96,165,250,0.1)",
    bgDark: "rgba(96,165,250,0.12)",
  },
  {
    id: "new-claim",
    label: "Claim",
    icon: FileText,
    href: "/dashboard/claims-management/new",
    color: "#fb923c",
    bgLight: "rgba(251,146,60,0.1)",
    bgDark: "rgba(251,146,60,0.12)",
  },
  {
    id: "log-payment",
    label: "Payment",
    icon: CreditCard,
    href: "/dashboard/payment-management/new",
    color: "#a78bfa",
    bgLight: "rgba(167,139,250,0.1)",
    bgDark: "rgba(167,139,250,0.12)",
  },
];

export default function QuickActions({ isDarkMode = false, onActionClick }: QuickActionsProps) {
  const router = useRouter();
  const labelColor = isDarkMode ? "#6B6B6B" : "#6B7280";

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