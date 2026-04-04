'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  className?: string;
  separator?: React.ReactNode;
  homeIcon?: boolean;
}

// Route mapping for cleaner breadcrumb labels
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'client-management': 'Client Management',
  'policy-management': 'Policy Management', 
  'claims-management': 'Claims Management',
  'payment-management': 'Payment Management',
  reports: 'Reports',
  calendar: 'Calendar',
  notifications: 'Notifications',
  profile: 'Profile',
  settings: 'Settings',
  help: 'Help & Support',
  subscription: 'Subscription',
  new: 'Create New',
  edit: 'Edit',
  revenue: 'Revenue Report',
  renewals: 'Renewals Report',
  'process-time': 'Process Time Report',
};

export function Breadcrumbs({ 
  className, 
  separator = <ChevronRight className="h-4 w-4" />,
  homeIcon = true
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Remove empty segments and filter out route groups
    const segments = pathname
      .split('/')
      .filter(segment => segment && !segment.startsWith('('));
    
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Add home/dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      isCurrentPage: pathname === '/dashboard'
    });
    
    // Skip the first 'dashboard' segment since we added it above
    let currentPath = '/dashboard';
    
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      // Check if this is the last segment (current page)
      const isCurrentPage = i === segments.length - 1;
      
      // Get clean label for the segment
      const label = routeLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage
      });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumbs if we're just on the dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1 text-sm', className)}>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && (
            <div className="flex items-center text-muted-foreground mr-1">
              {separator}
            </div>
          )}
          
          {breadcrumb.isCurrentPage ? (
            <span 
              className="font-medium text-foreground"
              aria-current="page"
            >
              {index === 0 && homeIcon ? (
                <div className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>{breadcrumb.label}</span>
                </div>
              ) : (
                breadcrumb.label
              )}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {index === 0 && homeIcon ? (
                <div className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>{breadcrumb.label}</span>
                </div>
              ) : (
                breadcrumb.label
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}