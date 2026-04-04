"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Mail,
  Moon,
  Shield,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
}

const securityFeatures = [
  "Secure Password Reset",
  "Email Verification Required",
  "SOC 2 Type II Certified",
  "GDPR Compliant",
];

// Enhanced Theme Toggle Component
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for saved theme or system preference
    const savedTheme = (
      typeof window !== "undefined" ? localStorage.getItem("theme") : null
    ) as "light" | "dark" | null;
    const systemTheme =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(initialTheme);
    }
    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg w-[52px] h-[52px]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
}

function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ForgotPasswordFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ForgotPasswordFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    // Could add a toast notification here
  };

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-sm max-w-md w-full">
        {/* Header */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a password reset link to
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formData.email}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-8 pb-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                  1
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the link in the email we just sent you
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                  2
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new secure password
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                  3
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to your PolicyBridge account
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Didn't receive the email?
                </p>
                <p className="text-amber-700 dark:text-amber-300 mb-3">
                  Check your spam folder or try resending the email.
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={isSubmitting}
                  className="text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 font-medium hover:underline disabled:opacity-50"
                >
                  {isSubmitting ? "Resending..." : "Resend Email"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50/50 dark:bg-gray-700/20 rounded-b-2xl">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-sm max-w-md w-full">
      {/* Header */}
      <div className="p-8 pb-6 text-center">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
          <img
            src="/policybridge-logo.png"
            alt="PolicyBridge Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Reset Your Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </div>

      {/* Form */}
      <div className="px-8 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail
                  className={`w-5 h-5 transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className={`
                  w-full pl-12 pr-4 py-3.5
                  bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-gray-100
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  transition-all duration-200 shadow-sm
                  ${
                    errors.email
                      ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                      : focusedField === "email"
                      ? "border-blue-500 dark:border-blue-400 focus:ring-blue-500/20 shadow-md"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }
                `}
                placeholder="Enter your email address"
                required
              />
            </div>
            {errors.email && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending Reset Link...</span>
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>

      {/* Security Notice */}
      <div className="px-8 pb-6">
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Secure Password Reset
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                For your security, password reset links expire after 1 hour and
                can only be used once.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="px-8 pb-6">
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your security is our priority
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400"
            >
              <Shield className="w-3 h-3 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50/50 dark:bg-gray-700/20 rounded-b-2xl">
        <p className="text-gray-600 dark:text-gray-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <ThemeToggle />

      {/* Single column layout for forgot password */}
      <div className="flex min-h-screen items-center justify-center p-6 relative">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-slate-600/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
