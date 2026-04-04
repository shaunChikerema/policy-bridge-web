"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Using your existing Notification interface with extensions
interface NotificationExtended {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  // Extended properties
  priority: "low" | "medium" | "high";
  notificationType:
    | "policy_expiry"
    | "claim_update"
    | "payment_due"
    | "client_update"
    | "system";
  relatedId?: string;
  relatedType?: "client" | "policy" | "claim" | "payment";
  actionUrl?: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationExtended[]>(
    []
  );
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockNotifications: NotificationExtended[] = [
      {
        id: "1",
        type: "warning",
        notificationType: "policy_expiry",
        title: "Policy Expiring Soon",
        message: "Policy POL-2024-001 for John Smith expires in 7 days",
        read: false,
        priority: "high",
        createdAt: "2024-01-15T10:30:00Z",
        relatedId: "POL-2024-001",
        relatedType: "policy",
        actionUrl: "/dashboard/policy-management/POL-2024-001",
      },
      {
        id: "2",
        type: "info",
        notificationType: "claim_update",
        title: "Claim Status Updated",
        message: "Claim CLM-2024-015 has been approved for processing",
        read: false,
        priority: "medium",
        createdAt: "2024-01-15T09:15:00Z",
        relatedId: "CLM-2024-015",
        relatedType: "claim",
        actionUrl: "/dashboard/claims-management/CLM-2024-015",
      },
      {
        id: "3",
        type: "error",
        notificationType: "payment_due",
        title: "Payment Overdue",
        message: "Payment of $1,250 is overdue for Policy POL-2024-008",
        read: true,
        priority: "high",
        createdAt: "2024-01-14T14:22:00Z",
        relatedId: "POL-2024-008",
        relatedType: "policy",
        actionUrl: "/dashboard/payment-management",
      },
      {
        id: "4",
        type: "success",
        notificationType: "client_update",
        title: "New Client Registration",
        message:
          "Sarah Johnson has completed registration and submitted documents",
        read: false,
        priority: "low",
        createdAt: "2024-01-14T11:45:00Z",
        relatedId: "CLI-2024-032",
        relatedType: "client",
        actionUrl: "/dashboard/client-management/CLI-2024-032",
      },
      {
        id: "5",
        type: "info",
        notificationType: "system",
        title: "System Maintenance",
        message: "Scheduled maintenance will occur on Sunday 2AM - 4AM EST",
        read: true,
        priority: "medium",
        createdAt: "2024-01-13T16:00:00Z",
      },
      {
        id: "6",
        type: "warning",
        notificationType: "claim_update",
        title: "Claim Requires Additional Information",
        message:
          "Claim CLM-2024-020 is pending additional documentation from client",
        read: false,
        priority: "medium",
        createdAt: "2024-01-13T08:30:00Z",
        relatedId: "CLM-2024-020",
        relatedType: "claim",
        actionUrl: "/dashboard/claims-management/CLM-2024-020",
      },
      {
        id: "7",
        type: "success",
        notificationType: "payment_due",
        title: "Payment Received",
        message: "Payment of $875 received for Policy POL-2024-005",
        read: true,
        priority: "low",
        createdAt: "2024-01-12T16:45:00Z",
        relatedId: "POL-2024-005",
        relatedType: "policy",
      },
      {
        id: "8",
        type: "error",
        notificationType: "system",
        title: "System Error Resolved",
        message: "The payment processing issue has been resolved",
        read: false,
        priority: "medium",
        createdAt: "2024-01-12T14:20:00Z",
      },
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (
    notificationType: NotificationExtended["notificationType"],
    type: NotificationExtended["type"]
  ) => {
    const iconClass = "w-4 h-4";

    const getTypeIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle className={`${iconClass} text-green-600`} />;
        case "error":
          return <X className={`${iconClass} text-red-600`} />;
        case "warning":
          return <AlertTriangle className={`${iconClass} text-orange-600`} />;
        case "info":
        default:
          return <Info className={`${iconClass} text-blue-600`} />;
      }
    };

    const getTypeColor = () => {
      switch (type) {
        case "success":
          return "bg-green-100";
        case "error":
          return "bg-red-100";
        case "warning":
          return "bg-orange-100";
        case "info":
        default:
          return "bg-blue-100";
      }
    };

    return (
      <div
        className={`${getTypeColor()} rounded-full p-2 flex items-center justify-center flex-shrink-0`}
      >
        {getTypeIcon()}
      </div>
    );
  };

  const getPriorityColor = (priority: NotificationExtended["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-400";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-l-yellow-400";
      case "low":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-l-gray-400";
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "read" && !notification.read) return false;
    if (filter === "unread" && notification.read) return false;
    if (typeFilter !== "all" && notification.notificationType !== typeFilter)
      return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="space-y-3 mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>

          {/* Filter skeleton */}
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>

          {/* Notification skeletons */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-2 sm:space-y-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium flex-shrink-0 touch-manipulation active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Mark All Read</span>
              <span className="sm:hidden">Read All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
        {/* Status Filter */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["all", "unread", "read"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                filter === filterOption
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="all">All Types</option>
          <option value="policy_expiry">Policy Expiry</option>
          <option value="claim_update">Claim Updates</option>
          <option value="payment_due">Payment Due</option>
          <option value="client_update">Client Updates</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Notifications List - Mobile Optimized */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 ${getPriorityColor(
                notification.priority
              )} ${
                !notification.read
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-800/50"
              } touch-manipulation`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  {getNotificationIcon(
                    notification.notificationType,
                    notification.type
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-medium text-sm sm:text-base ${
                            !notification.read
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                        )}
                      </div>

                      {/* Actions - Mobile Optimized */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          notification.priority === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : notification.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {notification.priority}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    {/* Message */}
                    <p
                      className={`text-sm ${
                        !notification.read
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-600 dark:text-gray-400"
                      } leading-relaxed`}
                    >
                      {notification.message}
                    </p>

                    {/* Action Button */}
                    {((notification.relatedType && notification.relatedId) ||
                      notification.actionUrl) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline touch-manipulation active:scale-95"
                          onClick={() => {
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          View {notification.relatedType || "details"} →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredNotifications.length >= 20 && (
        <div className="text-center mt-8">
          <button className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95">
            Load More Notifications
          </button>
        </div>
      )}

      {/* Custom Mobile Styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .touch-manipulation {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
