import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building,
  DollarSign,
  Minus,
  Users,
} from "lucide-react";
import React, { useMemo } from "react";

interface StatsProps {
  clients?: any[];
  policies?: any[];
  claims?: any[];
  payments?: any[];
  isLoading?: boolean;
  isDarkMode?: boolean;
}

interface StatData {
  title: string;
  value: number | string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
  isImportant?: boolean;
}

function EnhancedMobileStatCard({
  stat,
  isLoading,
  isDarkMode,
  layout = "featured",
  size = "normal",
}: {
  stat: StatData;
  isLoading?: boolean;
  isDarkMode?: boolean;
  layout?: "featured" | "compact" | "mini";
  size?: "normal" | "large";
}) {
  const Icon = stat.icon;

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-green-500 to-green-600 shadow-green-500/25",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
  };

  const trendStyles = {
    up: {
      icon: ArrowUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
    },
    down: {
      icon: ArrowDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
    },
    neutral: {
      icon: Minus,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-700/20",
      border: "border-gray-200 dark:border-gray-700",
    },
  };

  const colorClass =
    colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.blue;
  const TrendIcon = stat.trend ? trendStyles[stat.trend].icon : null;
  const trendStyle = stat.trend ? trendStyles[stat.trend] : null;

  if (isLoading) {
    return (
      <div
        className={`
        bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50
        ${layout === "featured" ? "p-5" : layout === "compact" ? "p-4" : "p-3"}
      `}
      >
        <div className="animate-pulse">
          {layout === "featured" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ) : layout === "compact" ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Featured layout - for primary stats
  if (layout === "featured") {
    return (
      <div
        className={`
        relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl 
        border border-gray-200/50 dark:border-gray-700/50
        hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20
        transition-all duration-300 hover:border-gray-300/50 dark:hover:border-gray-600/50
        ${stat.isImportant ? "ring-2 ring-blue-500/20 shadow-md" : "shadow-sm"}
        ${size === "large" ? "p-6" : "p-5"}
      `}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-900/30"></div>

        <div className="relative">
          {/* Header with icon and trend */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`
                ${size === "large" ? "w-14 h-14" : "w-12 h-12"} 
                rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg
                flex items-center justify-center transform transition-transform hover:scale-105
              `}
            >
              <Icon
                className={`${
                  size === "large" ? "w-7 h-7" : "w-6 h-6"
                } text-white`}
              />
            </div>

            {stat.change !== undefined && trendStyle && TrendIcon && (
              <div
                className={`
                flex items-center space-x-1 px-3 py-1.5 rounded-full border
                ${trendStyle.bg} ${trendStyle.border}
              `}
              >
                <TrendIcon className={`w-3 h-3 ${trendStyle.color}`} />
                <span className={`text-xs font-semibold ${trendStyle.color}`}>
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Value */}
          <div
            className={`
            ${size === "large" ? "text-3xl" : "text-2xl"} 
            font-bold text-gray-900 dark:text-white mb-2 tracking-tight
          `}
          >
            {stat.value}
          </div>

          {/* Title */}
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {stat.title}
          </div>

          {/* Subtitle */}
          {stat.subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stat.subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact layout - for secondary stats
  if (layout === "compact") {
    return (
      <div
        className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50
        hover:shadow-md transition-all duration-200 p-4
        ${stat.isImportant ? "ring-1 ring-blue-500/20" : ""}
      `}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`
            w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} shadow-md
            flex items-center justify-center flex-shrink-0
          `}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
              {stat.change !== undefined && trendStyle && TrendIcon && (
                <div
                  className={`
                  flex items-center space-x-1 px-2 py-0.5 rounded-full
                  ${trendStyle.bg}
                `}
                >
                  <TrendIcon className={`w-3 h-3 ${trendStyle.color}`} />
                  <span className={`text-xs font-medium ${trendStyle.color}`}>
                    {Math.abs(stat.change).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {stat.title}
            </div>
            {stat.subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {stat.subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mini layout - for grid display (more compact)
  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50
      hover:shadow-md transition-all duration-200 p-2.5 text-center
      ${stat.isImportant ? "ring-1 ring-blue-500/20" : ""}
    `}
    >
      <div
        className={`
        w-7 h-7 rounded-lg bg-gradient-to-br ${colorClass} shadow-md
        flex items-center justify-center mx-auto mb-1.5
      `}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="text-lg font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">
        {stat.value}
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight mb-1">
        {stat.title}
      </div>

      {stat.change !== undefined && trendStyle && TrendIcon && (
        <div
          className={`
          inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md
          ${trendStyle.bg}
        `}
        >
          <TrendIcon className={`w-2.5 h-2.5 ${trendStyle.color}`} />
          <span className={`text-xs font-medium ${trendStyle.color}`}>
            {Math.abs(stat.change).toFixed(1)}%
          </span>
        </div>
      )}

      {stat.subtitle && !stat.change && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {stat.subtitle}
        </div>
      )}
    </div>
  );
}

export default function EnhancedStats({
  clients = [],
  policies = [],
  claims = [],
  payments = [],
  isLoading = false,
  isDarkMode = false,
}: StatsProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(
      (client) => client.status === "Active" || client.status === "active"
    ).length;

    const totalPolicies = policies.length;
    const activePolicies = policies.filter(
      (policy) => policy.status === "Active" || policy.status === "active"
    ).length;

    const openClaims = claims.filter((claim) =>
      ["Open", "Processing", "Under Review", "Pending"].includes(claim.status)
    ).length;

    const totalPremiumValue = policies.reduce(
      (sum, policy) => sum + (Number(policy.premium_amount) || 0),
      0
    );

    const clientsChange = totalClients > 0 ? 8.2 : 0;
    const policiesChange = activePolicies > 0 ? 12.5 : 0;
    const claimsChange = openClaims > 0 ? -5.1 : 0;
    const premiumChange = totalPremiumValue > 0 ? 15.3 : 0;

    return [
      {
        title: "Total Clients",
        value: totalClients.toLocaleString(),
        change: clientsChange,
        trend:
          clientsChange > 0 ? "up" : clientsChange < 0 ? "down" : "neutral",
        icon: Users,
        color: "blue",
        subtitle: `${activeClients} active`,
        isImportant: true,
      },
      {
        title: "Active Policies",
        value: activePolicies.toLocaleString(),
        change: policiesChange,
        trend:
          policiesChange > 0 ? "up" : policiesChange < 0 ? "down" : "neutral",
        icon: Building,
        color: "green",
        subtitle: `${totalPolicies - activePolicies} inactive`,
      },
      {
        title: "Open Claims",
        value: openClaims.toLocaleString(),
        change: claimsChange,
        trend: claimsChange > 0 ? "up" : claimsChange < 0 ? "down" : "neutral",
        icon: AlertCircle,
        color: "orange",
        subtitle: openClaims > 0 ? "Needs attention" : "All resolved",
        isImportant: openClaims > 0,
      },
      {
        title: "Premium Value",
        value:
          totalPremiumValue >= 1000000
            ? `P ${(totalPremiumValue / 1000000).toFixed(1)}M`
            : totalPremiumValue >= 1000
            ? `P ${(totalPremiumValue / 1000).toFixed(0)}K`
            : `P ${totalPremiumValue.toLocaleString()}`,
        change: premiumChange,
        trend:
          premiumChange > 0 ? "up" : premiumChange < 0 ? "down" : "neutral",
        icon: DollarSign,
        color: "purple",
        subtitle: "Monthly recurring",
      },
    ] as StatData[];
  }, [clients, policies, claims, payments]);

  // Enhanced mobile layout - all mini cards for consistency
  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat) => (
          <EnhancedMobileStatCard
            key={stat.title}
            stat={stat}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            layout="mini"
          />
        ))}
      </div>
    );
  }

  // Tablet layout - compact cards in 2 columns
  if (isTablet) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <EnhancedMobileStatCard
            key={stat.title}
            stat={stat}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            layout="compact"
          />
        ))}
      </div>
    );
  }

  // Desktop layout - all cards in row
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <EnhancedMobileStatCard
          key={stat.title}
          stat={stat}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          layout="featured"
          size="large"
        />
      ))}
    </div>
  );
}
