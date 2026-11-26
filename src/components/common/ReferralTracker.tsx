"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { server } from "@/redux/constants";

const REFERRAL_STORAGE_KEY = "aura_referral_code";
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function saveReferralCode(code: string) {
  if (typeof window === "undefined") return;
  const clean = code.trim();
  if (!clean) return;
  try {
    window.localStorage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify({ code: clean, expiresAt: Date.now() + REFERRAL_TTL_MS })
    );
    document.cookie = `share_code=${encodeURIComponent(clean)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {
    // ignore storage quota errors
  }
}

export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.code || (parsed.expiresAt && parsed.expiresAt < Date.now())) {
      window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }
    return String(parsed.code);
  } catch {
    return null;
  }
}

function ReferralTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("referrer");
    if (!ref || !ref.trim()) return;

    const cleanCode = ref.trim();
    saveReferralCode(cleanCode);

    // Track click once per browser session per code via backend endpoint
    try {
      const trackedKey = `aura_ref_click_${cleanCode.toUpperCase()}`;
      if (!window.sessionStorage.getItem(trackedKey)) {
        window.sessionStorage.setItem(trackedKey, "1");
        fetch(`${server}/share/link/${encodeURIComponent(cleanCode)}`, {
          method: "GET",
          credentials: "include",
        }).catch(() => {});
      }
    } catch {
      // ignore sessionStorage / network errors
    }
  }, [searchParams]);

  return null;
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}
