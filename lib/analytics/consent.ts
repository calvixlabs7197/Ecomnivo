"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ConsentState = "granted" | "denied" | "unset";

export const CONSENT_STORAGE_KEY = "ecomnivo:analytics-consent";

/**
 * Analytics consent, defaulting to **denied**.
 *
 * The default matters more than the mechanism. A meaningful share of this
 * site's audience is in the UK and EU, where analytics storage requires prior
 * consent — so nothing loads until someone actively agrees, and "unset" is
 * treated exactly like "denied" everywhere except when deciding whether to
 * show the banner.
 *
 * `useSyncExternalStore` for the same reason as the currency preference:
 * localStorage is an external store, and reading it in an effect would cause a
 * cascading render and risk a hydration mismatch.
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

function getSnapshot(): ConsentState {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  } catch {
    // Private browsing can throw. Treat an unreadable store as no consent.
    return "unset";
  }
}

/**
 * Server and hydration snapshot.
 *
 * Always "unset", which renders nothing — the banner appears after hydration
 * rather than flashing on every server-rendered page for people who already
 * answered.
 */
function getServerSnapshot(): ConsentState {
  return "unset";
}

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  return getSnapshot();
}

export function setConsent(next: Exclude<ConsentState, "unset">) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
  } catch {
    // The choice will not persist, but it still applies for this session.
  }
  emit();
}

export function useConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const grant = useCallback(() => setConsent("granted"), []);
  const deny = useCallback(() => setConsent("denied"), []);

  return { consent, grant, deny };
}
