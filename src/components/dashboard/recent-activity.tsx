// Enhanced Mobile-Optimized Recent Activity Component
"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  priority?: "high" | "medium" | "low";
  isRead?: boolean;
  type: "success" | "warning" | "info" | "error";
  metadata?: {
    amount?: number;
    clientName?: string;
    status?: string;
    duration?: string;
  };
}

interface RecentActivityProps {
  isDarkMode: boolean;
  limit?: number;
  activities?: ActivityItem[];
  isLoading?: boolean;
  onActivityClick?: (activityId: string) => void;
  showFilters?: boolean;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
};

function MobileActivityItem({
  activity,
  isDarkMode,
  onActivityClick,
  layout = "compact",
}: {
  activity: ActivityItem;
  isDarkMode: boolean;
  onActivityClick: (id: string, href: string) => void;
  layout?: "compact" | "detailed";
}) {
  const Icon = activity.icon;

  const typeStyles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200/50 dark:border-green-500/20",
      iconBg: "bg-green-500",
      dot: "bg-green-500",
    },
    warning: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200/50 dark:border-orange-500/20",
      iconBg: "bg-orange-500",
      dot: "bg-orange-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200/50 dark:border-blue-500/20",
      iconBg: "bg-blue-500",
      dot: "bg-blue-500",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200/50 dark:border-red-500/20",
      iconBg: "bg-red-500",
      dot: "bg-red-500",
    },
  };

  const typeStyle = typeStyles[activity.type];

  if (layout === "compact") {
    return (
      <button
        onClick={() => onActivityClick(activity.id, activity.href)}
        className={`
          group flex items-center space-x-3 w-full text-left p-3 rounded-xl
          transition-all duration-200 active:scale-98
          ${
            activity.isRead
              ? "bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50"
              : `${typeStyle.bg} border ${typeStyle.border}`
          }
          hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30
        `}
      >
        {/* Icon with status indicator */}
        <div className="relative flex-shrink-0">
          <div
            className={`
            w-8 h-8 rounded-lg ${typeStyle.iconBg} flex items-center justify-center
            transition-transform group-active:scale-90
          `}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          {!activity.isRead && (
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 ${typeStyle.dot} rounded-full border-2 border-white dark:border-gray-800`}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p
                className={`
                text-sm font-medium text-gray-900 dark:text-white line-clamp-1
                ${!activity.isRead ? "font-semibold" : ""}
              `}
              >
                {activity.action}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                {activity.details}
              </p>
              {activity.metadata?.clientName && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {activity.metadata.clientName}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Detailed layout
  return (
    <button
      onClick={() => onActivityClick(activity.id, activity.href)}
      className={`
        group w-full text-left p-4 rounded-2xl border transition-all duration-200
        ${
          activity.isRead
            ? "bg-white dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50"
            : `${typeStyle.bg} ${typeStyle.border}`
        }
        hover:shadow-md hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20
        focus:outline-none focus:ring-2 focus:ring-blue-500/30
        active:scale-98
      `}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div
            className={`
            w-12 h-12 rounded-2xl ${typeStyle.iconBg} shadow-lg
            flex items-center justify-center transition-transform group-hover:scale-110
          `}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {!activity.isRead && (
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 ${typeStyle.dot} rounded-full border-2 border-white dark:border-gray-800`}
            />
          )}
          {activity.priority === "high" && (
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <AlertTriangle className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h4
                className={`
                font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 
                dark:group-hover:text-blue-400 transition-colors
                ${!activity.isRead ? "font-bold" : ""}
              `}
              >
                {activity.action}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {activity.details}
              </p>
            </div>

            <div className="flex items-center space-x-2 ml-4 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>

          {/* Metadata */}
          {activity.metadata && (
            <div className="flex items-center space-x-4 text-xs">
              {activity.metadata.clientName && (
                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
                  {activity.metadata.clientName}
                </span>
              )}
              {activity.metadata.amount && (
                <span className="text-gray-600 dark:text-gray-400">
                  P {activity.metadata.amount.toLocaleString()}
                </span>
              )}
              {activity.metadata.status && (
                <span
                  className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${
                    activity.metadata.status === "completed"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : activity.metadata.status === "pending"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                  }
                `}
                >
                  {activity.metadata.status}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function RecentActivity({
  isDarkMode,
  limit = 6,
  activities,
  isLoading = false,
  onActivityClick,
  showFilters = false,
}: RecentActivityProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Enhanced sample activities with better categorization
  const defaultActivities: ActivityItem[] = useMemo(
    () => [
      {
        id: "activity-1",
        action: "New Policy Created",
        details: "Motor Comprehensive policy issued successfully",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: FileText,
        color: "blue",
        href: "/dashboard/policy-management",
        priority: "high",
        isRead: false,
        type: "success",
        metadata: {
          clientName: "Kealeboga Matlho",
          status: "active",
        },
      },
      {
        id: "activity-2",
        action: "Claim Approved",
        details: "Property damage claim processed",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        icon: CheckCircle,
        color: "green",
        href: "/dashboard/claims-management",
        priority: "high",
        isRead: false,
        type: "success",
        metadata: {
          amount: 45000,
          status: "completed",
        },
      },
      {
        id: "activity-3",
        action: "Payment Received",
        details: "Premium payment via bank transfer",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        icon: CreditCard,
        color: "purple",
        href: "/dashboard/payment-management",
        priority: "medium",
        isRead: true,
        type: "info",
        metadata: {
          clientName: "Tech Solutions Ltd",
          amount: 18500,
          status: "completed",
        },
      },
      {
        id: "activity-4",
        action: "Meeting Scheduled",
        details: "Policy review meeting confirmed",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        icon: Calendar,
        color: "orange",
        href: "/dashboard/calendar",
        priority: "medium",
        isRead: true,
        type: "info",
        metadata: {
          clientName: "Thabo Segwai",
          status: "scheduled",
        },
      },
      {
        id: "activity-5",
        action: "Client Registered",
        details: "New client onboarding completed",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        icon: UserPlus,
        color: "teal",
        href: "/dashboard/client-management",
        priority: "low",
        isRead: true,
        type: "success",
        metadata: {
          clientName: "Mpho Kgomo",
          status: "active",
        },
      },
      {
        id: "activity-6",
        action: "Renewals Due",
        details: "15 policies require renewal attention",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: Bell,
        color: "red",
        href: "/dashboard/renewals",
        priority: "high",
        isRead: true,
        type: "warning",
        metadata: {
          status: "pending",
        },
      },
    ],
    []
  );

  const displayActivities = useMemo(() => {
    const activityList = activities || defaultActivities;
    let filtered = [...activityList];

    // Apply filters
    if (filter === "unread") {
      filtered = filtered.filter((activity) => !activity.isRead);
    } else if (filter === "high") {
      filtered = filtered.filter((activity) => activity.priority === "high");
    }

    // Sort by timestamp
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    const displayLimit = isMobile
      ? showAll
        ? filtered.length
        : Math.min(3, limit)
      : limit;
    return displayLimit ? filtered.slice(0, displayLimit) : filtered;
  }, [activities, defaultActivities, filter, limit, isMobile, showAll]);

  const handleActivityClick = useCallback(
    (activityId: string, href: string) => {
      onActivityClick?.(activityId);
      router.push(href);
    },
    [router, onActivityClick]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const unreadCount = (activities || defaultActivities).filter(
    (activity) => !activity.isRead
  ).length;

  const highPriorityCount = (activities || defaultActivities).filter(
    (activity) => activity.priority === "high"
  ).length;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(isMobile ? 3 : 4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </div>
          <div>
            <h3
              className={`font-bold text-gray-900 dark:text-white ${
                isMobile ? "text-base" : "text-lg"
              }`}
            >
              Recent Activity
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} new updates` : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showFilters && !isMobile && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700">
              {["all", "unread", "high"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as typeof filter)}
                  className={`
                    px-2 py-1 text-xs font-medium rounded transition-colors
                    ${
                      filter === filterType
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  {filterType === "all"
                    ? "All"
                    : filterType === "unread"
                    ? "New"
                    : "Urgent"}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 text-gray-600 dark:text-gray-300 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {!isMobile && (
            <button
              onClick={() => router.push("/dashboard/activity")}
              className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="px-4 pb-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium mb-1">No recent activity</p>
            <p className="text-xs">Your updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayActivities.map((activity) => (
              <MobileActivityItem
                key={activity.id}
                activity={activity}
                isDarkMode={isDarkMode}
                onActivityClick={handleActivityClick}
                layout={isMobile ? "compact" : "detailed"}
              />
            ))}
          </div>
        )}

        {/* Mobile show more/less */}
        {isMobile && (activities || defaultActivities).length > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {showAll ? "Show Less" : "View All Activity"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
