"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from "@/config/currencies";

/**
 * The visitor's chosen display currency, persisted in localStorage.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: localStorage is
 * an external store, and reading it in an effect would both trigger a
 * cascading render and risk a hydration mismatch. This hook renders
 * `getServerSnapshot` during SSR and hydration, then switches to the stored
 * value — which is exactly the behaviour React designed the API for.
 *
 * The `storage` event subscription means changing currency in one tab updates
 * any others that are open.
 */
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): CurrencyCode {
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return stored && isCurrencyCode(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    // Private browsing modes can throw on localStorage access.
    return DEFAULT_CURRENCY;
  }
}

function getServerSnapshot(): CurrencyCode {
  return DEFAULT_CURRENCY;
}

export function useCurrency() {
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCurrency = useCallback((next: CurrencyCode) => {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      // Preference simply will not persist; the session still works.
    }
    emit();
  }, []);

  return { currency, setCurrency };
}
