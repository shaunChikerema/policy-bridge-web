"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  CreditCard,
  FileText,
  Shield,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  label: string;
  sub: string;
  time: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RecentActivityProps {
  isDarkMode?: boolean;
  onActivityClick?: (id: string) => void;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function RecentActivity({ onActivityClick }: RecentActivityProps) {
  const router = useRouter();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const uid = user.id;

        const [clients, policies, claims, payments] = await Promise.all([
          supabase
            .from("clients")
            .select("id, first_name, last_name, created_at")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("policies")
            .select("id, policy_name, policy_number, created_at")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("claims")
            .select("id, claim_number, claim_type, created_at")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("payments")
            .select("id, amount, status, created_at")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        const activity: ActivityItem[] = [];

        (clients.data || []).forEach((c) => {
          activity.push({
            id: `client-${c.id}`,
            label: "Client added",
            sub: `${c.first_name} ${c.last_name}`,
            time: timeAgo(c.created_at),
            href: `/dashboard/client-management/${c.id}`,
            icon: Users,
          });
        });

        (policies.data || []).forEach((p) => {
          activity.push({
            id: `policy-${p.id}`,
            label: "Policy created",
            sub: p.policy_name || p.policy_number || "New policy",
            time: timeAgo(p.created_at),
            href: `/dashboard/policy-management/${p.id}`,
            icon: Shield,
          });
        });

        (claims.data || []).forEach((c) => {
          activity.push({
            id: `claim-${c.id}`,
            label: "Claim filed",
            sub: c.claim_number || c.claim_type || "New claim",
            time: timeAgo(c.created_at),
            href: `/dashboard/claims-management/${c.id}`,
            icon: FileText,
          });
        });

        (payments.data || []).forEach((p) => {
          activity.push({
            id: `payment-${p.id}`,
            label: "Payment logged",
            sub: `P ${(p.amount || 0).toLocaleString()} · ${p.status}`,
            time: timeAgo(p.created_at),
            href: `/dashboard/payment-management/${p.id}`,
            icon: CreditCard,
          });
        });

        // Sort all by recency (time string is display-only, re-sort by raw date)
        // Re-fetch with dates for sorting
        const allRaw: Array<ActivityItem & { rawDate: string }> = [];

        (clients.data || []).forEach((c) => allRaw.push({
          id: `client-${c.id}`, label: "Client added",
          sub: `${c.first_name} ${c.last_name}`,
          time: timeAgo(c.created_at), href: `/dashboard/client-management/${c.id}`,
          icon: Users, rawDate: c.created_at,
        }));
        (policies.data || []).forEach((p) => allRaw.push({
          id: `policy-${p.id}`, label: "Policy created",
          sub: p.policy_name || p.policy_number || "New policy",
          time: timeAgo(p.created_at), href: `/dashboard/policy-management/${p.id}`,
          icon: Shield, rawDate: p.created_at,
        }));
        (claims.data || []).forEach((c) => allRaw.push({
          id: `claim-${c.id}`, label: "Claim filed",
          sub: c.claim_number || c.claim_type || "New claim",
          time: timeAgo(c.created_at), href: `/dashboard/claims-management/${c.id}`,
          icon: FileText, rawDate: c.created_at,
        }));
        (payments.data || []).forEach((p) => allRaw.push({
          id: `payment-${p.id}`, label: "Payment logged",
          sub: `P ${(p.amount || 0).toLocaleString()} · ${p.status}`,
          time: timeAgo(p.created_at), href: `/dashboard/payment-management/${p.id}`,
          icon: CreditCard, rawDate: p.created_at,
        }));

        allRaw.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

        setItems(allRaw.slice(0, 6));
      } catch (e) {
        console.error("Recent activity error:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-400">No activity yet.</p>
        <p className="text-xs text-gray-300 mt-1">Add a client or policy to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => { onActivityClick?.(item.id); router.push(item.href); }}
            className="w-full flex items-center gap-3 py-3 px-1 hover:bg-gray-50 active:scale-[0.98] transition-all text-left first:pt-1 last:pb-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium truncate">{item.label}</p>
              <p className="text-xs text-gray-400 truncate">{item.sub}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
          </button>
        );
      })}
    </div>
  );
}