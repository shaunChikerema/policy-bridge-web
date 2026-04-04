// src/app/auth/layout.tsx
import type { Metadata, Viewport } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication - PolicyBridge",
  description:
    "Sign in or create your PolicyBridge account to access comprehensive insurance management tools",
  keywords:
    "login, register, sign in, insurance login, policy management access",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Gradient Overlays - Using CSS variables from theme system */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Trust Indicators - Using glass effect with backdrop-blur */}
          <div className="backdrop-blur-md bg-card/80 rounded-2xl p-6 border border-border/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div
                className="space-y-2 animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div className="text-2xl font-bold text-foreground">
                  256-bit
                </div>
                <div className="text-sm text-muted-foreground">
                  SSL Encryption
                </div>
                <div className="w-12 h-1 bg-success rounded-full mx-auto"></div>
              </div>
              <div
                className="space-y-2 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <div className="text-2xl font-bold text-foreground">
                  10,000+
                </div>
                <div className="text-sm text-muted-foreground">
                  Trusted Users
                </div>
                <div className="w-12 h-1 bg-primary rounded-full mx-auto"></div>
              </div>
              <div
                className="space-y-2 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Support Available
                </div>
                <div className="w-12 h-1 bg-warning rounded-full mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Links and Copyright */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start items-center space-x-6 text-sm text-muted-foreground">
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/support"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  Support
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  Contact Us
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} PolicyBridge. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
