"use client";

import { useClients } from "@/hooks/useClients";
import { ClientFilters } from "@/lib/types";
import { formatPhoneNumber } from "@/lib/validation/clients";
import {
  AlertCircle, ChevronLeft, ChevronRight, Edit, Eye,
  Mail, MapPin, Phone, Plus, Search, Trash2, Users,
  Download, Upload, Calendar, TrendingUp, Target, Crown, Grid, List,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ClientManagementLoading() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-7 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 lg:h-24 bg-gray-300 rounded-xl"></div>)}
      </div>
      <div className="h-14 bg-gray-300 rounded-xl mb-4"></div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>)}
      </div>
    </div>
  );
}

function ClientCard({ client, onView, onEdit, onDelete, deleting }: any) {
  const getInitials = (f: string, l: string) => `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  const statusCls = client.is_active
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
    : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-semibold text-sm">{getInitials(client.first_name, client.last_name)}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{client.full_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Joined {new Date(client.join_date).toLocaleDateString("en-BW", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>
          {client.is_active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" /><span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Phone className="w-4 h-4 text-green-500 flex-shrink-0" /><span className="truncate">{formatPhoneNumber(client.phone || "")}</span>
        </div>
        {client.city && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" /><span className="truncate">{client.city}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex space-x-1">
          <button onClick={() => onView(client.id)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors touch-manipulation"><Eye className="w-4 h-4" /></button>
          <button onClick={() => onEdit(client.id)} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors touch-manipulation"><Edit className="w-4 h-4" /></button>
        </div>
        <button onClick={() => onDelete(client.id)} disabled={deleting === client.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors touch-manipulation disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ClientTableRow({ client, onView, onEdit, onDelete, deleting }: any) {
  const getInitials = (f: string, l: string) => `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{getInitials(client.first_name, client.last_name)}</span>
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">{client.full_name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{client.occupation || "Not specified"}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{client.email}</span></div>
          {client.phone && <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><Phone className="w-4 h-4 flex-shrink-0" /><span className="truncate">{formatPhoneNumber(client.phone)}</span></div>}
        </div>
      </td>
      <td className="py-4 px-4"><div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><MapPin className="w-4 h-4 flex-shrink-0" /><span>{client.city || "N/A"}</span></div></td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${client.is_active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400"}`}>
          {client.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-4 px-4"><div className="text-sm text-gray-600 dark:text-gray-300">{new Date(client.join_date).toLocaleDateString("en-BW")}</div></td>
      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => onView(client.id)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 hover:bg-blue-100 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={() => onEdit(client.id)} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors"><Edit className="w-4 h-4" /></button>
          <button onClick={() => onDelete(client.id)} disabled={deleting === client.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-500/20 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
}

function StatsCard({ title, value, icon: Icon, trend, subtitle, color, loading }: any) {
  const colorClasses: any = {
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mt-1 lg:mt-2 truncate">{loading ? "..." : value}</p>
          {trend && !loading && <div className="flex items-center space-x-1 mt-1"><TrendingUp className="w-3 h-3 text-green-500" /><span className="text-xs text-green-600 dark:text-green-400">{trend}</span></div>}
          {subtitle && !loading && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center ml-3 flex-shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
      </div>
    </div>
  );
}

function ClientManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "premium">("date");

  const parseStatus = (s: string | null): boolean | "all" => s === "true" ? true : s === "false" ? false : "all";

  const [filters, setFiltersState] = useState<ClientFilters>({
    search: searchParams.get("search") || "",
    is_active: parseStatus(searchParams.get("status")),
  });

  const { clients, stats, currentPage, totalPages, totalCount, loading, deleting, error, fetchClients, deleteClient, setPage, setFilters, clearError } = useClients(filters, 8);

  const successMessage = searchParams.get("success");

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP" }).format(amount);

  const realStats = (() => {
    if (loading || !clients.length) return null;
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const active = clients.filter(c => c.is_active).length;
    const newMonth = clients.filter(c => { const d = new Date(c.join_date); return d.getMonth() === cm && d.getFullYear() === cy; }).length;
    const lm = cm === 0 ? 11 : cm - 1, ly = cm === 0 ? cy - 1 : cy;
    const lastMonthCount = clients.filter(c => { const d = new Date(c.join_date); return d.getMonth() === lm && d.getFullYear() === ly; }).length;
    return {
      total_clients: clients.length,
      active_clients: active,
      new_this_month: newMonth,
      total_premium_value: clients.reduce((s, c) => s + (c.annual_income || 0), 0),
      active_percentage: Math.round((active / clients.length) * 100),
      monthly_growth: lastMonthCount === 0 ? (newMonth > 0 ? 100 : 0) : Math.round(((newMonth - lastMonthCount) / lastMonthCount) * 100),
    };
  })();

  const handleSearch = (v: string) => { const f = { ...filters, search: v }; setFiltersState(f); setFilters(f); };
  const handleStatus = (v: string) => { const f = { ...filters, is_active: v === "all" ? "all" : v === "active" ? true : false }; setFiltersState(f as ClientFilters); setFilters(f as ClientFilters); };
  const handleDelete = async (id: string) => { if (window.confirm("Delete this client? This cannot be undone.")) await deleteClient(id); };
  const getStatusVal = () => filters.is_active === "all" ? "all" : filters.is_active === true ? "active" : "inactive";

  const sorted = [...clients].sort((a, b) =>
    sortBy === "name" ? a.full_name.localeCompare(b.full_name)
    : sortBy === "premium" ? (b.annual_income || 0) - (a.annual_income || 0)
    : new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
  );

  if (error && !clients.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-500" /></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Clients</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={() => { clearError(); fetchClients(); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-28">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Client Portfolio</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">{loading ? "..." : totalCount} clients in portfolio</p>
            </div>
            <div className="hidden lg:flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"><Upload className="w-4 h-4" /><span>Import</span></button>
              <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"><Download className="w-4 h-4" /><span>Export</span></button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <StatsCard title="Total Clients" value={realStats?.total_clients || stats?.total_clients || 0} icon={Users} trend={realStats?.monthly_growth ? `+${realStats.monthly_growth}% this month` : undefined} color="blue" loading={loading} />
            <StatsCard title="Active Clients" value={realStats?.active_clients || stats?.active_clients || 0} icon={Target} subtitle={realStats ? `${realStats.active_percentage}% of portfolio` : undefined} color="green" loading={loading} />
            <StatsCard title="New This Month" value={realStats?.new_this_month || stats?.new_this_month || 0} icon={Calendar} color="purple" loading={loading} />
            <StatsCard title="Portfolio Value" value={formatCurrency(realStats?.total_premium_value || stats?.total_premium_value || 0).split(".")[0]} icon={Crown} color="orange" loading={loading} />
          </div>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="mb-4 p-3 lg:p-4 rounded-xl bg-green-50 dark:from-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <span className="text-sm font-medium text-green-800 dark:text-green-400">{successMessage}</span>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1 lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={filters.search || ""} onChange={e => handleSearch(e.target.value)} placeholder="Search clients..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base" />
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <select value={getStatusVal()} onChange={e => handleStatus(e.target.value)} className="flex-1 lg:flex-none px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="flex-1 lg:flex-none px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="date">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="premium">Highest Premium</option>
              </select>
              <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading && !clients.length ? (
          <div className="text-center py-12 lg:py-16">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">Loading your client portfolio...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 lg:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6"><Users className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" /></div>
            <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">No clients found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm lg:text-base max-w-md mx-auto">{filters.search ? "Try adjusting your search or filters." : "Get started by adding your first client."}</p>
          </div>
        ) : (
          <>
            <div className="lg:hidden space-y-3">
              {sorted.map(c => <ClientCard key={c.id} client={c} onView={id => router.push(`/dashboard/client-management/${id}`)} onEdit={id => router.push(`/dashboard/client-management/${id}/edit`)} onDelete={handleDelete} deleting={deleting} />)}
            </div>
            <div className="hidden lg:block">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {sorted.map(c => <ClientCard key={c.id} client={c} onView={id => router.push(`/dashboard/client-management/${id}`)} onEdit={id => router.push(`/dashboard/client-management/${id}/edit`)} onDelete={handleDelete} deleting={deleting} />)}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          {["Client", "Contact", "Location", "Status", "Join Date", "Actions"].map(h => (
                            <th key={h} className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map(c => <ClientTableRow key={c.id} client={c} onView={id => router.push(`/dashboard/client-management/${id}`)} onEdit={id => router.push(`/dashboard/client-management/${id}/edit`)} onDelete={handleDelete} deleting={deleting} />)}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">Showing {(currentPage - 1) * 8 + 1} to {Math.min(currentPage * 8, totalCount)} of {totalCount} clients</div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                if (p > totalPages || p < 1) return null;
                return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-sm rounded-lg transition-all ${p === currentPage ? "bg-blue-600 text-white shadow-md" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>{p}</button>;
              })}
              <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Always-visible FAB ── */}
      <button
        onClick={() => router.push("/dashboard/client-management/new")}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
        aria-label="Add new client"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-semibold">Add Client</span>
      </button>
    </div>
  );
}

export default function ClientManagementPage() {
  return (
    <Suspense fallback={<ClientManagementLoading />}>
      <ClientManagementContent />
    </Suspense>
  );
}