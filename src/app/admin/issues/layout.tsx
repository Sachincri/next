import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Support Issues | Admin",
  },
  description: "Manage, filter, and resolve customer support tickets.",
};

export default function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
