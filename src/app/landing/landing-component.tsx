"use client";

import {
  ArrowRight,
  Shield,
  FileText,
  Users,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/pb-logo-svg-trans.svg"
      alt="PolicyBridge"
      width={32}
      height={32}
      className={className}
    />
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-gray-900" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f7f4]/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              PolicyBridge
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
              Sign in
            </Link>
            <Link href="/auth/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
            <div className="w-5 h-px bg-gray-900 mb-1.5" />
            <div className="w-5 h-px bg-gray-900" />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-[#f8f7f4] px-6 py-4 space-y-3">
            {["Features", "How it works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="block py-1 text-sm text-gray-600" style={{ fontFamily: "system-ui, sans-serif" }}>
                {item}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
              <Link href="/auth/login" className="block py-2 text-sm text-center text-gray-600" style={{ fontFamily: "system-ui, sans-serif" }}>Sign in</Link>
              <Link href="/auth/register" className="block py-2 text-sm text-center rounded-full bg-gray-900 text-white" style={{ fontFamily: "system-ui, sans-serif" }}>Get started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-0 px-6 max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
          Insurance Management · Botswana
        </p>

        <div className="max-w-4xl mb-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-gray-900 mb-6">
            The modern way to run your{" "}
            <span className="italic text-gray-400">brokerage.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>
            PolicyBridge brings your clients, policies, and payments into one clean platform — built specifically for insurance brokers in Botswana.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-3 mb-16">
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:border-gray-400 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
            Sign in <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hero image */}
        <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] rounded-2xl overflow-hidden">
          <img
            src="/images/hero.jpg"
            alt="Family managing their insurance online"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900" style={{ fontFamily: "system-ui, sans-serif" }}>Policy Renewed</p>
                <p className="text-xs text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>Motor Comprehensive · BWP 4,200</p>
              </div>
            </div>
            <div className="h-px bg-gray-100 my-2" />
            <p className="text-xs text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>Receipt automatically sent to client ✓</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-16" style={{ fontFamily: "system-ui, sans-serif" }}>
          What we do
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
          {[
            {
              icon: Users,
              label: "Client Management",
              description: "Keep every client's details, documents, and policy history in one place. No more digging through files.",
              image: "/images/family-1.jpg",
              alt: "Happy family — your clients",
              position: "object-top",
            },
            {
              icon: FileText,
              label: "Policy Tracking",
              description: "Track renewals, lapses, and coverage gaps automatically. Get alerts before anything expires.",
              image: "/images/family-3.jpg",
              alt: "Family at home, protected",
              position: "object-center",
            },
            {
              icon: Shield,
              label: "Payment Receipts",
              description: "Log premium payments and generate professional receipts for clients instantly.",
              image: "/images/family-2.jpg",
              alt: "Young family protected by insurance",
              position: "object-top",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="bg-[#f8f7f4] p-8 flex flex-col gap-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-2">{f.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>{f.description}</p>
                </div>
                <div className={`mt-auto h-44 rounded-xl overflow-hidden`}>
                  <img src={f.image} alt={f.alt} className={`w-full h-full object-cover ${f.position}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-gray-900 text-white py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-16" style={{ fontFamily: "system-ui, sans-serif" }}>
            How it works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "Add your clients", body: "Import existing clients or add them one by one. Store contacts, ID numbers, and documents securely." },
              { num: "02", title: "Create policies", body: "Link policies to clients. Track premiums, renewal dates, and coverage type all in one view." },
              { num: "03", title: "Generate receipts", body: "When a client pays, log it and send a professional receipt instantly. Full payment history always available." },
            ].map((s) => (
              <div key={s.num}>
                <span className="text-6xl font-normal text-gray-700 block mb-4">{s.num}</span>
                <h3 className="text-xl font-normal text-white mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 h-72 sm:h-96 rounded-2xl overflow-hidden relative">
            <img
              src="/images/family-1.jpg"
              alt="Happy family — the people you protect"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gray-900/50" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white text-2xl sm:text-3xl font-normal max-w-md">Built for brokers who take their clients seriously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-normal leading-tight mb-6">
              Ready to modernise your brokerage?
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8 max-w-md" style={{ fontFamily: "system-ui, sans-serif" }}>
              Join insurance brokers across Botswana who manage their clients, policies, and payments on PolicyBridge.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:border-gray-400 transition-colors" style={{ fontFamily: "system-ui, sans-serif" }}>
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative h-80 rounded-2xl overflow-hidden">
            <img
              src="/images/family-2.jpg"
              alt="Young family protected by insurance"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-sm font-bold text-gray-900">PolicyBridge</span>
          </div>
          <p className="text-xs text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
            © {new Date().getFullYear()} PolicyBridge · Built by{" "}
            <a href="https://github.com/shaunChikerema" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Bitroot</a>
          </p>
          <div className="flex items-center gap-5">
            <Link href="/auth/login" className="text-xs text-gray-400 hover:text-gray-600" style={{ fontFamily: "system-ui, sans-serif" }}>Sign in</Link>
            <Link href="/auth/register" className="text-xs text-gray-400 hover:text-gray-600" style={{ fontFamily: "system-ui, sans-serif" }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}