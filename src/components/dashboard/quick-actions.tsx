"use client";

import {
  BarChart3,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  Plus,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface QuickAction {
  id: string;
  title: string;
  shortTitle?: string; // For mobile
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  isPopular?: boolean;
  priority: number; // For mobile filtering
}

interface QuickActionsProps {
  isDarkMode?: boolean;
  limit?: number;
  onActionClick?: (actionId: string) => void;
}

const quickActions: QuickAction[] = [
  {
    id: "new-policy",
    title: "New Policy",
    shortTitle: "Policy",
    description: "Create insurance policy",
    icon: Plus,
    color: "blue",
    href: "/dashboard/policy-management/create",
    isPopular: true,
    priority: 1,
  },
  {
    id: "find-client",
    title: "Find Client",
    shortTitle: "Find",
    description: "Search & manage clients",
    icon: Search,
    color: "green",
    href: "/dashboard/client-management",
    isPopular: true,
    priority: 1,
  },
  {
    id: "add-client",
    title: "Add Client",
    shortTitle: "Client",
    description: "Register new client",
    icon: Users,
    color: "purple",
    href: "/dashboard/client-management/new",
    priority: 1,
  },
  {
    id: "payment",
    title: "Log Payment",
    shortTitle: "Payment",
    description: "Record premium payment",
    icon: CreditCard,
    color: "teal",
    href: "/dashboard/payment-management/new",
    priority: 1,
  },
  {
    id: "new-claim",
    title: "New Claim",
    shortTitle: "Claim",
    description: "Process insurance claim",
    icon: FileText,
    color: "orange",
    href: "/dashboard/claims-management/new",
    isPopular: true,
    priority: 2,
  },
  {
    id: "schedule",
    title: "Schedule Meeting",
    shortTitle: "Calendar",
    description: "Book client appointment",
    icon: Calendar,
    color: "indigo",
    href: "/dashboard/calendar",
    priority: 3,
  },
  {
    id: "reports",
    title: "Reports",
    shortTitle: "Reports",
    description: "View analytics & insights",
    icon: BarChart3,
    color: "pink",
    href: "/dashboard/reports",
    priority: 2,
  },
  {
    id: "renewals",
    title: "Renewals",
    shortTitle: "Renewals",
    description: "Manage policy renewals",
    icon: FileText,
    color: "emerald",
    href: "/dashboard/renewals",
    priority: 3,
  },
];

function ActionCard({
  action,
  isDarkMode,
  onActionClick,
  isMobile,
}: {
  action: QuickAction;
  isDarkMode: boolean;
  onActionClick: (id: string, href: string) => void;
  isMobile: boolean;
}) {
  const colorClasses = {
    blue: {
      bg: isDarkMode
        ? "bg-blue-500/10 border-blue-500/20"
        : "bg-blue-50 border-blue-200/50",
      text: isDarkMode ? "text-blue-400" : "text-blue-600",
      hover: isDarkMode ? "hover:bg-blue-500/20" : "hover:bg-blue-100",
    },
    green: {
      bg: isDarkMode
        ? "bg-green-500/10 border-green-500/20"
        : "bg-green-50 border-green-200/50",
      text: isDarkMode ? "text-green-400" : "text-green-600",
      hover: isDarkMode ? "hover:bg-green-500/20" : "hover:bg-green-100",
    },
    purple: {
      bg: isDarkMode
        ? "bg-purple-500/10 border-purple-500/20"
        : "bg-purple-50 border-purple-200/50",
      text: isDarkMode ? "text-purple-400" : "text-purple-600",
      hover: isDarkMode ? "hover:bg-purple-500/20" : "hover:bg-purple-100",
    },
    teal: {
      bg: isDarkMode
        ? "bg-teal-500/10 border-teal-500/20"
        : "bg-teal-50 border-teal-200/50",
      text: isDarkMode ? "text-teal-400" : "text-teal-600",
      hover: isDarkMode ? "hover:bg-teal-500/20" : "hover:bg-teal-100",
    },
    orange: {
      bg: isDarkMode
        ? "bg-orange-500/10 border-orange-500/20"
        : "bg-orange-50 border-orange-200/50",
      text: isDarkMode ? "text-orange-400" : "text-orange-600",
      hover: isDarkMode ? "hover:bg-orange-500/20" : "hover:bg-orange-100",
    },
    indigo: {
      bg: isDarkMode
        ? "bg-indigo-500/10 border-indigo-500/20"
        : "bg-indigo-50 border-indigo-200/50",
      text: isDarkMode ? "text-indigo-400" : "text-indigo-600",
      hover: isDarkMode ? "hover:bg-indigo-500/20" : "hover:bg-indigo-100",
    },
    pink: {
      bg: isDarkMode
        ? "bg-pink-500/10 border-pink-500/20"
        : "bg-pink-50 border-pink-200/50",
      text: isDarkMode ? "text-pink-400" : "text-pink-600",
      hover: isDarkMode ? "hover:bg-pink-500/20" : "hover:bg-pink-100",
    },
    emerald: {
      bg: isDarkMode
        ? "bg-emerald-500/10 border-emerald-500/20"
        : "bg-emerald-50 border-emerald-200/50",
      text: isDarkMode ? "text-emerald-400" : "text-emerald-600",
      hover: isDarkMode ? "hover:bg-emerald-500/20" : "hover:bg-emerald-100",
    },
  };

  const Icon = action.icon;
  const colors =
    colorClasses[action.color as keyof typeof colorClasses] ||
    colorClasses.blue;

  if (isMobile) {
    // Compact mobile layout
    return (
      <button
        onClick={() => onActionClick(action.id, action.href)}
        className={`
          group flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200
          ${colors.bg} hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500/30
        `}
        aria-label={`${action.title}: ${action.description}`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>

        {/* Title */}
        <span className={`text-xs font-medium ${colors.text} truncate`}>
          {action.shortTitle || action.title}
        </span>

        {/* Popular indicator */}
        {action.isPopular && (
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
        )}
      </button>
    );
  }

  // Desktop layout (original)
  return (
    <button
      onClick={() => onActionClick(action.id, action.href)}
      className={`
        group relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300
        bg-white dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50
        hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20
        hover:-translate-y-1 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500/30
        min-h-[120px] w-full text-left
      `}
      aria-label={`${action.title}: ${action.description}`}
    >
      {/* Popular badge */}
      {action.isPopular && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Icon */}
      <div
        className={`p-3 rounded-xl border mb-3 ${colors.bg} transition-all duration-300 group-hover:scale-110`}
      >
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {action.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {action.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
      </div>
    </button>
  );
}

export default function QuickActions({
  isDarkMode = false,
  limit,
  onActionClick,
}: QuickActionsProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleActionClick = useCallback(
    (actionId: string, href: string) => {
      onActionClick?.(actionId);
      router.push(href);
    },
    [router, onActionClick]
  );

  // Filter actions based on mobile/desktop and priority
  const getActionsToShow = () => {
    if (isMobile && !showAll) {
      // Show only high priority actions on mobile initially
      return quickActions.filter((action) => action.priority === 1);
    }

    if (limit) {
      return quickActions.slice(0, limit);
    }

    return quickActions;
  };

  const displayActions = getActionsToShow();

  if (isMobile) {
    // Ultra compact mobile layout
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
          {!showAll &&
            quickActions.filter((a) => a.priority > 1).length > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium"
              >
                More
              </button>
            )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {displayActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isDarkMode={isDarkMode}
              onActionClick={handleActionClick}
              isMobile={isMobile}
            />
          ))}
        </div>

        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full mt-2 text-xs text-gray-500 dark:text-gray-400"
          >
            Show Less
          </button>
        )}
      </div>
    );
  }

  // Desktop layout (original)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Common tasks and shortcuts
            </p>
          </div>
        </div>

        {limit && limit < quickActions.length && (
          <button
            onClick={() => router.push("/dashboard/actions")}
            className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayActions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            isDarkMode={isDarkMode}
            onActionClick={handleActionClick}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}
