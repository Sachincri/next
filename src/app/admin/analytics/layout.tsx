import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Analytics & Insights | Admin",
  },
  description:
    "Advanced store analytics, KPI summaries, interactive report builder, and pre-built reports.",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
