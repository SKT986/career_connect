"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, createElement } from "react";

export type AppLanguage = "en" | "ja" | "ja-easy";

export interface AccessibilityState {
  fontScale: number; // 1 = normal, up to 1.5 = large
  highContrast: boolean;
  language: AppLanguage;
}

interface AccessibilityContextValue extends AccessibilityState {
  setFontScale: (scale: number) => void;
  setHighContrast: (on: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
}

const DEFAULT_STATE: AccessibilityState = {
  fontScale: 1,
  highContrast: false,
  language: "en",
};

const STORAGE_KEY = "cc-accessibility";

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readStoredState(): AccessibilityState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(DEFAULT_STATE);

  useEffect(() => {
    setState(readStoredState());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-scale", String(state.fontScale));
    if (state.highContrast) {
      root.setAttribute("data-contrast", "high");
    } else {
      root.removeAttribute("data-contrast");
    }
    root.lang = state.language === "ja-easy" ? "ja" : state.language;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...state,
      setFontScale: (fontScale) => setState((s) => ({ ...s, fontScale })),
      setHighContrast: (highContrast) => setState((s) => ({ ...s, highContrast })),
      setLanguage: (language) => setState((s) => ({ ...s, language })),
    }),
    [state]
  );

  return createElement(AccessibilityContext.Provider, { value }, children);
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
