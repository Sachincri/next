"use client";

import React, { useState } from "react";
import {
  useGetMyWalletQuery,
  useGetWalletTransactionsQuery,
  useGetMyShareStatsQuery,
  useGetMyShareLinksQuery,
  useCreateShareLinkMutation,
  useGetContestsQuery,
  useGetLeaderboardQuery,
  useGetMyReferredOrdersQuery,
} from "@/redux/api/shareApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { copyToClipboardSafe } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  Share2,
  Copy,
  Trophy,
  Gift,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Check,
  ShieldCheck,
  Truck,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function EarnAffiliatePage() {
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState("");

  const { data: walletData, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const { data: statsData } = useGetMyShareStatsQuery();
  const { data: linksData, refetch: refetchLinks } = useGetMyShareLinksQuery();
  const { data: txData, isLoading: isTxLoading } = useGetWalletTransactionsQuery();
  const { data: contestsData } = useGetContestsQuery();
  const { data: leaderboardData } = useGetLeaderboardQuery({ limit: 10 });
  const { data: referralsData, isLoading: isReferralsLoading } = useGetMyReferredOrdersQuery();

  const [createShareLink, { isLoading: isCreatingLink }] = useCreateShareLinkMutation();

  const wallet = walletData?.data?.wallet;
  const stats = statsData?.data;
  const links = linksData?.data?.links || [];
  const transactions = txData?.data?.transactions || [];
  const contests = contestsData?.data?.contests || [];
  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const referredOrders = referralsData?.data?.orders || [];
  const referralSummary = referralsData?.data?.summary || {};

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aura-store.com";
  const defaultShareCode = links?.[0]?.code || (wallet ? `REF${String(wallet.user).slice(-6).toUpperCase()}` : "JOINNOW");
  const referralUrl = `${origin}/?ref=${defaultShareCode}`;

  const copyToClipboard = async (url: string) => {
    await copyToClipboardSafe(url);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShareLink({ customCode: customCode ? customCode.trim() : undefined }).unwrap();
      toast.success("Affiliate share link created!");
      setCustomCode("");
      refetchLinks();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create link");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-800 p-6 sm:p-10 text-white shadow-xl shadow-indigo-500/10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20 text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Share & Earn Program
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Share Products, Earn Lifetime Wallet Cash
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Earn commissions every time someone purchases through your link (min ₹2,000 threshold). Plus, compete in monthly affiliate contests for cash prizes!
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <Wallet className="w-80 h-80" />
          </div>
        </div>

        {/* Top 4 Wallet & Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs text-slate-500 flex items-center justify-between">
                Wallet Balance
                <Wallet className="w-4 h-4 text-emerald-500" />
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{isWalletLoading ? "..." : (wallet?.balance || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Available for purchases & refunds</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs text-slate-500 flex items-center justify-between">
                Lifetime Earnings
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ₹{(wallet?.lifetimeEarnings || stats?.totalEarnings || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">All-time rewards accumulated</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs text-slate-500 flex items-center justify-between">
                Total Orders Referred
                <Users className="w-4 h-4 text-amber-500" />
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.totalOrders || stats?.conversions || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{stats?.totalClicks || 0} total link clicks</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <span className="text-xs text-slate-500 flex items-center justify-between">
                Pending Commissions
                <Clock className="w-4 h-4 text-orange-500" />
              </span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                ₹{(wallet?.pendingCommission || stats?.pendingEarnings || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Releases after return period</p>
            </CardContent>
          </Card>
        </div>

        {/* Master Referral Link Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Share2 className="w-4 h-4 text-indigo-500" /> Your Master Affiliate Link
            </h3>
            <p className="text-xs text-slate-500">
              Share this link anywhere (WhatsApp, Instagram bio, YouTube). Anyone who shops gets attributed to you!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-full sm:w-72 select-all focus:outline-none"
            />
            <Button
              size="sm"
              onClick={() => copyToClipboard(referralUrl)}
              className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Tabs for Details */}
        <Tabs defaultValue="contests" className="space-y-6">
          <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl">
            <TabsTrigger value="contests" className="rounded-xl text-xs font-semibold gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Active Contests & Leaderboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-xl text-xs font-semibold gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Wallet Transactions
            </TabsTrigger>
            <TabsTrigger value="links" className="rounded-xl text-xs font-semibold gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> My Shared Links ({links.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Contests & Leaderboard */}
          <TabsContent value="contests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Contests Cards */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-indigo-500" /> Active Rewards & Sales Contests
                </h3>

                {contests.length === 0 ? (
                  <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-8 text-center">
                    <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Active Contests Right Now</p>
                    <p className="text-xs text-slate-500 mt-1">Check back soon! New affiliate sales competitions are posted regularly.</p>
                  </Card>
                ) : (
                  contests.map((c: any) => (
                    <Card key={c._id} className="rounded-2xl border-indigo-200/50 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/20 to-transparent dark:from-indigo-950/10 p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-slate-900 dark:text-white">{c.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.description}</p>
                        </div>

                        <div className="text-right sm:self-center">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Prize Pool</span>
                          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{c.prizePool?.toLocaleString() || "5,000"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400">Total Prizes</span>
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 font-black">₹{(c.prizeAmount || c.prizePool)?.toLocaleString() || "5,000"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">Min Order Threshold</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">₹{c.minPurchaseAmount || c.minPurchaseThreshold || 2000}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">End Date</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {new Date(c.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Rank-wise Winner Rewards Showcase */}
                      {c.prizes && c.prizes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Winner Prizes ({c.winnerCount || c.prizes.length} Positions)
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Verified Deliveries Only
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {c.prizes.map((p: any) => (
                              <div
                                key={p.rank}
                                className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                              >
                                {p.prizeImage ? (
                                  <img
                                    src={p.prizeImage}
                                    alt={p.title}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 flex items-center justify-center text-sm font-black text-indigo-600 shrink-0">
                                    #{p.rank}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 inline-block mb-0.5">
                                    {p.rank === 1 ? "🥇 1st Prize" : p.rank === 2 ? "🥈 2nd Prize" : p.rank === 3 ? "🥉 3rd Prize" : `Rank #${p.rank}`}
                                  </span>
                                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate" title={p.title}>
                                    {p.title}
                                  </p>
                                  <p className="font-black text-indigo-600 dark:text-indigo-400 text-xs">
                                    ₹{p.amount?.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Top Earners Leaderboard
                  </h3>
                  <Link href="/leaderboard">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5">
                      View Full Leaderboard
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>

                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {leaderboard.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">No leaderboard entries yet. Be the first to earn!</div>
                    ) : (
                      leaderboard.map((item: any, idx: number) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              idx === 0 ? "bg-amber-400 text-amber-950 shadow-xs" :
                              idx === 1 ? "bg-slate-300 text-slate-900" :
                              idx === 2 ? "bg-amber-600 text-white" :
                              "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.userName || item.name || "Top Partner"}</p>
                              <p className="text-[10px] text-slate-400">{item.totalOrders || 0} valid sales</p>
                            </div>
                          </div>

                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                            ₹{(item.totalEarnings || item.earnings || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Wallet Transactions */}
          <TabsContent value="transactions">
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Wallet Transaction Ledger</span>
                  <span className="text-xs text-slate-400 font-normal">{transactions.length} records</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isTxLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No wallet transactions found. Commissions and dispute refunds will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {transactions.map((tx: any) => {
                      const isCredit = ["commission", "refund", "credit", "contest_prize"].includes(tx.type);
                      return (
                        <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isCredit ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-red-50 text-red-600 dark:bg-red-950/40"
                            }`}>
                              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white capitalize">
                                {tx.description || tx.type.replace(/_/g, " ")}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(tx.createdAt).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} • Status: <span className="text-emerald-600 font-semibold">{tx.status}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`font-black text-sm ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                              {isCredit ? "+" : "-"}₹{tx.amount?.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Bal: ₹{tx.balanceAfter?.toLocaleString() || "-"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Shared Links */}
          <TabsContent value="links" className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Create Custom Product Share Code</h4>
                <p className="text-xs text-slate-500">Pick a custom alias like MYDEALS or TECHGURU for your share links.</p>
              </div>

              <form onSubmit={handleCreateCustomLink} className="flex items-center gap-2">
                <Input
                  placeholder="Custom alias (e.g. VIP2026)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="text-xs rounded-xl uppercase font-mono max-w-xs"
                />
                <Button
                  type="submit"
                  disabled={isCreatingLink}
                  className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex-shrink-0"
                >
                  Create Link
                </Button>
              </form>
            </div>

            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-semibold uppercase text-[11px]">
                      <th className="p-3.5 pl-5">Code / Link</th>
                      <th className="p-3.5">Clicks</th>
                      <th className="p-3.5">Orders Placed</th>
                      <th className="p-3.5">Earnings</th>
                      <th className="p-3.5">Created</th>
                      <th className="p-3.5 text-right pr-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {links.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No custom links created yet. Share your master referral link above to start earning!
                        </td>
                      </tr>
                    ) : (
                      links.map((link: any) => {
                        const linkUrl = `${origin}/?ref=${link.code}`;
                        return (
                          <tr key={link._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                            <td className="p-3.5 pl-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {link.code}
                            </td>
                            <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{link.clicks || 0}</td>
                            <td className="p-3.5 font-bold text-emerald-600">{link.conversions || 0}</td>
                            <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                              ₹{(link.earnings || 0).toLocaleString()}
                            </td>
                            <td className="p-3.5 text-slate-400">
                              {new Date(link.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </td>
                            <td className="p-3.5 text-right pr-5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(linkUrl)}
                                className="h-7 px-2.5 text-xs rounded-lg gap-1"
                              >
                                <Copy className="w-3 h-3" /> Copy
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: Referred Orders & Return Policy Countdown */}
          <TabsContent value="referrals" className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4">
                <span className="text-[11px] text-slate-500 font-medium">Total Referred Orders</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {referralSummary.totalReferred || 0}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Across all your shared links</p>
              </Card>

              <Card className="rounded-2xl border-amber-200/60 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 p-4">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> In Return Window
                </span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {referralSummary.inReturnWindowCount || 0}
                </p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">Counting down 7-day policy</p>
              </Card>

              <Card className="rounded-2xl border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-4">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Success
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {referralSummary.successCount || 0}
                </p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Added to Leaderboard</p>
              </Card>

              <Card className="rounded-2xl border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 p-4">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">Verified Sales Volume</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  ₹{(referralSummary.totalVerifiedRevenue || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">Qualified contest revenue</p>
              </Card>
            </div>

            {/* Explanation Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-indigo-900 dark:text-indigo-200">
                  How Return Policy Countdown & Leaderboard Addition Works:
                </p>
                <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed text-[11px]">
                  When a customer places an order via your link, it is tracked immediately. Once the order is successfully <strong>Delivered</strong>, a <strong>7-day store return policy countdown</strong> begins. If the customer keeps the product and the return window closes without return or cancellation, the status automatically switches to <strong className="text-emerald-600 dark:text-emerald-400">"✓ Success"</strong> — your pending commission is officially transferred to your withdrawable wallet, and the order is added to your <strong>Contest & Leaderboard rankings</strong>!
                </p>
              </div>
            </div>

            {/* Orders List Table */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span>Referred Customer Orders</span>
                  <span className="text-xs text-slate-400 font-normal">({referredOrders.length} orders)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isReferralsLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : referredOrders.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No referred orders yet.</p>
                    <p>Share your product links or store referral code to start earning verified sales!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {referredOrders.map((order: any) => {
                      const isSuccess = order.status === "success";
                      const isInReturn = order.status === "in_return_window";
                      const isInTransit = order.status === "in_transit";
                      const isCancelled = order.status === "cancelled_returned";

                      return (
                        <div
                          key={order._id}
                          className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                        >
                          {/* Left: Order Info & Product thumb */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            {order.items?.[0]?.image ? (
                              <img
                                src={order.items[0].image}
                                alt="product"
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <Gift className="w-5 h-5 text-slate-400" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-sm mt-0.5">
                                {order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(", ") || "General Order"}
                              </p>

                              <p className="text-[11px] text-slate-500 mt-1">
                                Order Value: <strong className="text-slate-900 dark:text-white">₹{order.totalPrice?.toLocaleString()}</strong>
                                {order.deliveredAt && (
                                  <span className="ml-2 text-slate-400">
                                    • Delivered on {new Date(order.deliveredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Center: Live Return Countdown / Delivery Status */}
                          <div className="flex flex-col items-start md:items-center text-left md:text-center min-w-[220px]">
                            {isInReturn && (
                              <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                <div>
                                  <p className="text-[11px] font-black">
                                    {order.countdown?.daysRemaining}d {order.countdown?.hoursRemaining}h {order.countdown?.minutesRemaining}m left
                                  </p>
                                  <p className="text-[9px] text-amber-600/80 dark:text-amber-400/80">In 7-day return policy window</p>
                                </div>
                              </div>
                            )}

                            {isInTransit && (
                              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-blue-500" />
                                <div>
                                  <p className="text-[11px] font-bold">In Transit</p>
                                  <p className="text-[9px] text-blue-500/80">Return countdown starts after delivery</p>
                                </div>
                              </div>
                            )}

                            {isSuccess && (
                              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-2xs">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-[11px] font-black tracking-wide">✓ Success (Verified)</p>
                                  <p className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80">Added to Leaderboard & Wallet</p>
                                </div>
                              </div>
                            )}

                            {isCancelled && (
                              <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold">
                                Order Cancelled / Returned
                              </div>
                            )}
                          </div>

                          {/* Right: Commission & Leaderboard Qualification */}
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Affiliate Commission</span>
                            <p className={`text-base font-black ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                              ₹{order.commissionAmount?.toLocaleString() || 0}
                            </p>
                            <span className={`text-[10px] font-semibold block mt-0.5 ${
                              isSuccess ? "text-emerald-600" : isInReturn ? "text-amber-500" : "text-slate-400"
                            }`}>
                              {isSuccess ? "✓ Credited to Wallet" : isInReturn ? "Holding in return period" : "Pending Delivery"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

