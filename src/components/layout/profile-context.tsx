// Optimized profile-context.tsx with better performance
"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
}

interface ProfileContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (profile: Profile) => void;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
  initializeProfile: () => Promise<void>;
  loadProfile: (userId: string) => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Use refs to prevent unnecessary re-renders and duplicate requests
  const loadingRef = useRef(false);
  const retryCountRef = useRef(0);
  const profileCacheRef = useRef<Profile | null>(null);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const maxRetries = 1; // Reduced from 2 to 1
  const loadTimeout = useRef<NodeJS.Timeout>();

  // Enhanced profile loading with caching and timeout
  const loadProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      // Prevent concurrent loads for the same user
      if (loadingRef.current && lastLoadedUserIdRef.current === userId) {
        console.log(
          "Profile load already in progress for this user, skipping..."
        );
        return profileCacheRef.current;
      }

      // Return cached profile if available for the same user
      if (profileCacheRef.current && lastLoadedUserIdRef.current === userId) {
        console.log("Returning cached profile");
        setProfile(profileCacheRef.current);
        return profileCacheRef.current;
      }

      loadingRef.current = true;
      lastLoadedUserIdRef.current = userId;

      try {
        console.log(
          `Loading profile for user: ${userId} (attempt ${
            retryCountRef.current + 1
          })`
        );

        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise<never>((_, reject) => {
          loadTimeout.current = setTimeout(() => {
            reject(new Error("Profile load timeout"));
          }, 10000); // 10 second timeout
        });

        const profilePromise = supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        const { data: profileData, error } = await Promise.race([
          profilePromise,
          timeoutPromise,
        ]);

        if (loadTimeout.current) {
          clearTimeout(loadTimeout.current);
        }

        if (error && error.code !== "PGRST116") {
          console.error("Profile load error:", error);
          throw error;
        }

        if (profileData) {
          console.log("Profile loaded successfully:", profileData);
          profileCacheRef.current = profileData;
          setProfile(profileData);
          retryCountRef.current = 0; // Reset retry count on success
          return profileData;
        } else {
          console.log("No profile found for user");
          profileCacheRef.current = null;
          setProfile(null);
          return null;
        }
      } catch (error) {
        console.error("Error loading profile:", error);

        // Simplified retry logic - only retry once on network errors
        if (
          retryCountRef.current < maxRetries &&
          (error as Error).message.includes("timeout" || "network")
        ) {
          const delay = 1000; // Fixed 1 second delay
          console.log(`Retrying profile load in ${delay}ms`);
          retryCountRef.current += 1;

          return new Promise((resolve) => {
            setTimeout(async () => {
              loadingRef.current = false; // Reset loading flag for retry
              const result = await loadProfile(userId);
              resolve(result);
            }, delay);
          });
        }

        console.error("Profile load failed, not retrying");
        profileCacheRef.current = null;
        setProfile(null);
        return null;
      } finally {
        loadingRef.current = false;
        if (loadTimeout.current) {
          clearTimeout(loadTimeout.current);
        }
      }
    },
    [supabase]
  );

  // Initialize profile for current user
  const initializeProfile = useCallback(async () => {
    if (!user || profile || loading || loadingRef.current) {
      console.log("Skipping profile initialization:", {
        user: !!user,
        profile: !!profile,
        loading,
        loadingInProgress: loadingRef.current,
      });
      return;
    }

    console.log("Initializing profile for authenticated user");
    setLoading(true);

    try {
      await loadProfile(user.id);
    } finally {
      setLoading(false);
    }
  }, [user, profile, loading, loadProfile]);

  // Optimized initial data loading
  useEffect(() => {
    let isMounted = true;
    let debounceTimeout: NodeJS.Timeout;

    const loadInitialData = async () => {
      try {
        console.log("Loading initial profile context data");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          const currentUser = {
            id: session.user.id,
            email: session.user.email || "",
          };
          console.log("Setting user from session:", currentUser);
          setUser(currentUser);

          // Short debounce to prevent rapid consecutive calls
          debounceTimeout = setTimeout(async () => {
            if (isMounted && !profileCacheRef.current) {
              await loadProfile(currentUser.id);
              if (isMounted) setLoading(false);
            } else {
              if (isMounted) setLoading(false);
            }
          }, 50); // Reduced from 100ms to 50ms
        } else {
          console.log("No session found");
          if (isMounted) setLoading(false);
        }
      } catch (error) {
        console.error("Error loading profile context:", error);
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    // Listen for auth changes with optimized handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (!isMounted) return;

      // Clear any pending timeouts
      if (debounceTimeout) clearTimeout(debounceTimeout);

      if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing profile data");
        setUser(null);
        setProfile(null);
        profileCacheRef.current = null;
        lastLoadedUserIdRef.current = null;
        retryCountRef.current = 0;
        loadingRef.current = false;
        setLoading(false);
      } else if (session?.user) {
        const currentUser = {
          id: session.user.id,
          email: session.user.email || "",
        };

        console.log("User signed in, loading profile:", currentUser);
        setUser(currentUser);
        setLoading(true);

        // Very short debounce for auth changes
        debounceTimeout = setTimeout(async () => {
          if (isMounted) {
            await loadProfile(currentUser.id);
            if (isMounted) setLoading(false);
          }
        }, 50);
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (debounceTimeout) clearTimeout(debounceTimeout);
      if (loadTimeout.current) clearTimeout(loadTimeout.current);
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const updateProfile = useCallback((newProfile: Profile) => {
    console.log("Updating profile in context:", newProfile);
    profileCacheRef.current = newProfile;
    setProfile(newProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      console.log("No user available for profile refresh");
      return;
    }

    console.log("Refreshing profile for user:", user.id);
    profileCacheRef.current = null; // Clear cache to force refresh
    retryCountRef.current = 0; // Reset retry count for manual refresh

    try {
      setLoading(true);
      await loadProfile(user.id);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user, loadProfile]);

  const clearProfile = useCallback(() => {
    console.log("Clearing profile context");
    setUser(null);
    setProfile(null);
    profileCacheRef.current = null;
    lastLoadedUserIdRef.current = null;
    retryCountRef.current = 0;
    loadingRef.current = false;
  }, []);

  const value: ProfileContextType = {
    user,
    profile,
    loading,
    updateProfile,
    refreshProfile,
    clearProfile,
    initializeProfile,
    loadProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
