import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Coupons | Admin",
  },
  description: "Manage discount coupons, usage limits, and promotional campaigns.",
};

export default function CouponsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
