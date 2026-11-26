import type { Metadata } from "next";
import PrivacyNoticeContent from "@/components/privacy/PrivacyNoticeContent";

export const metadata: Metadata = {
  title: "Privacy Notice (DPDP Act Compliant)",
  description:
    "Plain-language DPDP Act (2023) & Rules (2025) compliant Privacy Notice detailing data collection, processors, user rights, and Grievance Officer contact.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyNoticeContent />;
}
