"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

interface SignUpResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

interface ResetPasswordResponse {
  data: Record<string, never> | null;
  error: AuthError | null;
}

interface SupabaseContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  supabase: ReturnType<typeof createBrowserClient>;
}

interface AuthContextType {
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<SignUpResponse>;
  resetPassword: (email: string) => Promise<ResetPasswordResponse>;
}

// Shared validation utility
export const isSessionValid = (session: Session | null): boolean => {
  if (!session?.user) return false;
  const now = Math.round(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    return false;
  }
  return true;
};

// Shared error checking utility
export const isAuthError = (error: AuthError | null): boolean => {
  if (!error) return false;
  return (
    error.message.includes("JWT") ||
    error.message.includes("session") ||
    error.message.includes("expired") ||
    error.message.includes("invalid")
  );
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SupabaseProviderProps {
  children: React.ReactNode;
  initialSession?: Session | null;
}

export default function SupabaseProvider({
  children,
  initialSession = null,
}: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(!initialSession);

  const isSigningOutRef = useRef(false);
  const mountedRef = useRef(true);

  // ✅ Use createBrowserClient from @supabase/ssr (matches middleware)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const clearAuthState = useCallback(() => {
    if (!mountedRef.current) return;
    setUser(null);
    setSession(null);
  }, []);

  const clearStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const preserveKeys = [
        "policybridge-theme",
        "policybridge-language",
        "policybridge-timezone",
      ];

      const preserved: Record<string, string | null> = {};
      preserveKeys.forEach((key) => {
        try {
          preserved[key] = localStorage.getItem(key);
        } catch (e) {
          console.log(
            `Failed to preserve ${key}:`,
            e instanceof Error ? e.message : String(e)
          );
        }
      });

      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log(
          "Storage clearing not supported:",
          e instanceof Error ? e.message : String(e)
        );
      }

      Object.entries(preserved).forEach(([key, value]) => {
        if (value !== null) {
          try {
            localStorage.setItem(key, value);
          } catch (e) {
            console.log(
              `Failed to restore ${key}:`,
              e instanceof Error ? e.message : String(e)
            );
          }
        }
      });
    } catch (error) {
      console.log(
        "Storage operations not fully supported:",
        error instanceof Error ? error.message : "Storage API not available"
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSigningOutRef.current) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      isSigningOutRef.current = true;
      clearAuthState();
      clearStorage();

      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        console.error("Supabase sign out error:", error);
      }

      window.location.replace("/auth/login");
    } catch (error) {
      console.error(
        "Unexpected sign out error:",
        error instanceof Error ? error.message : String(error)
      );
      clearAuthState();
      clearStorage();
      window.location.replace("/auth/login");
    } finally {
      setTimeout(() => {
        isSigningOutRef.current = false;
      }, 2000);
    }
  }, [supabase.auth, clearAuthState, clearStorage]);

  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      try {
        if (initialSession) {
          if (isSessionValid(initialSession)) {
            if (mountedRef.current) {
              setSession(initialSession);
              setUser(initialSession.user);
            }
          } else {
            clearAuthState();
          }
          if (mountedRef.current) setLoading(false);
          return;
        }

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (error) {
          console.error("Error getting session:", error);
          clearAuthState();
          setLoading(false);
          return;
        }

        if (isSessionValid(currentSession)) {
          setSession(currentSession);
          setUser(currentSession!.user);
        } else {
          clearAuthState();
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Auth initialization error:",
          error instanceof Error ? error.message : String(error)
        );
        if (mountedRef.current) {
          clearAuthState();
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;

      if (event === "SIGNED_OUT") {
        clearAuthState();
        clearStorage();
        if (window.location.pathname !== "/auth/login") {
          window.location.replace("/auth/login");
        }
        return;
      }

      switch (event) {
        case "SIGNED_IN":
          if (isSessionValid(newSession)) {
            setSession(newSession);
            setUser(newSession!.user);
          } else {
            clearAuthState();
          }
          break;

        case "TOKEN_REFRESHED":
          if (isSessionValid(newSession)) {
            setSession(newSession);
            setUser(newSession!.user);
          } else {
            clearAuthState();
          }
          break;

        case "PASSWORD_RECOVERY":
          break;

        default:
          if (isSessionValid(newSession)) {
            setSession(newSession);
            setUser(newSession!.user);
          } else if (newSession === null) {
            clearAuthState();
          }
      }
    });

    initAuth();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, initialSession, clearAuthState, clearStorage]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const contextValue: SupabaseContextType = {
    supabase,
    session,
    loading,
    user,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};

export const useUser = () => {
  const { user, loading } = useSupabase();
  return { user, loading };
};

export const useAuth = (): AuthContextType => {
  const { signOut, supabase } = useSupabase();

  return {
    signOut,
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return result;
      } catch (error) {
        return {
          data: { user: null, session: null },
          error: {
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            status: 500,
          } as AuthError,
        };
      }
    },
    signUp: async (
      email: string,
      password: string
    ): Promise<SignUpResponse> => {
      try {
        const result = await supabase.auth.signUp({ email, password });
        return result;
      } catch (error) {
        return {
          data: { user: null, session: null },
          error: {
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            status: 500,
          } as AuthError,
        };
      }
    },
    resetPassword: async (email: string): Promise<ResetPasswordResponse> => {
      try {
        const result = await supabase.auth.resetPasswordForEmail(email);
        return result;
      } catch (error) {
        return {
          data: null,
          error: {
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            status: 500,
          } as AuthError,
        };
      }
    },
  };
};