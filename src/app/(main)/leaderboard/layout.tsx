import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Viral Share Championship & Leaderboard | Aura Store",
  description:
    "Compete with elite referrers. Unlock handcrafted Grade 1 English Willow Bats, cash rewards, and ecommerce bounty before the final over!",
  openGraph: {
    title: "Viral Share Championship & Leaderboard | Aura Store",
    description:
      "Compete with elite referrers. Unlock handcrafted Grade 1 English Willow Bats and climb the leaderboard for cash prizes!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viral Share Championship & Leaderboard | Aura Store",
    description:
      "Compete with elite referrers and climb the leaderboard for cash prizes and rewards!",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

