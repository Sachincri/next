"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetPublicSettingsQuery } from "@/redux/api/homeApi";
import { useCookieConsent } from "./CookieConsentContext";

export function CookieConsentBanner() {
  const pathname = usePathname();
  const {
    consent,
    isBannerVisible,
    isPreferencesOpen,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
  } = useCookieConsent();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    setAnalyticsEnabled(Boolean(consent?.analytics));
    setMarketingEnabled(Boolean(consent?.marketing));
  }, [consent, isPreferencesOpen]);

  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {isBannerVisible && !isAdminRoute && (
        <aside
          role="dialog"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-2.5 shadow-sm text-slate-900"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pr-16 sm:pr-20">
            <p className="text-xs sm:text-sm text-slate-700 leading-snug">
              We use cookies for cart, checkout, and optional analytics.{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 whitespace-nowrap"
              >
                Privacy Notice
              </Link>
            </p>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openPreferences}
                className="h-8 px-3 rounded-lg border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-xs font-medium"
              >
                Manage
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void rejectNonEssential()}
                className="h-8 px-3 rounded-lg border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium"
              >
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void acceptAll()}
                className="h-8 px-3 rounded-lg border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium"
              >
                Accept All
              </Button>
            </div>
          </div>
        </aside>
      )}

      <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
        <DialogContent className="sm:max-w-lg bg-white text-slate-900 border border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Manage Cookie &amp; Tracking Preferences
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed">
              Under India&apos;s Digital Personal Data Protection (DPDP) Act, non-essential scripts remain blocked unless you opt in. You can withdraw consent anytime via the footer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Essential */}
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-slate-900">Essential Cookies</Label>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    Always On
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Required for authentication, session security, cart persistence, and Razorpay/Stripe checkout.
                </p>
              </div>
              <Switch checked disabled aria-label="Essential cookies always active" />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="space-y-1">
                <Label htmlFor="dpdp-cookie-analytics" className="text-sm font-semibold text-slate-900 cursor-pointer">
                  Analytics Cookies
                </Label>
                <p className="text-xs text-slate-600">
                  Enables Google Analytics measurement so we understand storefront performance. Strictly gated until consented.
                </p>
              </div>
              <Switch
                id="dpdp-cookie-analytics"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="space-y-1">
                <Label htmlFor="dpdp-cookie-marketing" className="text-sm font-semibold text-slate-900 cursor-pointer">
                  Marketing Cookies
                </Label>
                <p className="text-xs text-slate-600">
                  Allows personalized promotional attribution and remarketing tags. Off by default.
                </p>
              </div>
              <Switch
                id="dpdp-cookie-marketing"
                checked={marketingEnabled}
                onCheckedChange={setMarketingEnabled}
              />
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Learn how we collect, store, and process personal data in our{" "}
            <Link
              href="/privacy-policy"
              onClick={closePreferences}
              className="font-medium text-indigo-600 underline hover:text-indigo-700"
            >
              DPDP Privacy Notice
            </Link>
            .
          </div>

          <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:space-x-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void rejectNonEssential()}
              className="h-10 border-slate-300 text-slate-900 hover:bg-slate-50 text-xs font-semibold"
            >
              Reject Non-Essential
            </Button>
            <Button
              type="button"
              onClick={() =>
                void savePreferences({
                  analytics: analyticsEnabled,
                  marketing: marketingEnabled,
                })
              }
              className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Save Preferences
            </Button>
            <Button
              type="button"
              onClick={() => void acceptAll()}
              className="h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Accept All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Strictly gates Google Analytics & third-party marketing scripts behind explicit DPDP consent.
 * Scripts are NOT mounted until `consent.analytics === true`.
 */
export function ConsentGatedScripts() {
  const { consent } = useCookieConsent();
  const { data: settings } = useGetPublicSettingsQuery();

  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    (settings as any)?.gaMeasurementId ||
    "";

  const analyticsAllowed =
    Boolean(consent?.analytics) &&
    Boolean(gaMeasurementId) &&
    (settings?.googleAnalyticsEnabled ?? true);

  useEffect(() => {
    if (!gaMeasurementId || typeof window === "undefined") return;
    (window as any)[`ga-disable-${gaMeasurementId}`] = !analyticsAllowed;
  }, [gaMeasurementId, analyticsAllowed]);

  if (!analyticsAllowed || !gaMeasurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="dpdp-gated-ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
