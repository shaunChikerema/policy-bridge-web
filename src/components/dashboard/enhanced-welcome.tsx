"use client";

import { TrendingUp } from "lucide-react";
import React from "react";

interface EnhancedWelcomeSectionProps {
  isMobile?: boolean;
  userDisplayName?: string;
  userRole?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const EnhancedWelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({
  isMobile = false,
  userDisplayName = "User",
  userRole = "Insurance Professional",
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}) => {
  const currentTime = new Date();
  const hour = currentTime.getHours();

  const getGreeting = (): string => {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = (): string => {
    const messages = [
      "Let's make today productive",
      "Your business is growing strong",
      "Ready to tackle new opportunities",
      "Building success, one policy at a time",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (isMobile) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30 p-4 mb-4">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

        <div className="relative flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {getGreeting()}, {userDisplayName?.split(" ")[0] || "there"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {getMotivationalMessage()}
                </p>
              </>
            )}
          </div>

          {/* Compact status indicator */}
          <div className="flex items-center space-x-2 ml-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Live
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl border border-blue-200/50 dark:border-blue-800/50 p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-500">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          {/* Time-based greeting with premium typography */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-1 tracking-tight">
                {getGreeting()}, {userDisplayName?.split(" ")[0] || "there"}
              </h1>

              <p className="text-base text-gray-600 dark:text-gray-400">
                {getMotivationalMessage()}
              </p>
            </>
          )}

          {/* Quick insights bar */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-300">
                All systems operational
              </span>
            </div>
            {userRole && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>•</span>
                <span>{userRole}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side icon - matches your existing design but enhanced */}
        <div className="hidden md:block ml-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent dark:via-blue-700/50" />
    </div>
  );
};

export default EnhancedWelcomeSection;
