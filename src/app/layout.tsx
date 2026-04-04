// src/app/layout.tsx
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import { ThemeProvider } from "@/context/theme-context";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PolicyBridge - Insurance Management Platform",
    template: "%s | PolicyBridge",
  },
  description:
    "Transform your insurance operations with PolicyBridge - the most advanced insurance management platform designed for African markets.",
  keywords: [
    "insurance management",
    "policy management",
    "claims processing",
    "insurance software",
    "PolicyBridge",
    "African insurance",
    "Botswana insurance",
  ],
  authors: [{ name: "PolicyBridge Team" }],
  creator: "PolicyBridge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://policybridge.com",
    title: "PolicyBridge - Insurance Management Platform",
    description: "Transform your insurance operations with PolicyBridge",
    siteName: "PolicyBridge",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyBridge - Insurance Management Platform",
    description: "Transform your insurance operations with PolicyBridge",
    creator: "@policybridge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('policybridge-theme') || 'system';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var appliedTheme = theme === 'system' ? systemTheme : theme;
                  var isDark = appliedTheme === 'dark';
                  var root = document.documentElement;
                  
                  if (isDark) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                    root.style.backgroundColor = 'rgb(2, 6, 23)';
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.add('light');
                    root.setAttribute('data-theme', 'light');
                    root.style.backgroundColor = 'rgb(255, 255, 255)';
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.backgroundColor = 'rgb(255, 255, 255)';
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen antialiased transition-colors duration-200`}
      >
        <SupabaseProvider>
          <ThemeProvider defaultTheme="light" storageKey="policybridge-theme">
            <div className="relative flex min-h-screen flex-col bg-background text-foreground">
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
