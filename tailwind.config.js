/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CSS Variables Integration - These work with the @apply directives
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Also include traditional primary shades for fallback
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Main brand blue
          600: "#2563eb", // Primary action blue
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Additional semantic colors
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",

        // Professional Gray Scale for additional options
        gray: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },

        // Insurance Status Colors (as fallbacks)
        status: {
          active: "#059669",
          inactive: "#6b7280",
          pending: "#d97706",
          expired: "#dc2626",
          cancelled: "#991b1b",
        },

        // Risk Assessment Colors (as fallbacks)
        risk: {
          low: "#059669",
          medium: "#d97706",
          high: "#dc2626",
          critical: "#991b1b",
        },
      },

      // Professional Typography
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },

      // Professional Spacing
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // Business-appropriate Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
      },

      // Professional Shadows
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        DEFAULT:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        md: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        lg: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
      },

      // Background Images for Radial Gradients
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      // Enhanced animations for professional use
      animation: {
        // Basic animations
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-fast": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "scale-in-fast": "scaleIn 0.1s ease-out",

        // Professional subtle animations
        "bounce-subtle": "bounceSubtle 2s infinite",
        "pulse-slow": "pulseSlow 3s infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "breathe-slow": "breathe 6s ease-in-out infinite",

        // Spotlight animations for backgrounds
        "spotlight-1": "spotlight1 8s ease-in-out infinite",
        "spotlight-2": "spotlight2 10s ease-in-out infinite 3s",
        "spotlight-3": "spotlight3 12s ease-in-out infinite 6s",
        "spotlight-4": "spotlight4 9s ease-in-out infinite 1.5s",
        "spotlight-5": "spotlight5 11s ease-in-out infinite 4.5s",
        "spotlight-6": "spotlight6 13s ease-in-out infinite 2s",
        "spotlight-7": "spotlight7 14s ease-in-out infinite 7s",

        // Loading and interaction animations
        "spin-slow": "spin 3s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",

        // Enhanced entrance animations
        "slide-in-from-top": "slideInFromTop 0.4s ease-out",
        "slide-in-from-bottom": "slideInFromBottom 0.4s ease-out",
        "slide-in-from-left": "slideInFromLeft 0.4s ease-out",
        "slide-in-from-right": "slideInFromRight 0.4s ease-out",

        // Professional hover effects
        "hover-lift": "hoverLift 0.2s ease-out",
      },

      keyframes: {
        // Basic keyframes
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },

        // Enhanced entrance animations
        slideInFromTop: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromBottom: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },

        // Professional subtle animations
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.05)", opacity: "0.6" },
        },

        // Spotlight animations - These are the ones that actually work
        spotlight1: {
          "0%, 100%": { opacity: "0.12", transform: "scale(0.9)" },
          "50%": { opacity: "0.18", transform: "scale(1.1)" },
        },
        spotlight2: {
          "0%, 100%": { opacity: "0.1", transform: "scale(0.85)" },
          "50%": { opacity: "0.16", transform: "scale(1.15)" },
        },
        spotlight3: {
          "0%, 100%": {
            opacity: "0.08",
            transform: "scale(0.9)",
          },
          "50%": {
            opacity: "0.14",
            transform: "scale(1.1)",
          },
        },
        spotlight4: {
          "0%, 100%": {
            opacity: "0.09",
            transform: "scale(0.95)",
          },
          "50%": { opacity: "0.15", transform: "scale(1.05)" },
        },
        spotlight5: {
          "0%, 100%": {
            opacity: "0.07",
            transform: "scale(0.8)",
          },
          "50%": { opacity: "0.13", transform: "scale(1.2)" },
        },
        spotlight6: {
          "0%, 100%": {
            opacity: "0.06",
            transform: "scale(0.85)",
          },
          "50%": {
            opacity: "0.12",
            transform: "scale(1.15)",
          },
        },
        spotlight7: {
          "0%, 100%": {
            opacity: "0.05",
            transform: "scale(0.9)",
          },
          "50%": {
            opacity: "0.11",
            transform: "scale(1.18)",
          },
        },

        // Interaction animations
        hoverLift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-2px)" },
        },
      },

      // Professional transitions
      transitionDuration: {
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },

      transitionTimingFunction: {
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [],
};
