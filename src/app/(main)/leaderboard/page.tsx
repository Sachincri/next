"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  useGetLeaderboardQuery,
  useGetContestsQuery,
  useGetContestWinnersQuery,
  useGetMyShareStatsQuery,
  useGetMyShareLinksQuery,
  useGetMyWalletQuery,
} from "@/redux/api/shareApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import toast from "react-hot-toast";
import { copyToClipboardSafe } from "@/lib/utils";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Flame,
  TrendingUp,
  Users,
  ChevronRight,
  Sparkles,
  Gift,
  Calendar,
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  Clock,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Twitter,
  Instagram,
  Radio,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  User,
  LogIn,
  Dices,
} from "lucide-react";

export default function LeaderboardPage() {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.user);

  /* ── Queries ── */
  const { data: leaderboardData, isLoading: isLbLoading } = useGetLeaderboardQuery({ limit: 50, period: "all" });
  const { data: activeContestsData, isLoading: isContestsLoading } = useGetContestsQuery({ status: "active" });
  const { data: completedContestsData } = useGetContestWinnersQuery();
  const { data: myStatsData } = useGetMyShareStatsQuery(undefined, { skip: !isAuthenticated });
  const { data: myLinksData } = useGetMyShareLinksQuery(undefined, { skip: !isAuthenticated });
  const { data: myWalletData } = useGetMyWalletQuery(undefined, { skip: !isAuthenticated });

  const rawLeaderboard = leaderboardData?.data?.leaderboard || [];
  const activeContests = activeContestsData?.data?.contests || [];
  const completedContests = completedContestsData?.data?.contests || [];
  const activeContest = activeContests[0] || null;

  /* ── State ── */
  const [pulseIndex, setPulseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [simulatorShares, setSimulatorShares] = useState(5);
  const [showArchive, setShowArchive] = useState(false);

  /* ── Real Live Activity Feed Derived from Contest Contenders ── */
  const realPulses = useMemo(() => {
    if (rawLeaderboard.length === 0) {
      return [
        { message: "Live Contest Active • Verified customer orders qualify for the Lucky Draw", tag: "Live Arena" },
        { message: "Har 1 verified order = 1 Lucky Draw Ticket • Koi minimum order zaroori nahi", tag: "Fair Draw" },
        { message: "10 orders = 10x chance! Random Lucky Draw se koi bhi jeet sakta hai", tag: "Grand Draw" },
      ];
    }
    return rawLeaderboard.slice(0, 5).map((item: any, idx: number) => ({
      message: `${item.userName || "Contender"} holds ${item.totalOrders || item.totalPurchases || 0} Lucky Draw Tickets with verified orders`,
      tag: idx === 0 ? "🥇 Top Contender" : `Contender #${idx + 1}`,
    }));
  }, [rawLeaderboard]);

  useEffect(() => {
    if (realPulses.length <= 1) return;
    const pulseTimer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % realPulses.length);
    }, 4500);
    return () => clearInterval(pulseTimer);
  }, [realPulses.length]);

  /* ── Dynamic Countdown Timer (Based on Real Active Contest End Date) ── */
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!activeContest?.endDate) {
      setTimeLeft(null);
      return;
    }

    const targetDate = new Date(activeContest.endDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeContest]);

  /* ── Real User Tactical Data ── */
  const userVerifiedShares =
    myStatsData?.data?.verifiedPurchases ??
    myStatsData?.data?.totalPurchases ??
    myStatsData?.data?.totalOrders ??
    0;
  const userClicks = myStatsData?.data?.totalClicks ?? 0;
  const userConversionRate = myStatsData?.data?.conversionRate !== undefined
    ? myStatsData.data.conversionRate
    : userClicks > 0
    ? ((userVerifiedShares / userClicks) * 100).toFixed(1)
    : "0.0";

  // Real user rank calculated from live leaderboard
  const userRankIndex = rawLeaderboard.findIndex((item: any) =>
    user && (String(item.userId) === String((user as any)._id) || item.userName === user.name)
  );
  const userRankLabel = userRankIndex !== -1 ? `#${userRankIndex + 1}` : "Unranked";
  const isUserRanked = userRankIndex !== -1;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aura-store.com";
  const userShareCode = myLinksData?.data?.links?.[0]?.code || (user ? `REF${String((user as any)._id || "").slice(-6).toUpperCase()}` : "");
  const referralUrl = userShareCode ? `${origin}/?ref=${userShareCode}` : origin;

  const copyToClipboard = async (text: string) => {
    if (!text || text === origin) {
      toast.error("Referral link is still loading, please wait...");
      return;
    }
    await copyToClipboardSafe(text);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── 1-Click Fast Blast Channels ── */
  const shareMessage = `🔥 Shop high quality products on Aura Store and unlock exclusive rewards! ${referralUrl}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const handleShareStory = () => {
    if (navigator.share) {
      navigator.share({
        title: "Aura Store Share & Earn",
        text: shareMessage,
        url: referralUrl,
      }).catch(() => {});
    } else {
      copyToClipboard(referralUrl);
      toast.success("Link copied! Paste into your Instagram Story or Bio!");
    }
  };

  /* ── Real Podium Leaders (Top 3) ── */
  const top1 = rawLeaderboard[0] || null;
  const top2 = rawLeaderboard[1] || null;
  const top3 = rawLeaderboard[2] || null;

  // Real Roster (Ranks 4 to 10)
  const roster = useMemo(() => {
    return rawLeaderboard.slice(3, 10).map((item: any, idx: number) => {
      const rank = idx + 4;
      const initials = (item.userName || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
      const customPrize = activeContest?.prizes?.find((p: any) => p.rank === rank)?.title;
      return {
        rank,
        name: item.userName || `Contender #${rank}`,
        tier: customPrize || `Rank #${rank} Qualifier`,
        trend: `Rank #${rank}`,
        shares: item.totalOrders || item.totalPurchases || 0,
        earnings: item.totalEarnings || item.totalCommission || 0,
        initials,
        isCutoff: rank === 10 || rank === rawLeaderboard.length,
      };
    });
  }, [rawLeaderboard, activeContest]);

  // Arena Statistics
  const totalArenaPrize = activeContest?.prizePool || activeContest?.prizeAmount || (activeContest?.prizes ? activeContest.prizes.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0);
  const totalArenaShares = rawLeaderboard.reduce((sum: number, item: any) => sum + (item.totalOrders || item.totalPurchases || 0), 0);
  const totalArenaContenders = rawLeaderboard.length;

  /* ── Lucky Draw Raffle & Simulator Calculations ── */
  const userTickets = userVerifiedShares;
  const totalArenaTickets = totalArenaShares;
  const userWinOdds = totalArenaTickets > 0 ? ((userTickets / totalArenaTickets) * 100).toFixed(1) : "0.0";

  const projectedShares = userVerifiedShares + simulatorShares;
  const projectedArenaTickets = totalArenaTickets + simulatorShares;
  const projectedWinOdds = projectedArenaTickets > 0
    ? (((userTickets + simulatorShares) / projectedArenaTickets) * 100).toFixed(1)
    : "100.0";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070913] text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          TOP BRAND / ARENA BANNER
      ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-16 sm:top-20 z-30">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] xs:text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Tournament Arena Live
            </span>
            {activeContest && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] xs:text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
                {activeContest.title ? `Contest: ${activeContest.title}` : "Active Season"}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Auto-Synced Verified Ledger
            </span>
          </div>

          {/* Real-time Ticker / Live Contest Activity Feed */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 sm:gap-2 text-xs bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-2xs overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-extrabold uppercase text-[8px] xs:text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" /> Live Feed:
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate text-[10px] xs:text-[11px] sm:text-xs max-w-[150px] xs:max-w-[220px] sm:max-w-md md:max-w-none">
                {realPulses[pulseIndex]?.message}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] xs:text-[9px] sm:text-[10px] font-black bg-emerald-500 text-white shadow-2xs shrink-0">
              {realPulses[pulseIndex]?.tag}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HERO TITLE AREA
      ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-none break-words">
              {activeContest?.title ? (
                <>
                  {activeContest.title.split(" ").slice(0, -1).join(" ") || "SHARE & WIN"}{" "}
                  <span className="text-emerald-500 dark:text-emerald-400 drop-shadow-xs">
                    {activeContest.title.split(" ").slice(-1)[0] || "LUCKY DRAW"}
                  </span>
                </>
              ) : (
                <>
                  SHARE & WIN{" "}
                  <span className="text-emerald-500 dark:text-emerald-400 drop-shadow-xs">
                    LUCKY DRAW ARENA
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
              {activeContest?.description || "Refer products to friends and family. Har verified order par milta hai 1 Lucky Draw Ticket — koi minimum order zaroori nahi, winners random draw se chune jayenge!"}
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Dices className="w-3.5 h-3.5 text-amber-500" /> Random Lucky Draw: Har 1 Order = 1 Ticket (10 Orders = 10x Win Chance!)
              </span>
            </div>
          </div>

          {/* Quick Tab Button to view Past Completed Winners */}
          <div className="flex items-center gap-2 w-full sm:w-auto self-start lg:self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchive(!showArchive)}
              className="w-full sm:w-auto rounded-xl text-xs font-bold border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 gap-1.5 justify-center py-2 sm:py-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              {showArchive ? "Return to Live Championship" : "View Past Contest Champions"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showArchive ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAST CONTEST WINNERS ARCHIVE ACCORDION
      ─────────────────────────────────────────────────────────────── */}
      {showArchive && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" /> Hall of Past Completed Champions
                </h3>
                <p className="text-xs text-slate-500">Official winners recorded from completed store contests.</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {completedContests.length} Past Contests
              </span>
            </div>

            {completedContests.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No past contests have been marked as completed yet. Once a contest finishes, verified winners will appear here!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {completedContests.map((c: any) => (
                  <div key={c._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate">{c.title}</span>
                      <span className="text-xs font-black text-emerald-600">₹{(c.prizePool || c.prizeAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5">
                      {(c.winners || c.prizes || []).slice(0, 3).map((w: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <div className="min-w-0">
                            <span className="font-semibold flex items-center gap-1.5 truncate">
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"} {w.user?.name || w.userName || w.prizeTitle || `Winner #${idx + 1}`}
                            </span>
                            {w.winningTickets && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block ml-6">
                                🎟️ Won with {w.winningTickets} tickets ({w.winProbability || 'Lucky Draw'})
                              </span>
                            )}
                          </div>
                          <span className="font-black text-indigo-600 dark:text-indigo-400 shrink-0">₹{(w.prize || w.amount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN 3-COLUMN CHAMPIONSHIP GRID
      ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ═════════════════════════════════════════════════════════
              COLUMN 1 (LEFT): COUNTDOWN, ARENA STATS, TACTICAL DASHBOARD
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3 space-y-6">

            {/* 1. Championship Countdown Card */}
            {timeLeft ? (
              <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
                <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" /> Contest Countdown
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
                      Live Running
                    </span>
                  </div>

                  {/* 4 Countdown Boxes */}
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                    <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-sm xs:text-base sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {String(timeLeft.days).padStart(2, "0")}
                      </p>
                      <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">Days</p>
                    </div>
                    <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-sm xs:text-base sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {String(timeLeft.hours).padStart(2, "0")}
                      </p>
                      <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">Hours</p>
                    </div>
                    <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-sm xs:text-base sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {String(timeLeft.minutes).padStart(2, "0")}
                      </p>
                      <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">Mins</p>
                    </div>
                    <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-sm xs:text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </p>
                      <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-extrabold uppercase text-emerald-500 tracking-wider mt-0.5">Secs</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> Contest Closes
                    </span>
                    <span className="text-slate-400">
                      {new Date(activeContest.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-3.5 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-500" /> Open Referral Leaderboard
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
                  Referral rankings update continuously. Every delivered order past the 7-day return period is automatically added.
                </p>
              </Card>
            )}

            {/* 2. Arena Cumulative Stats Card */}
            <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
              <CardContent className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Arena Cumulative Stats
                </span>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[8px] xs:text-[9px] font-extrabold uppercase text-slate-400">Prize Pool</span>
                    <p className="text-xs xs:text-sm sm:text-lg font-black text-amber-600 dark:text-amber-400 truncate">
                      ₹{totalArenaPrize.toLocaleString()}
                    </p>
                    <p className="text-[7px] xs:text-[8px] sm:text-[9px] text-slate-400 font-medium">Rewards</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] xs:text-[9px] font-extrabold uppercase text-slate-400">Verified Sales</span>
                    <p className="text-xs xs:text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {totalArenaShares}
                    </p>
                    <p className="text-[7px] xs:text-[8px] sm:text-[9px] text-emerald-600 font-bold">Orders</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] xs:text-[9px] font-extrabold uppercase text-slate-400">Contenders</span>
                    <p className="text-xs xs:text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {totalArenaContenders}
                    </p>
                    <p className="text-[7px] xs:text-[8px] sm:text-[9px] text-slate-400 font-medium">Ranked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Tactical Dashboard (Current User Card) */}
            {isAuthenticated ? (
              <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative group">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
                <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                  {/* User Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-xs shrink-0">
                        {(user?.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate">
                          {user?.name || "Account"}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Tactical Dashboard
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-xs shrink-0 ${
                      isUserRanked ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}>
                      RANK {userRankLabel}
                    </span>
                  </div>

                  {/* Metrics 2-column */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[8px] xs:text-[9px] font-extrabold uppercase text-slate-400 block truncate">
                        Your Verified Orders
                      </span>
                      <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {userVerifiedShares}
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[8px] xs:text-[9px] font-extrabold uppercase text-slate-400 block truncate">
                        Conversion Rate
                      </span>
                      <p className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {userConversionRate}%
                      </p>
                    </div>
                  </div>

                  {/* Contest Eligibility - No Minimum Required */}
                  <div className="space-y-1.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                      <span className="text-indigo-950 dark:text-indigo-200 flex items-center gap-1 font-extrabold">
                        <Zap className="w-3 h-3 text-amber-500" /> Contest Eligibility
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-[9px] sm:text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> No Minimum Orders Required
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 pt-0.5">
                      <span>Verified Orders: <strong className="text-slate-900 dark:text-white">{userVerifiedShares}</strong></span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">1 Order = 1 Lucky Draw Ticket</span>
                    </div>
                  </div>

                  {/* Lucky Draw Raffle Odds Badge */}
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                      <span className="text-amber-950 dark:text-amber-200 flex items-center gap-1 font-black">
                        <Dices className="w-3.5 h-3.5 text-amber-500" /> Lucky Draw Tickets
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-black text-xs">
                        {userTickets} Tickets ({userWinOdds}% Odds)
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      10 entries = 10x chance! Winners are picked randomly in the 1-Click Grand Draw.
                    </p>
                  </div>

                  {/* Personal Broadcast Link */}
                  {userShareCode && (
                    <div className="space-y-1 sm:space-y-1.5">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Your Personal Referral Link
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={referralUrl}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300 select-all focus:outline-none truncate"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(referralUrl)}
                          className="h-8 px-2 sm:px-2.5 rounded-xl text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shrink-0 gap-1"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden xs:inline">{copied ? "Copied" : "Copy"}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 1-Click Fast Blast Channels */}
                  <div className="space-y-1 sm:space-y-1.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      1-Click Fast Blast Channels
                    </span>
                    <div className="grid grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2">
                      <button
                        onClick={handleShareWhatsApp}
                        className="py-1.5 sm:py-2 px-1 rounded-xl text-[9px] xs:text-[10px] sm:text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-1 shadow-2xs transition-colors truncate"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">WhatsApp</span>
                      </button>
                      <button
                        onClick={handleShareTwitter}
                        className="py-1.5 sm:py-2 px-1 rounded-xl text-[9px] xs:text-[10px] sm:text-xs font-bold bg-[#14171A] hover:bg-black text-white flex items-center justify-center gap-1 shadow-2xs transition-colors truncate"
                      >
                        <Twitter className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">X/Tweet</span>
                      </button>
                      <button
                        onClick={handleShareStory}
                        className="py-1.5 sm:py-2 px-1 rounded-xl text-[9px] xs:text-[10px] sm:text-xs font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white flex items-center justify-center gap-1 shadow-2xs transition-opacity hover:opacity-90 truncate"
                      >
                        <Instagram className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">Story</span>
                      </button>
                    </div>
                  </div>

                  {/* Instant Viral Multiplier CTA */}
                  <Button
                    onClick={handleShareWhatsApp}
                    className="w-full rounded-xl sm:rounded-2xl py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    Share Link to Climb Rank
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                      Track Your Championship Rank
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Sign in to view your verified orders, track your distance to the leaderboard cutoff, and generate custom referral links.
                    </p>
                  </div>
                  <Link href="/login" className="block">
                    <Button className="w-full rounded-2xl py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" /> Sign In to Access Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════
              COLUMN 2 (CENTER): PODIUM LEADERS & CHAMPIONSHIP ROSTER
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6">

            {/* 1. Podium Leaders Card */}
            <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
              <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> Podium Leaders
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Audited
                  </span>
                </div>

                {/* If no participants in leaderboard yet */}
                {rawLeaderboard.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        No Podium Leaders Yet
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        The leaderboard is wide open! Be the first to share products, complete verified sales, and claim the #1 Crown Leader spot.
                      </p>
                    </div>
                    <Link href="/earn">
                      <Button size="sm" className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 mt-1">
                        Start Sharing Now <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  /* Real Podium Pillars */
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-2.5 items-end pt-3 sm:pt-4">
                    {/* Rank 2 */}
                    <div className="rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-4 text-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full mx-auto flex items-center justify-center font-black text-[10px] xs:text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        2
                      </div>
                      <h4 className="font-extrabold text-[11px] xs:text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight mt-1.5 sm:mt-2 truncate">
                        {top2?.userName || "Open Spot"}
                      </h4>
                      <div className="inline-flex items-center gap-0.5 xs:gap-1 px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] xs:text-[9px] sm:text-[10px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mt-1 shadow-2xs max-w-full">
                        <Share2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{top2?.totalOrders || top2?.totalPurchases || 0} Orders</span>
                      </div>
                      <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                        <p className="text-[9px] xs:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight truncate">
                          {top2 ? `₹${(top2.totalEarnings || top2.totalCommission || 0).toLocaleString()}` : "Claim #2"}
                        </p>
                      </div>
                    </div>

                    {/* Rank 1 (Crown Leader) */}
                    <div className="relative rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-4 text-center bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/10 border-2 border-amber-400 dark:border-amber-500 shadow-md sm:-mt-3 z-10">
                      <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase px-1.5 xs:px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap flex items-center gap-0.5 sm:gap-1">
                        <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-950" /> Crown Leader
                      </div>
                      <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full mx-auto flex items-center justify-center font-black text-[10px] xs:text-xs bg-amber-400 text-amber-950 shadow-sm mt-1">
                        1
                      </div>
                      <h4 className="font-extrabold text-[11px] xs:text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight mt-1.5 sm:mt-2 truncate">
                        {top1?.userName || "Open Spot"}
                      </h4>
                      <div className="inline-flex items-center gap-0.5 xs:gap-1 px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] xs:text-[9px] sm:text-[10px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mt-1 shadow-2xs max-w-full">
                        <Share2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{top1?.totalOrders || top1?.totalPurchases || 0} Orders</span>
                      </div>
                      <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                        <p className="text-[9px] xs:text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight truncate">
                          {top1 ? `₹${(top1.totalEarnings || top1.totalCommission || 0).toLocaleString()} Won` : "Claim #1"}
                        </p>
                      </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="rounded-xl sm:rounded-2xl p-2 xs:p-2.5 sm:p-4 text-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full mx-auto flex items-center justify-center font-black text-[10px] xs:text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                        3
                      </div>
                      <h4 className="font-extrabold text-[11px] xs:text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight mt-1.5 sm:mt-2 truncate">
                        {top3?.userName || "Open Spot"}
                      </h4>
                      <div className="inline-flex items-center gap-0.5 xs:gap-1 px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] xs:text-[9px] sm:text-[10px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mt-1 shadow-2xs max-w-full">
                        <Share2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{top3?.totalOrders || top3?.totalPurchases || 0} Orders</span>
                      </div>
                      <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                        <p className="text-[9px] xs:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight truncate">
                          {top3 ? `₹${(top3.totalEarnings || top3.totalCommission || 0).toLocaleString()}` : "Claim #3"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Championship Roster (#4 - #10 Threshold) */}
            <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Championship Roster (#4 - #10)
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Verified Sales
                  </span>
                </div>

                {/* Table of Roster Rows */}
                {roster.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-xs text-slate-500 space-y-1.5">
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Ranks #4 to #10 are Currently Open!
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Any affiliate who completes a verified customer order will appear here and lock in a Top 10 ranking.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {roster.map((row: any) => (
                      <div
                        key={row.rank}
                        className={`px-3 xs:px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 transition-colors ${
                          row.isCutoff
                            ? "bg-amber-500/10 dark:bg-amber-500/15 border-l-4 border-l-amber-500"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-950/40"
                        }`}
                      >
                        {/* Left: Rank & Avatar & Name */}
                        <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 w-4 sm:w-5 shrink-0">
                            {String(row.rank).padStart(2, "0")}
                          </span>

                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-700 dark:text-slate-300 shrink-0">
                            {row.initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <p className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[180px] md:max-w-none">
                                {row.name}
                              </p>
                              {row.isCutoff && (
                                <span className="px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[7px] xs:text-[8px] font-black bg-amber-500 text-amber-950 uppercase shrink-0">
                                  Cutoff
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate max-w-[95px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-none">
                              {row.tier}
                            </p>
                          </div>
                        </div>

                        {/* Right: Earnings & Share count */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{row.earnings.toLocaleString()}
                          </span>

                          <div className="text-right min-w-[40px] sm:min-w-[50px]">
                            <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white">
                              {row.shares}
                            </p>
                            <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium">orders</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Boundary Line Indicator */}
                <div className="bg-slate-100 dark:bg-slate-950/90 px-3 sm:px-4 py-1.5 sm:py-2 text-center border-y border-dashed border-slate-300 dark:border-slate-800">
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Verified Order Boundary (Orders count past 7-day return period)
                  </span>
                </div>

                {/* Sticky Current User Rank Bar (if user is authenticated) */}
                {isAuthenticated && (
                  <div className="p-2.5 sm:p-4 bg-[#0d0e26] text-white flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                      <span className="text-[10px] sm:text-xs font-mono font-black text-amber-400 w-5 sm:w-6 shrink-0">
                        {userRankLabel}
                      </span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-950 shrink-0">
                        {(user?.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-[11px] sm:text-xs truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
                          {user?.name} <span className="opacity-70 text-[9px] sm:text-[10px]">(You)</span>
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-300 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                          {userVerifiedShares > 0
                            ? `${userTickets} Lucky Draw Tickets • Eligible`
                            : "Share & Earn Lucky Draw Tickets (No min required)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-[11px] sm:text-xs text-white">{userVerifiedShares}</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 block leading-tight">orders</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleShareWhatsApp}
                        className="rounded-lg sm:rounded-xl h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black gap-1 shadow-xs"
                      >
                        Invite <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ═════════════════════════════════════════════════════════
              COLUMN 3 (RIGHT): TOURNAMENT VAULT & SHARE SIMULATOR
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Tournament Vault Card */}
            <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Tournament Vault
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Contest Rewards
                  </span>
                </div>

                {/* If active contest has dynamic prizes created by admin */}
                {activeContest?.prizes && activeContest.prizes.length > 0 ? (
                  <div className="space-y-2.5 sm:space-y-3">
                    {/* Grand Champion Card */}
                    {activeContest.prizes[0] && (
                      <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0d0e26] text-white p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-400 text-amber-950 text-[8px] sm:text-[9px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs">
                            Rank 1 Grand Champion
                          </span>
                          <span className="text-base sm:text-lg font-black text-amber-400">
                            ₹{activeContest.prizes[0].amount?.toLocaleString()}
                          </span>
                        </div>

                        {activeContest.prizes[0].prizeImage && (
                          <div className="h-32 sm:h-40 w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-900">
                            <img
                              src={activeContest.prizes[0].prizeImage}
                              alt={activeContest.prizes[0].title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-white uppercase">
                            {activeContest.prizes[0].title}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
                            Highest qualified referrer at the end of the competition.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Additional Rank Prizes */}
                    <div className="space-y-1.5 sm:space-y-2 text-xs">
                      {activeContest.prizes.slice(1).map((p: any) => (
                        <div key={p.rank} className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-[9px] sm:text-[10px] shrink-0">
                              #{p.rank}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">{p.title}</p>
                              <p className="text-[8px] sm:text-[9px] text-slate-400">Rank #{p.rank} Reward</p>
                            </div>
                          </div>
                          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white shrink-0">
                            ₹{p.amount?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard Arena Rules & Perks when no dynamic prize array */
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                        {activeContest?.title || "Store Share Program"}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                        ₹{totalArenaPrize.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {activeContest?.description || "Earn ongoing cash commissions directly to your wallet on every verified referred purchase."}
                    </p>
                  </div>
                )}

                {/* Included Perks Checklist */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 sm:space-y-1.5 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Store Affiliate Rules & Guarantees:
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Verified delivered orders past 7-day window
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Direct wallet payout upon contest completion
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Lifetime tracking across all referral links
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Lucky Draw Win Chance Simulator Card */}
            <Card className="rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
              <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Dices className="w-3.5 h-3.5 text-amber-500" /> Win Chance Simulator
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    +{simulatorShares} Extra Tickets
                  </span>
                </div>

                {/* Interactive Slider */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] sm:text-xs">Simulate Extra Orders / Shares:</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                      +{simulatorShares} Orders
                    </span>
                  </div>

                  <Slider
                    defaultValue={[5]}
                    value={[simulatorShares]}
                    min={1}
                    max={25}
                    step={1}
                    onValueChange={(val) => setSimulatorShares(val[0])}
                    className="py-1 sm:py-2"
                  />
                </div>

                {/* Simulator Prediction Result */}
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                  <div className="flex items-center justify-between font-bold text-[10px] sm:text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Total Simulated Tickets:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-black">{projectedShares} Lucky Draw Tickets</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-[10px] sm:text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Estimated Win Odds:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">~{projectedWinOdds}% Chance</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] pt-1.5 border-t border-amber-200/50 dark:border-amber-800/40 text-slate-600 dark:text-slate-400 leading-snug">
                    Agar aap <strong className="text-amber-600 dark:text-amber-400 font-black">+{simulatorShares} orders</strong> refer karte hain, toh aapke paas kul <strong className="text-slate-900 dark:text-white font-black">{projectedShares} Lucky Draw Tickets</strong> ho jayenge. Random draw me aapke jeetne ke chances <strong className="text-amber-600 dark:text-amber-400 font-black">{projectedShares}x guna</strong> badh jayenge! (Koi min order zaroori nahi).
                  </p>
                </div>

                {/* Execute CTA */}
                <Button
                  onClick={handleShareWhatsApp}
                  className="w-full rounded-xl sm:rounded-2xl py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Share & Multiply Winning Chances
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
