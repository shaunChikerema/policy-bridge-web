// src/hooks/useNotifications.ts - Compatible with your existing types

import { useState, useEffect, useCallback } from 'react';

// Using your existing Notification interface with extensions
export interface ExtendedNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  // Extended properties
  priority: 'low' | 'medium' | 'high';
  notificationType: 'policy_expiry' | 'claim_update' | 'payment_due' | 'client_update' | 'system';
  relatedId?: string;
  relatedType?: 'client' | 'policy' | 'claim' | 'payment';
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (filters?: {
    filter?: 'all' | 'read' | 'unread';
    type?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.filter) params.append('filter', filters.filter);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount: getUnreadCount(),
  };
};

// Helper functions to create notifications that match your existing types
export const createNotificationFromActivity = (activity: {
  id: string;
  type: 'policy' | 'claim' | 'client' | 'payment';
  title: string;
  description: string;
  time: string;
  status?: string;
}): ExtendedNotification => {
  const getNotificationType = (activityType: string) => {
    switch (activityType) {
      case 'policy':
        return 'policy_expiry' as const;
      case 'claim':
        return 'claim_update' as const;
      case 'payment':
        return 'payment_due' as const;
      case 'client':
        return 'client_update' as const;
      default:
        return 'system' as const;
    }
  };

  const getAlertType = (activityType: string, status?: string) => {
    if (status === 'Overdue' || status === 'Failed') return 'error' as const;
    if (status === 'Pending' || status === 'Processing') return 'warning' as const;
    if (status === 'Completed' || status === 'Approved' || status === 'Paid') return 'success' as const;
    return 'info' as const;
  };

  const getPriority = (activityType: string, status?: string) => {
    if (status === 'Overdue' || status === 'Failed') return 'high' as const;
    if (status === 'Pending' || activityType === 'claim') return 'medium' as const;
    return 'low' as const;
  };

  return {
    id: `notif-${activity.id}`,
    type: getAlertType(activity.type, activity.status),
    title: activity.title,
    message: activity.description,
    read: false,
    createdAt: activity.time,
    priority: getPriority(activity.type, activity.status),
    notificationType: getNotificationType(activity.type),
    relatedId: activity.id,
    relatedType: activity.type as 'client' | 'policy' | 'claim' | 'payment',
  };
};

// Utility functions for creating specific notification types
export const createPolicyExpiryNotification = (
  policyId: string, 
  clientName: string, 
  daysUntilExpiry: number
): ExtendedNotification => ({
  id: `policy-expiry-${policyId}`,
  type: daysUntilExpiry <= 3 ? 'error' : 'warning',
  title: 'Policy Expiring Soon',
  message: `Policy ${policyId} for ${clientName} expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`,
  read: false,
  createdAt: new Date().toISOString(),
  priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
  notificationType: 'policy_expiry',
  relatedId: policyId,
  relatedType: 'policy',
  actionUrl: `/dashboard/policy-management/${policyId}`,
});

export const createClaimUpdateNotification = (
  claimId: string, 
  status: string
): ExtendedNotification => ({
  id: `claim-update-${claimId}`,
  type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info',
  title: 'Claim Status Updated',
  message: `Claim ${claimId} has been ${status.toLowerCase()}`,
  read: false,
  createdAt: new Date().toISOString(),
  priority: 'medium',
  notificationType: 'claim_update',
  relatedId: claimId,
  relatedType: 'claim',
  actionUrl: `/dashboard/claims-management/${claimId}`,
});

export const createPaymentNotification = (
  policyId: string, 
  amount: number, 
  isOverdue: boolean = false
): ExtendedNotification => ({
  id: `payment-${policyId}-${Date.now()}`,
  type: isOverdue ? 'error' : 'warning',
  title: isOverdue ? 'Payment Overdue' : 'Payment Due Soon',
  message: `Payment of $${amount.toLocaleString()} is ${isOverdue ? 'overdue' : 'due soon'} for Policy ${policyId}`,
  read: false,
  createdAt: new Date().toISOString(),
  priority: isOverdue ? 'high' : 'medium',
  notificationType: 'payment_due',
  relatedId: policyId,
  relatedType: 'payment',
  actionUrl: '/dashboard/payment-management',
});