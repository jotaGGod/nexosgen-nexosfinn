"use client";

import { useCallback, useEffect, useState } from "react";

export type DashboardSection = "summary" | "cashflow" | "categories" | "transactions" | "goals";
export type DashboardPreferences = Record<DashboardSection, boolean>;

const STORAGE_KEY = "nexosgen-nexosfinn:dashboard-preferences:v1";
const CHANGE_EVENT = "nexosfinn:dashboard-preferences-change";

export const defaultDashboardPreferences: DashboardPreferences = {
  summary: true,
  cashflow: true,
  categories: true,
  transactions: true,
  goals: true,
};

function readPreferences(): DashboardPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultDashboardPreferences;
    const parsed = JSON.parse(stored) as Partial<DashboardPreferences>;
    return { ...defaultDashboardPreferences, ...parsed };
  } catch {
    return defaultDashboardPreferences;
  }
}

function persistPreferences(preferences: DashboardPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: preferences }));
  } catch {
    // A preferência continua válida nesta sessão mesmo sem storage.
  }
}

/** Preferências locais dos blocos visíveis na tela inicial. */
export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultDashboardPreferences);

  useEffect(() => {
    setPreferences(readPreferences());

    function syncPreferences(event: Event) {
      const customEvent = event as CustomEvent<DashboardPreferences>;
      setPreferences(customEvent.detail ?? readPreferences());
    }

    function syncStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setPreferences(readPreferences());
    }

    window.addEventListener(CHANGE_EVENT, syncPreferences);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, syncPreferences);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  const setSectionVisible = useCallback((section: DashboardSection, visible: boolean) => {
    setPreferences((current) => {
      const next = { ...current, [section]: visible };
      persistPreferences(next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultDashboardPreferences);
    persistPreferences(defaultDashboardPreferences);
  }, []);

  return { preferences, setSectionVisible, resetPreferences };
}
