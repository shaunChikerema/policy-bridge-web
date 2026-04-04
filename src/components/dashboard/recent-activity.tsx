"use client";

import { createBrowserClient } from "@supabase/ssr";
import { CreditCard, FileText, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  label: string;
  sub: string;
  time: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  rawDate: string;
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

// Each activity type gets a distinct color
const TYPE_COLORS: Record<string, { color: string; bgLight: string; bgDark: string }> = {
  client:  { color: "#3ECF8E", bgLight: "rgba(62,207,142,0.08)",  bgDark: "rgba(62,207,142,0.12)"  },
  policy:  { color: "#60a5fa", bgLight: "rgba(96,165,250,0.08)",  bgDark: "rgba(96,165,250,0.12)"  },
  claim:   { color: "#fb923c", bgLight: "rgba(251,146,60,0.08)",  bgDark: "rgba(251,146,60,0.12)"  },
  payment: { color: "#a78bfa", bgLight: "rgba(167,139,250,0.08)", bgDark: "rgba(167,139,250,0.12)" },
};

export default function RecentActivity({ isDarkMode = false, onActivityClick }: RecentActivityProps) {
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
          supabase.from("clients").select("id, first_name, last_name, created_at")
            .eq("user_id", uid).order("created_at", { ascending: false }).limit(3),
          supabase.from("policies").select("id, policy_name, policy_number, created_at")
            .eq("user_id", uid).order("created_at", { ascending: false }).limit(3),
          supabase.from("claims").select("id, claim_number, claim_type, created_at")
            .eq("user_id", uid).order("created_at", { ascending: false }).limit(3),
          supabase.from("payments").select("id, amount, status, created_at")
            .eq("user_id", uid).order("created_at", { ascending: false }).limit(3),
        ]);

        const allRaw: ActivityItem[] = [];

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

  const text1    = isDarkMode ? "#EDEDED"  : "#111827";
  const text2    = isDarkMode ? "#A1A1A1"  : "#6B7280";
  const divider  = isDarkMode ? "#2E2E2E"  : "#F3F4F6";
  const skeleton = isDarkMode ? "#333333"  : "#F3F4F6";

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl animate-pulse flex-shrink-0" style={{ background: skeleton }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-28 rounded animate-pulse" style={{ background: skeleton }} />
              <div className="h-3 w-20 rounded animate-pulse" style={{ background: skeleton }} />
            </div>
            <div className="h-3 w-10 rounded animate-pulse" style={{ background: skeleton }} />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm" style={{ color: text2 }}>No activity yet.</p>
        <p className="text-xs mt-1" style={{ color: isDarkMode ? "#6B6B6B" : "#D1D5DB" }}>
          Add a client or policy to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item, idx) => {
        const Icon = item.icon;
        const typeKey = item.id.split("-")[0] as keyof typeof TYPE_COLORS;
        const colors = TYPE_COLORS[typeKey] ?? TYPE_COLORS.policy;
        const iconBg = isDarkMode ? colors.bgDark : colors.bgLight;

        return (
          <button
            key={item.id}
            onClick={() => { onActivityClick?.(item.id); router.push(item.href); }}
            className="w-full flex items-center gap-3 py-3 px-1 active:scale-[0.98] transition-all text-left rounded-xl"
            style={{ borderTop: idx > 0 ? `1px solid ${divider}` : "none" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg }}>
              <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: colors.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: text1 }}>{item.label}</p>
              <p className="text-xs truncate" style={{ color: text2 }}>{item.sub}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: text2 }}>{item.time}</span>
          </button>
        );
      })}
    </div>
  );
}