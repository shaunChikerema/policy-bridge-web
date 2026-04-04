"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

// ============================================================================
// TYPES
// ============================================================================

type SidebarState = "closed" | "open" | "collapsed";
type BreakpointType = "mobile" | "tablet" | "desktop";

interface LayoutState {
  sidebarState: SidebarState;
  mobileMenuOpen: boolean;
  breakpoint: BreakpointType;
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  mounted: boolean;
}

type LayoutAction =
  | { type: "SET_SIDEBAR_STATE"; payload: SidebarState }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "SET_MOBILE_MENU"; payload: boolean }
  | { type: "SET_BREAKPOINT"; payload: BreakpointType }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }
  | { type: "SET_RESOLVED_THEME"; payload: "light" | "dark" }
  | { type: "SET_MOUNTED"; payload: boolean }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_SIDEBAR_COLLAPSE" };

interface LayoutContextType {
  // State
  sidebarState: SidebarState;
  mobileMenuOpen: boolean;
  breakpoint: BreakpointType;
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  mounted: boolean;

  // Computed values (backwards compatible)
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarVisible: boolean;
  sidebarWidth: number;
  contentMarginLeft: number;

  // Actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleSidebarCollapse: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Loading state
  isLoaded: boolean;
}

interface LayoutProviderProps {
  children: React.ReactNode;
  themeContext?: {
    theme: "light" | "dark" | "system";
    resolvedTheme: "light" | "dark";
    setTheme: (theme: "light" | "dark" | "system") => void;
    isLoaded: boolean;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  SIDEBAR_STATE: "policybridge-sidebar-state",
} as const;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

const SIDEBAR_WIDTHS = {
  closed: 0,
  collapsed: 64,
  open: 256,
} as const;

// ============================================================================
// REDUCER
// ============================================================================

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case "SET_SIDEBAR_STATE":
      return { ...state, sidebarState: action.payload };

    case "TOGGLE_SIDEBAR":
      // Fixed logic: When opening from closed, always open to expanded state
      if (state.sidebarState === "closed") {
        return { ...state, sidebarState: "open" };
      } else {
        return { ...state, sidebarState: "closed" };
      }

    case "TOGGLE_SIDEBAR_COLLAPSE":
      // Only works when sidebar is already open
      if (state.sidebarState === "open") {
        return { ...state, sidebarState: "collapsed" };
      } else if (state.sidebarState === "collapsed") {
        return { ...state, sidebarState: "open" };
      }
      return state;

    case "TOGGLE_MOBILE_MENU":
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };

    case "SET_MOBILE_MENU":
      return { ...state, mobileMenuOpen: action.payload };

    case "SET_BREAKPOINT":
      return { ...state, breakpoint: action.payload };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "SET_RESOLVED_THEME":
      return { ...state, resolvedTheme: action.payload };

    case "SET_MOUNTED":
      return { ...state, mounted: action.payload };

    default:
      return state;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function getStoredSidebarState(): SidebarState {
  if (typeof window === "undefined") return "open";

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE);
    if (stored && ["closed", "open", "collapsed"].includes(stored)) {
      return stored as SidebarState;
    }
  } catch (error) {
    console.warn("Failed to read sidebar state from localStorage:", error);
  }

  // Default based on screen size
  return window.innerWidth >= BREAKPOINTS.tablet ? "open" : "closed";
}

function setStoredSidebarState(state: SidebarState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, state);
  } catch (error) {
    console.warn("Failed to save sidebar state to localStorage:", error);
  }
}

function getBreakpoint(width: number): BreakpointType {
  if (width < BREAKPOINTS.mobile) return "mobile";
  if (width < BREAKPOINTS.tablet) return "tablet";
  return "desktop";
}

// ============================================================================
// CONTEXT
// ============================================================================

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function LayoutProvider({
  children,
  themeContext,
}: LayoutProviderProps) {
  // Initialize state
  const [state, dispatch] = useReducer(layoutReducer, {
    sidebarState: "open", // Will be corrected on mount
    mobileMenuOpen: false,
    breakpoint: "desktop", // Will be corrected on mount
    theme: themeContext?.theme ?? "system",
    resolvedTheme: themeContext?.resolvedTheme ?? "light",
    mounted: false,
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle mounting and initial setup
  useEffect(() => {
    const width = window.innerWidth;
    const breakpoint = getBreakpoint(width);
    const sidebarState = getStoredSidebarState();

    dispatch({ type: "SET_BREAKPOINT", payload: breakpoint });
    dispatch({ type: "SET_SIDEBAR_STATE", payload: sidebarState });
    dispatch({ type: "SET_MOUNTED", payload: true });
  }, []);

  // Handle breakpoint changes
  useEffect(() => {
    if (!state.mounted) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const newBreakpoint = getBreakpoint(width);

        if (newBreakpoint !== state.breakpoint) {
          dispatch({ type: "SET_BREAKPOINT", payload: newBreakpoint });

          // Auto-close mobile menu when switching to desktop
          if (newBreakpoint === "desktop" && state.mobileMenuOpen) {
            dispatch({ type: "SET_MOBILE_MENU", payload: false });
          }

          // Adjust sidebar state based on new breakpoint
          if (newBreakpoint === "mobile" && state.sidebarState !== "closed") {
            dispatch({ type: "SET_SIDEBAR_STATE", payload: "closed" });
          }
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    state.mounted,
    state.breakpoint,
    state.mobileMenuOpen,
    state.sidebarState,
  ]);

  // Persist sidebar state changes
  useEffect(() => {
    if (state.mounted) {
      setStoredSidebarState(state.sidebarState);
    }
  }, [state.sidebarState, state.mounted]);

  // Sync theme context
  useEffect(() => {
    if (themeContext?.theme !== state.theme) {
      dispatch({ type: "SET_THEME", payload: themeContext?.theme ?? "system" });
    }
    if (themeContext?.resolvedTheme !== state.resolvedTheme) {
      dispatch({
        type: "SET_RESOLVED_THEME",
        payload: themeContext?.resolvedTheme ?? "light",
      });
    }
  }, [themeContext, state.theme, state.resolvedTheme]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isMobile = state.breakpoint === "mobile";
  const isTablet = state.breakpoint === "tablet";
  const isDesktop = state.breakpoint === "desktop";

  // Backwards compatible computed values
  const sidebarOpen = state.sidebarState !== "closed";
  const sidebarCollapsed = state.sidebarState === "collapsed";

  // Simplified sidebar visibility logic
  const sidebarVisible = isDesktop ? sidebarOpen : state.mobileMenuOpen;

  // Sidebar width calculation
  const sidebarWidth = sidebarVisible
    ? isDesktop && sidebarCollapsed
      ? SIDEBAR_WIDTHS.collapsed
      : SIDEBAR_WIDTHS.open
    : SIDEBAR_WIDTHS.closed;

  // Content margin calculation (only applies on desktop)
  const contentMarginLeft = isDesktop ? sidebarWidth : 0;

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const openSidebar = useCallback(() => {
    if (isDesktop) {
      dispatch({ type: "SET_SIDEBAR_STATE", payload: "open" });
    } else {
      dispatch({ type: "SET_MOBILE_MENU", payload: true });
    }
  }, [isDesktop]);

  const closeSidebar = useCallback(() => {
    if (isDesktop) {
      dispatch({ type: "SET_SIDEBAR_STATE", payload: "closed" });
    } else {
      dispatch({ type: "SET_MOBILE_MENU", payload: false });
    }
  }, [isDesktop]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      dispatch({ type: "TOGGLE_SIDEBAR" });
    } else {
      dispatch({ type: "TOGGLE_MOBILE_MENU" });
    }
  }, [isDesktop]);

  const collapseSidebar = useCallback(() => {
    if (isDesktop && state.sidebarState === "open") {
      dispatch({ type: "SET_SIDEBAR_STATE", payload: "collapsed" });
    }
  }, [isDesktop, state.sidebarState]);

  const expandSidebar = useCallback(() => {
    if (isDesktop && state.sidebarState === "collapsed") {
      dispatch({ type: "SET_SIDEBAR_STATE", payload: "open" });
    }
  }, [isDesktop, state.sidebarState]);

  const toggleSidebarCollapse = useCallback(() => {
    if (isDesktop) {
      dispatch({ type: "TOGGLE_SIDEBAR_COLLAPSE" });
    }
  }, [isDesktop]);

  const openMobileMenu = useCallback(() => {
    dispatch({ type: "SET_MOBILE_MENU", payload: true });
  }, []);

  const closeMobileMenu = useCallback(() => {
    dispatch({ type: "SET_MOBILE_MENU", payload: false });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: "TOGGLE_MOBILE_MENU" });
  }, []);

  const setTheme = useCallback(
    (theme: "light" | "dark" | "system") => {
      themeContext?.setTheme?.(theme);
    },
    [themeContext]
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: LayoutContextType = {
    // State
    sidebarState: state.sidebarState,
    mobileMenuOpen: state.mobileMenuOpen,
    breakpoint: state.breakpoint,
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    mounted: state.mounted,

    // Backwards compatible computed values
    sidebarOpen,
    sidebarCollapsed,

    // Computed values
    isMobile,
    isTablet,
    isDesktop,
    sidebarVisible,
    sidebarWidth,
    contentMarginLeft,

    // Actions
    openSidebar,
    closeSidebar,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    toggleSidebarCollapse,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
    setTheme,

    // Loading state (backwards compatible)
    isLoaded: state.mounted && (themeContext?.isLoaded ?? true),
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useLayout(): LayoutContextType {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const layoutStyles = {
  // Sidebar width calculations
  getSidebarWidth: (isOpen: boolean, isCollapsed: boolean) => {
    if (!isOpen) return 0;
    return isCollapsed ? 64 : 256;
  },

  // Main content margin calculations
  getMainContentMargin: (
    isDesktop: boolean,
    sidebarOpen: boolean,
    sidebarCollapsed: boolean
  ) => {
    if (!isDesktop || !sidebarOpen) return 0;
    return sidebarCollapsed ? 64 : 256;
  },

  // Animation classes
  transitions: {
    sidebar: "transition-all duration-300 ease-in-out",
    content: "transition-all duration-300 ease-in-out",
    overlay: "transition-opacity duration-200",
  },

  // Z-index values
  zIndex: {
    sidebar: 40,
    header: 30,
    mobileOverlay: 35,
    dropdown: 50,
    modal: 60,
  },
} as const;

export default LayoutProvider;
