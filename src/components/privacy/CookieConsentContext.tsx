"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useRecordConsentMutation } from "@/redux/api/privacyApi";
import { useGetPublicSettingsQuery } from "@/redux/api/homeApi";

export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  policyVersion: string;
  updatedAt: string;
}

interface CookieConsentContextValue {
  consent: CookieConsentState | null;
  hasDecided: boolean;
  anonymousId: string;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => Promise<void>;
  rejectNonEssential: () => Promise<void>;
  savePreferences: (prefs: { analytics: boolean; marketing: boolean }, source?: string) => Promise<void>;
}

const STORAGE_KEY = "aura_dpdp_cookie_consent";
const ANON_ID_KEY = "aura_dpdp_anonymous_id";
const POLICY_VERSION = "v1.0";

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";
  try {
    let existing = window.localStorage.getItem(ANON_ID_KEY);
    if (!existing) {
      existing =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(ANON_ID_KEY, existing);
    }
    return existing;
  } catch {
    return "";
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const [recordConsent] = useRecordConsentMutation();
  const { data: publicSettings, isLoading: settingsLoading } = useGetPublicSettingsQuery();

  const [hydrated, setHydrated] = useState(false);
  const [anonymousId, setAnonymousId] = useState("");
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [lastSyncedUserId, setLastSyncedUserId] = useState<string | null>(null);

  useEffect(() => {
    const anon = getOrCreateAnonymousId();
    setAnonymousId(anon);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
          setConsent({
            essential: true,
            analytics: parsed.analytics,
            marketing: parsed.marketing,
            policyVersion: parsed.policyVersion || POLICY_VERSION,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          });
        }
      }
    } catch {
      // Ignore malformed local storage
    }
    setHydrated(true);
  }, []);

  // Sync localStorage consent with backend when user authenticates
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user?._id) return;
    if (lastSyncedUserId === String(user._id)) return;

    setLastSyncedUserId(String(user._id));
    if (consent) {
      recordConsent({
        anonymousId: anonymousId || getOrCreateAnonymousId(),
        analytics: consent.analytics,
        marketing: consent.marketing,
        policyVersion: consent.policyVersion,
        source: "auth_sync",
      }).catch(() => {});
    } else if (user.consentPreferences) {
      // Restore server consent state into localStorage if user cleared browser storage
      const restored: CookieConsentState = {
        essential: true,
        analytics: Boolean(user.consentPreferences.analytics),
        marketing: Boolean(user.consentPreferences.marketing),
        policyVersion: user.consentPreferences.privacyPolicyVersion || POLICY_VERSION,
        updatedAt: new Date().toISOString(),
      };
      setConsent(restored);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      } catch {
        // ignore storage errors
      }
    }
  }, [hydrated, isAuthenticated, user, consent, anonymousId, lastSyncedUserId, recordConsent]);

  const persistConsent = useCallback(
    async (analytics: boolean, marketing: boolean, source: string) => {
      const next: CookieConsentState = {
        essential: true,
        analytics,
        marketing,
        policyVersion: POLICY_VERSION,
        updatedAt: new Date().toISOString(),
      };
      setConsent(next);
      setIsPreferencesOpen(false);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }

      const anon = anonymousId || getOrCreateAnonymousId();
      try {
        await recordConsent({
          anonymousId: anon,
          analytics,
          marketing,
          policyVersion: POLICY_VERSION,
          source,
        }).unwrap();
      } catch {
        // Still respect local consent decision even if offline
      }
    },
    [anonymousId, recordConsent]
  );

  const acceptAll = useCallback(() => persistConsent(true, true, "cookie_banner"), [persistConsent]);
  const rejectNonEssential = useCallback(
    () => persistConsent(false, false, "cookie_banner"),
    [persistConsent]
  );
  const savePreferences = useCallback(
    (prefs: { analytics: boolean; marketing: boolean }, source = "cookie_modal") =>
      persistConsent(prefs.analytics, prefs.marketing, source),
    [persistConsent]
  );

  const hasSavedLoggedInPreference = Boolean(
    isAuthenticated &&
      user?.consentPreferences &&
      (user.consentPreferences.privacyNoticeAccepted || user.consentPreferences.updatedAt)
  );

  const isBannerVisible =
    hydrated &&
    !settingsLoading &&
    Boolean(publicSettings?.showCookieBanner) &&
    consent === null &&
    !hasSavedLoggedInPreference;

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasDecided: Boolean(consent) || hasSavedLoggedInPreference,
        anonymousId,
        isBannerVisible,
        isPreferencesOpen,
        openPreferences: () => setIsPreferencesOpen(true),
        closePreferences: () => setIsPreferencesOpen(false),
        acceptAll,
        rejectNonEssential,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return ctx;
}
