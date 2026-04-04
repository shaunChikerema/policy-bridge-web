"use client";

import { isSessionValid, useSupabase } from "@/components/providers/SupabaseProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashPage() {
  const router = useRouter();
  const { session, loading, user } = useSupabase();

  useEffect(() => {
    if (loading) return;
    const target = isSessionValid(session) && user ? "/dashboard" : "/landing";
    const timer = setTimeout(() => router.replace(target), 1200);
    return () => clearTimeout(timer);
  }, [loading, session, user, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center gap-6">
      <Image
        src="/pb-logo-svg-trans.svg"
        alt="PolicyBridge"
        width={72}
        height={72}
        priority
        className="animate-pulse"
      />
      <div className="w-32 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-[loading_1.2s_ease-in-out_forwards]" />
      </div>
      <style>{`
        @keyframes loading {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
