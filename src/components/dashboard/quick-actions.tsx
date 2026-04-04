"use client";

import {
  CreditCard,
  FileText,
  Plus,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  isDarkMode?: boolean;
  onActionClick?: (actionId: string) => void;
}

const actions = [
  { id: "new-policy",  label: "+ Policy",  icon: Shield,     href: "/dashboard/policy-management/create" },
  { id: "find-client", label: "Search",    icon: Search,     href: "/dashboard/client-management"        },
  { id: "add-client",  label: "+ Client",  icon: Users,      href: "/dashboard/client-management/new"    },
  { id: "payment",     label: "+ Payment", icon: CreditCard, href: "/dashboard/payment-management/new"   },
  { id: "new-claim",   label: "+ Claim",   icon: FileText,   href: "/dashboard/claims-management/new"    },
  { id: "new-policy-2",label: "+ Policy",  icon: Plus,       href: "/dashboard/policy-management/create" },
];

// Deduplicated clean action list
const quickActions = [
  { id: "add-client",  label: "Add Client",  icon: Users,      href: "/dashboard/client-management/new"    },
  { id: "new-policy",  label: "New Policy",  icon: Shield,     href: "/dashboard/policy-management/create" },
  { id: "new-claim",   label: "New Claim",   icon: FileText,   href: "/dashboard/claims-management/new"    },
  { id: "log-payment", label: "Log Payment", icon: CreditCard, href: "/dashboard/payment-management/new"   },
  { id: "find-client", label: "Find Client", icon: Search,     href: "/dashboard/client-management"        },
];

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  const router = useRouter();

  const handleClick = (id: string, href: string) => {
    onActionClick?.(id);
    router.push(href);
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => handleClick(action.id, action.href)}
            className="flex flex-col items-center gap-2 py-3 px-1 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight font-medium">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
