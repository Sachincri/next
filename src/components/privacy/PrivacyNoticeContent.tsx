"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  Server,
  UserCheck,
  Mail,
  Phone,
  Building2,
  Cookie,
  FileDown,
  Trash2,
} from "lucide-react";
import { useGetPublicSettingsQuery } from "@/redux/api/homeApi";
import { useCookieConsent } from "./CookieConsentContext";
import { Button } from "@/components/ui/button";

const DATA_POINTS = [
  {
    data: "Full Name",
    purpose: "Account identification, personalized order receipts, and shipping labels.",
    basis: "Contractual Necessity & Consent",
  },
  {
    data: "Email Address",
    purpose: "OTP verification, order/GST tax invoice delivery, support updates, and (only if opted in) email offers.",
    basis: "Consent & Legal GST Obligation",
  },
  {
    data: "Phone Number",
    purpose: "Courier delivery coordination, COD verification, and (only if opted in) WhatsApp updates.",
    basis: "Contractual Necessity & Explicit Opt-In",
  },
  {
    data: "Shipping & Billing Address",
    purpose: "Accurate dispatch, pin-code serviceability verification, and state-wise GST tax calculation (CGST/SGST/IGST).",
    basis: "Contractual Necessity & Indian GST Law",
  },
  {
    data: "Order & Payment Metadata",
    purpose: "Transaction verification, fraud prevention, returns/refunds, and statutory 8-year GST tax record retention.",
    basis: "Statutory Compliance & Legitimate Fulfillment",
  },
];

const THIRD_PARTY_PROCESSORS = [
  {
    name: "Razorpay / Stripe",
    role: "Payment Gateway",
    details: "Processes UPI, cards, netbanking, and wallets securely via PCI-DSS compliant checkout. Card numbers are never stored on our servers.",
  },
  {
    name: "Cloudinary",
    role: "Media & Image Hosting",
    details: "Stores product visuals and customer-uploaded review or dispute evidence photos securely.",
  },
  {
    name: "Google Analytics (Strictly Gated)",
    role: "Traffic & Storefront Analytics",
    details: "Activated ONLY if you explicitly grant Analytics cookie consent via the Cookie Banner or Manage Preferences modal.",
  },
  {
    name: "Shiprocket / Delhivery & Logistics Partners",
    role: "Fulfillment & Last-Mile Delivery",
    details: "Receives recipient name, delivery address, and phone number strictly to generate airway bills and complete delivery.",
  },
  {
    name: "Brevo & Meta WhatsApp Cloud API",
    role: "Messaging Infrastructure",
    details: "Delivers transactional order alerts, and promotional campaigns strictly when you hold active Email or WhatsApp marketing consent.",
  },
];

export default function PrivacyNoticeContent() {
  const { data: settings } = useGetPublicSettingsQuery();
  const { openPreferences } = useCookieConsent();

  const storeName = settings?.storeName || settings?.companyLegalName || "Our Store";
  const legalName = settings?.companyLegalName || storeName;
  const grievanceName = settings?.grievanceOfficerName || "Data Protection & Grievance Officer";
  const grievanceEmail = settings?.grievanceOfficerEmail || settings?.supportEmail || "privacy@aurastore.in";
  const grievancePhone = settings?.grievanceOfficerPhone || settings?.helpLineNumber || "";
  const policyVersion = settings?.dpdpPolicyVersion || "v1.0";
  const registeredAddress = [
    settings?.companyAddress,
    settings?.companyCity,
    settings?.companyState,
    settings?.companyPincode,
    settings?.companyCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              <ShieldCheck className="h-4 w-4" />
              India DPDP Act (2023) &amp; Rules (2025) Compliant
            </div>
            <span className="text-xs font-mono text-slate-500">Notice Version: {policyVersion}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Privacy Notice — {storeName}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {legalName} (&quot;Data Fiduciary&quot;) is committed to protecting your personal data under
            India&apos;s <strong>Digital Personal Data Protection Act, 2023</strong> and{" "}
            <strong>DPDP Rules, 2025</strong>. This plain-language notice explains exactly what data we
            collect, why we process it, who receives it, and how you can exercise full control over your information.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/me?tab=privacy">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold">
                Manage My Data &amp; Consent
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={openPreferences}
              className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-xs sm:text-sm font-semibold gap-1.5"
            >
              <Cookie className="h-4 w-4" />
              Cookie Preferences
            </Button>
          </div>
        </div>

        {/* Section 1: Data Collected & Specific Purposes */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              1. Personal Data Collected &amp; Specific Purpose
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            We collect only the personal data strictly necessary to fulfill your purchases, issue statutory tax invoices, and communicate with you per your chosen preferences:
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Personal Data Point</th>
                  <th className="py-3 px-4">Specific Purpose of Processing</th>
                  <th className="py-3 px-4">Legal Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DATA_POINTS.map((row) => (
                  <tr key={row.data} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{row.data}</td>
                    <td className="py-3.5 px-4 text-slate-600 leading-relaxed">{row.purpose}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-indigo-700 whitespace-nowrap">{row.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Third-Party Data Processors */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <Server className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              2. Third-Party Processors &amp; Service Providers
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            We share limited data with vetted infrastructure, payment, analytics, and logistics processors solely for their specific operational functions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THIRD_PARTY_PROCESSORS.map((proc) => (
              <div key={proc.name} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">{proc.name}</h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {proc.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{proc.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Your Rights Under DPDP */}
        <section id="cookies" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <UserCheck className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              3. Your Rights as a Data Principal
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <FileDown className="h-4 w-4 text-indigo-600" /> Right to Access Information
              </div>
              <p className="text-xs text-slate-600">
                Download a complete machine-readable copy (JSON) of your profile, saved addresses, order history, and consent timestamps from your account.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-semibold text-slate-900">Right to Correction &amp; Updating</div>
              <p className="text-xs text-slate-600">
                Update inaccurate personal details directly in Personal Info or submit a formal correction request in Privacy &amp; Data settings.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-semibold text-slate-900">Right to Withdraw Consent</div>
              <p className="text-xs text-slate-600">
                Opt out of promotional Email, WhatsApp, or optional Analytics/Marketing cookies in 1 click at any time without affecting order placement.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-600" /> Right to Erasure (Account Deletion)
              </div>
              <p className="text-xs text-slate-600">
                Request immediate account deletion and PII anonymization. Note: GST tax invoices and financial ledgers remain retained strictly as required by Indian tax law.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Grievance Officer */}
        <section className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              4. Grievance Officer &amp; Data Privacy Requests
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            In accordance with the DPDP Act (2023) and DPDP Rules (2025), if you have questions, grievances, or wish to exercise any privacy right, please contact our designated Grievance Officer or submit an online request from your account dashboard:
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-2.5 text-sm">
            <div className="font-semibold text-slate-900">{grievanceName}</div>
            <div className="text-xs text-slate-600">{legalName}</div>
            {registeredAddress && (
              <div className="text-xs text-slate-600">{registeredAddress}</div>
            )}
            <div className="flex flex-wrap gap-4 pt-1">
              <a
                href={`mailto:${grievanceEmail}`}
                className="inline-flex items-center gap-1.5 text-indigo-600 font-medium hover:underline"
              >
                <Mail className="h-4 w-4" />
                {grievanceEmail}
              </a>
              {grievancePhone && (
                <a
                  href={`tel:${grievancePhone}`}
                  className="inline-flex items-center gap-1.5 text-slate-700 font-medium hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {grievancePhone}
                </a>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Logged-in users receive instant consent toggles, 1-click JSON exports, and request tracking.
            </p>
            <Link
              href="/me?tab=privacy"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Submit a Data / Privacy Request →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
