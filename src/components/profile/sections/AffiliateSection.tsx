"use client";

import React, { useState } from "react";
import {
  useGetMyWalletQuery,
  useGetMyShareStatsQuery,
  useGetMyShareLinksQuery,
  useGetContestsQuery,
  useGetLeaderboardQuery,
  useGetWalletTransactionsQuery,
} from "@/redux/api/shareApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { copyToClipboardSafe } from "@/lib/utils";
import Link from "next/link";
import {
  Wallet,
  Trophy,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Sparkles,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Clock,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export const AffiliateSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const { data: walletData, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const { data: statsData } = useGetMyShareStatsQuery();
  const { data: linksData } = useGetMyShareLinksQuery();
  const { data: contestsData } = useGetContestsQuery();
  const { data: leaderboardData } = useGetLeaderboardQuery({ limit: 5 });
  const { data: txData } = useGetWalletTransactionsQuery({ limit: 5 });

  const wallet = walletData?.data?.wallet;
  const stats = statsData?.data;
  const links = linksData?.data?.links || [];
  const contests = contestsData?.data?.contests || [];
  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const transactions = txData?.data?.transactions || [];

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareCode = links?.[0]?.code || (wallet ? `REF${String(wallet.user).slice(-6).toUpperCase()}` : "JOINNOW");
  const referralUrl = `${origin}/?ref=${shareCode}`;

  const copyLink = async () => {
    await copyToClipboardSafe(referralUrl);
    setCopied(true);
    toast.success("Affiliate referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Shop with exclusive discounts on Aura Store: ${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-white/20 backdrop-blur-md">
              Affiliate & Rewards Control Panel
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Share Products & Earn Lifetime Wallet Cash
          </h2>
          <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
            Earn commissions on every friend or follower who orders (min ₹2,000 threshold). Track your earnings, dispute refunds, contests, and leaderboard position right here.
          </p>

          <div className="pt-2">
            <Link
              href="/earn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-xs"
            >
              Open Full Earn Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <Wallet className="w-48 h-48 absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6" />
      </div>

      {/* Wallet Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] text-slate-500 flex items-center justify-between">
              Wallet Balance
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            </span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{isWalletLoading ? "..." : (wallet?.balance || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Available cash</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] text-slate-500 flex items-center justify-between">
              Lifetime Earnings
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            </span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              ₹{(wallet?.lifetimeEarnings || stats?.totalEarnings || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Accumulated rewards</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] text-slate-500 flex items-center justify-between">
              Referred Orders
              <Users className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {stats?.totalOrders || stats?.conversions || 0}
            </p>
            <p className="text-[10px] text-slate-400">{stats?.totalClicks || 0} link clicks</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3.5 pb-1">
            <span className="text-[11px] text-slate-500 flex items-center justify-between">
              Pending Commission
              <Clock className="w-3.5 h-3.5 text-orange-500" />
            </span>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <p className="text-xl font-black text-orange-600 dark:text-orange-400">
              ₹{(wallet?.pendingCommission || stats?.pendingEarnings || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Holding in return period</p>
          </CardContent>
        </Card>
      </div>

      {/* Master Referral Link Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-indigo-500" /> Your Master Affiliate Link
          </h3>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Active & Tracking
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold select-all focus:outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={copyLink}
              className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 flex-1 sm:flex-none"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={shareWhatsApp}
              className="rounded-xl text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Two Columns: Contests & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contests */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-indigo-500" /> Active Sales Contests
            </h3>
            <span className="text-[11px] text-slate-400">Threshold: ₹2,000 / order</span>
          </div>

          {contests.length === 0 ? (
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
              No active contests right now. Stay tuned for upcoming mega affiliate rewards!
            </Card>
          ) : (
            contests.slice(0, 2).map((c: any) => (
              <Card key={c._id} className="rounded-2xl border-indigo-200/50 dark:border-indigo-900/40 p-4 bg-gradient-to-br from-indigo-50/20 to-transparent dark:from-indigo-950/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h4>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        {c.winnerCount || c.prizes?.length || 1} Winners
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    ₹{(c.prizeAmount || c.prizePool)?.toLocaleString()}
                  </span>
                </div>

                {/* Show top winner prize badges */}
                {c.prizes && c.prizes.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1">
                    {c.prizes.slice(0, 3).map((p: any) => (
                      <div key={p.rank} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 text-[10px] shrink-0">
                        {p.prizeImage ? (
                          <img src={p.prizeImage} alt={p.title} className="w-5 h-5 rounded object-cover" />
                        ) : (
                          <span>{p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}</span>
                        )}
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{p.title}</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">₹{p.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Min Order: <strong>₹{c.minPurchaseAmount || c.minPurchaseThreshold || 2000}</strong></span>
                  <span>Ends: <strong>{new Date(c.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</strong></span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Top Earners Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Affiliate Leaderboard
            </h3>
            <Link href="/earn" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              View All →
            </Link>
          </div>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {leaderboard.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No rankings yet. Start sharing to claim #1 rank!</div>
              ) : (
                leaderboard.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/60">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? "bg-amber-400 text-amber-950 font-black" :
                        idx === 1 ? "bg-slate-300 text-slate-900" :
                        idx === 2 ? "bg-amber-600 text-white" :
                        "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{item.userName || item.name || "Affiliate Partner"}</p>
                        <p className="text-[10px] text-slate-400">{item.totalOrders || 0} valid sales</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">
                      ₹{(item.totalEarnings || item.earnings || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Wallet Transactions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-emerald-500" /> Recent Wallet History (Dispute Refunds & Commissions)
        </h3>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No transactions recorded yet.</div>
            ) : (
              transactions.map((tx: any) => {
                const isCredit = ["commission", "refund", "credit", "contest_prize"].includes(tx.type);
                return (
                  <div key={tx._id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCredit ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-red-50 text-red-600"
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{tx.description || tx.type.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                        {isCredit ? "+" : "-"}₹{tx.amount?.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400">Bal: ₹{tx.balanceAfter?.toLocaleString() || "-"}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

