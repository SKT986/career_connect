"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, createElement } from "react";
import { useRouter } from "next/navigation";

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

const DEFAULT_STATE: Omit<AccessibilityState, "language"> = {
  fontScale: 1,
  highContrast: false,
};

const STORAGE_KEY = "cc-accessibility";
const LOCALE_COOKIE = "NEXT_LOCALE";

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readStoredState(): Omit<AccessibilityState, "language"> {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { fontScale: parsed.fontScale ?? DEFAULT_STATE.fontScale, highContrast: parsed.highContrast ?? DEFAULT_STATE.highContrast };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AccessibilityProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: AppLanguage;
}) {
  const router = useRouter();
  const [state, setState] = useState<AccessibilityState>({ ...DEFAULT_STATE, language: initialLanguage });

  useEffect(() => {
    setState((s) => ({ ...s, ...readStoredState() }));
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
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fontScale: state.fontScale, highContrast: state.highContrast })
    );
  }, [state]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...state,
      setFontScale: (fontScale) => setState((s) => ({ ...s, fontScale })),
      setHighContrast: (highContrast) => setState((s) => ({ ...s, highContrast })),
      setLanguage: (language) => {
        document.cookie = `${LOCALE_COOKIE}=${language}; path=/; max-age=31536000; SameSite=Lax`;
        setState((s) => ({ ...s, language }));
        router.refresh();
      },
    }),
    [state, router]
  );

  return createElement(AccessibilityContext.Provider, { value }, children);
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
