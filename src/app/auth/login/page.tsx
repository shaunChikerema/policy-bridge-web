"use client";

import { useAuth, useSupabase } from "@/components/providers/SupabaseProvider";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Logo() {
  return (
    <Image
      src="/pb-logo-svg-trans.svg"
      alt="PolicyBridge"
      width={32}
      height={32}
      priority
    />
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const { session, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [session, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email is required.");
    if (!password) return setError("Password is required.");
    setIsSubmitting(true);
    try {
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
        return;
      }
      if (data?.session) {
        window.location.href = "/dashboard";
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f8f7f4] flex flex-col"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Nav */}
      <header className="px-6 h-16 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-bold text-lg tracking-tight text-gray-900">
            PolicyBridge
          </span>
        </Link>
        <p className="text-sm text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
          No account?{" "}
          <Link href="/auth/register" className="text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors">
            Register
          </Link>
        </p>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4" style={{ fontFamily: "system-ui, sans-serif" }}>
              Welcome back
            </p>
            <h1 className="text-4xl font-normal leading-tight text-gray-900">
              Sign in to your{" "}
              <span className="italic text-gray-400">account.</span>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-[0.15em] text-gray-400 mb-2"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-[0.15em] text-gray-400"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {isSubmitting ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-300" style={{ fontFamily: "system-ui, sans-serif" }}>or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
            New to PolicyBridge?{" "}
            <Link href="/auth/register" className="text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center">
        <p className="text-xs text-gray-300" style={{ fontFamily: "system-ui, sans-serif" }}>
          © {new Date().getFullYear()} PolicyBridge · Built by{" "}
          <a href="https://github.com/shaunChikerema" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">
            Bitroot
          </a>
        </p>
      </footer>
    </div>
  );
}