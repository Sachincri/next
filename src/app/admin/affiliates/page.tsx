"use client";

import React, { useState } from "react";
import {
  useGetAdminAffiliateOverviewQuery,
  useGetAdminWalletsQuery,
  useGetAdminTransactionsQuery,
  useGetContestsQuery,
  useCreateContestMutation,
  useCompleteContestMutation,
  useLazyGetContestDrawPreviewQuery,
  useToggleWalletFreezeMutation,
  useAdminWalletAdjustMutation,
} from "@/redux/api/shareApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import {
  Wallet,
  TrendingUp,
  Trophy,
  Users,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Loader2,
  RefreshCw,
  Lock,
  Unlock,
  SlidersHorizontal,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  X,
  Dices,
  Shuffle,
  Crown,
  Gift,
  CheckCircle2,
} from "lucide-react";

// Image compression helper to convert selected File to lightweight optimized WebP data URL
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function AdminAffiliatesPage() {
  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states for Contest creation
  const [contestTitle, setContestTitle] = useState("");
  const [contestDesc, setContestDesc] = useState("");
  const [prizePool, setPrizePool] = useState("10500");
  const [minThreshold, setMinThreshold] = useState("2000");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [winnerCount, setWinnerCount] = useState<number>(3);
  const [prizes, setPrizes] = useState<Array<{ rank: number; title: string; amount: number; prizeImage: string }>>([
    { rank: 1, title: "", amount: 5000, prizeImage: "" },
    { rank: 2, title: "", amount: 3000, prizeImage: "" },
    { rank: 3, title: "", amount: 1500, prizeImage: "" },
  ]);

  const handleWinnerCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(10, count));
    setWinnerCount(newCount);
    setPrizes((prev) => {
      const updated = [...prev];
      if (newCount > updated.length) {
        for (let i = updated.length; i < newCount; i++) {
          updated.push({
            rank: i + 1,
            title: `Rank ${i + 1} Reward`,
            amount: 1000,
            prizeImage: "",
          });
        }
      } else {
        return updated.slice(0, newCount);
      }
      return updated;
    });
  };

  const handlePrizeChange = (index: number, field: string, value: any) => {
    setPrizes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePrizeImageFile = async (index: number, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size exceeds 10MB");
      return;
    }

    const toastId = toast.loading("Processing selected image...");
    try {
      const compressed = await compressImage(file);
      handlePrizeChange(index, "prizeImage", compressed);
      toast.dismiss(toastId);
      toast.success("Prize image loaded successfully!");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to read image file");
    }
  };

  // Form states for Wallet Balance Adjust
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const { data: overviewData, isLoading: isOverviewLoading, refetch: refetchOverview } = useGetAdminAffiliateOverviewQuery();
  const { data: walletsData, isLoading: isWalletsLoading, refetch: refetchWallets } = useGetAdminWalletsQuery();
  const { data: txData, isLoading: isTxLoading } = useGetAdminTransactionsQuery();
  const { data: contestsData, refetch: refetchContests } = useGetContestsQuery();

  const [createContest, { isLoading: isCreatingContest }] = useCreateContestMutation();
  const [completeContest, { isLoading: isCompletingContest }] = useCompleteContestMutation();
  const [toggleFreeze] = useToggleWalletFreezeMutation();
  const [adjustWallet, { isLoading: isAdjusting }] = useAdminWalletAdjustMutation();

  // Lucky Draw Modal states
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [selectedContestForDraw, setSelectedContestForDraw] = useState<any>(null);
  const [drawMethodChoice, setDrawMethodChoice] = useState<"weighted_random" | "leaderboard">("weighted_random");
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawnWinnersResult, setDrawnWinnersResult] = useState<any[] | null>(null);

  const [triggerDrawPreview, { data: drawPreviewData, isLoading: isPreviewLoading }] = useLazyGetContestDrawPreviewQuery();

  const handleOpenDrawModal = (contest: any) => {
    setSelectedContestForDraw(contest);
    setDrawnWinnersResult(null);
    setIsDrawModalOpen(true);
    triggerDrawPreview(contest._id);
  };

  const handleExecuteDraw = async () => {
    if (!selectedContestForDraw) return;
    setIsSpinning(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const res = await completeContest({
        contestId: selectedContestForDraw._id,
        method: drawMethodChoice,
      }).unwrap();

      setDrawnWinnersResult(res.data?.winners || []);
      toast.success(res.message || "1-Click Lucky Draw Complete! Winners have been rewarded.");
      refetchContests();
      refetchWallets();
      refetchOverview();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to execute random draw");
    } finally {
      setIsSpinning(false);
    }
  };

  const overview = overviewData?.data || {};
  const wallets = walletsData?.data?.wallets || [];
  const transactions = txData?.data?.transactions || [];
  const contests = contestsData?.data?.contests || [];

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestTitle.trim()) {
      toast.error("Please enter a contest title.");
      return;
    }

    const totalPrizeAmount = prizes.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    try {
      await createContest({
        title: contestTitle.trim(),
        description: contestDesc.trim(),
        winnerCount,
        prizes,
        prizeAmount: totalPrizeAmount > 0 ? totalPrizeAmount : (Number(prizePool) || 5000),
        targetOrders: 50,
        minPurchaseAmount: minThreshold.trim() !== "" ? Number(minThreshold) : 2000,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }).unwrap();

      toast.success("Affiliate Contest with winner prizes launched successfully!");
      setIsContestModalOpen(false);
      setContestTitle("");
      setContestDesc("");
      refetchContests();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create contest");
    }
  };

  const handleCompleteContest = async (id: string) => {
    if (!confirm("Are you sure you want to end this contest and distribute rewards to top partners?")) return;
    try {
      await completeContest(id).unwrap();
      toast.success("Contest finalized and winners credited!");
      refetchContests();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to complete contest");
    }
  };

  const handleToggleFreeze = async (userId: string, isFrozen: boolean) => {
    try {
      await toggleFreeze({ userId, reason: isFrozen ? "Unfrozen by admin" : "Suspicious activity freeze" }).unwrap();
      toast.success(isFrozen ? "Wallet unfrozen" : "Wallet frozen");
      refetchWallets();
    } catch (err: any) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount || Number(adjustAmount) <= 0) {
      toast.error("Please enter a valid adjustment amount.");
      return;
    }

    try {
      await adjustWallet({
        userId: selectedUser._id || selectedUser.user?._id || selectedUser.user,
        type: adjustType,
        amount: Number(adjustAmount),
        description: adjustReason || `Admin manual ${adjustType}`,
      }).unwrap();

      toast.success(`Wallet successfully ${adjustType}ed!`);
      setIsAdjustModalOpen(false);
      setAdjustAmount("");
      setAdjustReason("");
      refetchWallets();
      refetchOverview();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to adjust balance");
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Affiliates, Wallets & Contests
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Manage partner commissions, customer wallet ledger, contests with ₹2,000 threshold, and fraud controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsContestModalOpen(true)}
            className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Launch New Contest
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchOverview();
              refetchWallets();
            }}
            className="rounded-xl text-xs gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs text-slate-500 flex items-center justify-between">
              Total Customer Wallets
              <Users className="w-4 h-4 text-indigo-500" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {isOverviewLoading ? "..." : overview.totalWallets || wallets.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active customer balances</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs text-slate-500 flex items-center justify-between">
              Total Circulating Wallet Balance
              <Wallet className="w-4 h-4 text-emerald-500" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{(overview.totalCirculatingBalance || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Includes affiliate & dispute refunds</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs text-slate-500 flex items-center justify-between">
              Total Affiliate Commission Paid
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{(overview.totalCommissionPaid || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Delivered orders with ₹2,000+ spend</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <span className="text-xs text-slate-500 flex items-center justify-between">
              Pending Commissions
              <ShieldAlert className="w-4 h-4 text-orange-500" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
              ₹{(overview.totalPendingCommission || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Holding during return windows</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl">
          <TabsTrigger value="wallets" className="rounded-xl text-xs font-semibold gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Customer Wallets ({wallets.length})
          </TabsTrigger>
          <TabsTrigger value="contests" className="rounded-xl text-xs font-semibold gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Affiliate Contests ({contests.length})
          </TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-xl text-xs font-semibold gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> System Transactions Ledger
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Wallets */}
        <TabsContent value="wallets">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="p-3.5 pl-5">Customer</th>
                    <th className="p-3.5">Available Balance</th>
                    <th className="p-3.5">Lifetime Earnings</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {isWalletsLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 m-auto" />
                      </td>
                    </tr>
                  ) : wallets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No customer wallets found.
                      </td>
                    </tr>
                  ) : (
                    wallets.map((w: any) => {
                      const user = w.user || {};
                      return (
                        <tr key={w._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="p-3.5 pl-5">
                            <p className="font-bold text-slate-900 dark:text-white">{user.name || "Customer"}</p>
                            <p className="text-[10px] text-slate-400">{user.email || user.phone || "-"}</p>
                          </td>

                          <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            ₹{w.balance?.toLocaleString()}
                          </td>

                          <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                            ₹{w.lifetimeEarnings?.toLocaleString()}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${w.isFrozen
                                  ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30"
                                  : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                }`}
                            >
                              {w.isFrozen ? "Frozen" : "Active"}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-400">
                            {new Date(w.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </td>

                          <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsAdjustModalOpen(true);
                                }}
                                className="h-7 px-2 text-xs rounded-lg gap-1"
                              >
                                <SlidersHorizontal className="w-3 h-3" /> Adjust
                              </Button>

                              <Button
                                size="sm"
                                variant={w.isFrozen ? "default" : "destructive"}
                                onClick={() => handleToggleFreeze(user._id || user, w.isFrozen)}
                                className="h-7 px-2 text-xs rounded-lg gap-1"
                              >
                                {w.isFrozen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {w.isFrozen ? "Unfreeze" : "Freeze"}
                              </Button>
                            </div>
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

        {/* TAB 2: Contests */}
        <TabsContent value="contests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contests.map((c: any) => (
              <Card key={c._id} className="rounded-2xl border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${c.status === "active"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Total Prizes</span>
                    <p className="font-extrabold text-indigo-600 dark:text-indigo-400">₹{(c.prizeAmount || c.prizePool)?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Winners</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{c.winnerCount || c.prizes?.length || 1} Winners</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Min Threshold</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">₹{c.minPurchaseAmount || c.minPurchaseThreshold || 2000}</p>
                  </div>
                </div>

                {/* Winner Prizes Showcase */}
                {c.prizes && c.prizes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rank-wise Winner Rewards:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      {c.prizes.map((p: any) => (
                        <div key={p.rank} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                          {p.prizeImage ? (
                            <img src={p.prizeImage} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                              #{p.rank}
                            </div>
                          )}
                          <div className="min-w-0 flex-1 text-[11px]">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {p.rank === 1 ? "🥇 " : p.rank === 2 ? "🥈 " : p.rank === 3 ? "🥉 " : `#${p.rank} `}
                              {p.title}
                            </p>
                            <p className="font-black text-indigo-600 dark:text-indigo-400 text-[10px]">₹{p.amount?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Contest: 1-Click Random Draw Action */}
                {c.status === "active" && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                        <Dices className="w-3.5 h-3.5 text-amber-500" />
                        Lucky Draw Pool: <strong className="text-slate-800 dark:text-slate-200">{c.totalQualifiedOrders || (c.entries ? c.entries.reduce((s: number, e: any) => s + (e.qualifiedOrders || 0), 0) : 0)} Tickets</strong> ({c.entries?.length || 0} Contenders)
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOpenDrawModal(c)}
                      className="w-full rounded-xl text-xs py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-sm flex items-center justify-center gap-2"
                    >
                      <Dices className="w-4 h-4 animate-bounce" />
                      🎲 1-Click Draw Random Winners (Weighted Lucky Draw)
                    </Button>
                  </div>
                )}

                {/* Completed Contest: Official Winners Showcase */}
                {c.status === "completed" && c.winners && c.winners.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" /> Official Random Draw Winners:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {c.winners.map((w: any, widx: number) => (
                        <div key={widx} className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : "🥉"}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {w.user?.name || w.userName || `Winner #${w.rank}`}
                              </p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                                {w.prizeTitle || `Rank #${w.rank} Prize`} • 🎟️ {w.winningTickets || 1} Tickets ({w.winProbability || "Random Draw"})
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-xs text-emerald-700 dark:text-emerald-300 shrink-0">
                            ₹{w.prize?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: Transactions */}
        <TabsContent value="ledger">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="p-3.5 pl-5">Date</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Type & Description</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Balance After</th>
                    <th className="p-3.5 pr-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {transactions.map((tx: any) => {
                    const isCredit = ["commission", "refund", "credit", "admin_credit", "bonus", "contest_reward", "contest_prize"].includes(tx.type) && tx.amount >= 0;
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="p-3.5 pl-5 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {tx.user?.name || "Customer"}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {tx.type.replace(/_/g, " ")}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{tx.description}</p>
                        </td>
                        <td className={`p-3.5 font-black ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                          {isCredit ? "+" : "-"}₹{Math.abs(tx.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">₹{tx.balanceAfter?.toLocaleString() || "-"}</td>
                        <td className="p-3.5 pr-5">
                          <span className="text-emerald-600 font-semibold">{tx.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contest Create Modal */}
      <Dialog open={isContestModalOpen} onOpenChange={setIsContestModalOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" /> Create Affiliate Sales Contest with Dynamic Prizes
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-slate-500">
              Configure contest duration, minimum order value, winner positions, and select custom prize photos directly from your device.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContest} className="space-y-4 sm:space-y-5 mt-3 sm:mt-4 text-xs">
            {/* Top Grid: Contest Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="space-y-3">
                <div>
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Contest Title *</Label>
                  <Input
                    placeholder="e.g. IPL Mega Affiliate Championship"
                    value={contestTitle}
                    onChange={(e) => setContestTitle(e.target.value)}
                    className="mt-1 text-xs rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Description</Label>
                  <Textarea
                    rows={3}
                    placeholder="Explain contest rules, minimum verified orders, delivery policy, etc."
                    value={contestDesc}
                    onChange={(e) => setContestDesc(e.target.value)}
                    className="mt-1 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">Min Purchase Threshold per Order (₹)</Label>
                  <Input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    className="mt-1 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Minimum order value required to qualify for contest.</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 text-xs rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Number of Winners Selector */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                <div>
                  <Label className="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">Number of Winner Positions</Label>
                  <p className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400">Select how many prize positions to award (1 to 10)</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleWinnerCountChange(num)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition-colors ${winnerCount === num
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {num} {num === 1 ? "Winner" : "Winners"}
                    </button>
                  ))}
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={winnerCount}
                    onChange={(e) => handleWinnerCountChange(Number(e.target.value) || 1)}
                    className="w-14 sm:w-16 h-7 sm:h-8 text-center text-xs rounded-lg sm:rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Prize Fields per Winner Position (Spacious Grid) */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" /> Winner Prizes ({winnerCount} positions)
                </span>
                <span className="text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400">
                  Total Prize Value: ₹{prizes.reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[50vh] overflow-y-auto pr-1 pb-1">
                {prizes.map((prize, idx) => (
                  <div
                    key={prize.rank}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 relative group"
                  >
                    {/* Header with Rank & Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-extrabold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white">
                        {idx === 0 ? "🥇 Rank 1 (Grand Champion)" : idx === 1 ? "🥈 Rank 2 (Runner-Up)" : idx === 2 ? "🥉 Rank 3 (3rd Place)" : `🎖️ Rank ${prize.rank} Position`}
                      </span>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            handlePrizeChange(idx, "title", "English Willow Cricket Bat");
                            handlePrizeChange(idx, "amount", 6000);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold"
                        >
                          🏏 Bat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handlePrizeChange(idx, "title", "Smart Watch Pro");
                            handlePrizeChange(idx, "amount", 3000);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold"
                        >
                          ⌚ Watch
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handlePrizeChange(idx, "title", "Cash Reward");
                            handlePrizeChange(idx, "amount", 1500);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-semibold"
                        >
                          💰 Cash
                        </button>
                      </div>
                    </div>

                    {/* Title & Amount Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prize Title *</Label>
                        <Input
                          placeholder="e.g. SG Player Edition Cricket Bat"
                          value={prize.title}
                          onChange={(e) => handlePrizeChange(idx, "title", e.target.value)}
                          className="mt-1 h-9 text-xs rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reward (₹) *</Label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={prize.amount}
                          onChange={(e) => handlePrizeChange(idx, "amount", Number(e.target.value) || 0)}
                          className="mt-1 h-9 text-xs rounded-xl font-bold"
                          required
                        />
                      </div>
                    </div>

                    {/* Image Select Form (File Upload / Preview) */}
                    <div>
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Prize Image (Select from Device)
                      </Label>

                      {prize.prizeImage ? (
                        <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <img
                            src={prize.prizeImage}
                            alt="Prize Preview"
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              ✓ Image Selected
                            </p>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <label className="cursor-pointer px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 flex items-center gap-1">
                                <Upload className="w-3 h-3" /> Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePrizeImageFile(idx, e.target.files?.[0])}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handlePrizeChange(idx, "prizeImage", "")}
                                className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50 hover:bg-indigo-50/40 text-slate-600 dark:text-slate-300">
                          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                            Click to Select Image from Device
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400">
                            PNG, JPG or WebP (Auto-optimized)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePrizeImageFile(idx, e.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isCreatingContest}
              className="w-full rounded-2xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 shadow-lg shadow-indigo-600/20"
            >
              {isCreatingContest ? "Publishing Contest..." : `Publish Contest with ${winnerCount} Winners`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wallet Balance Adjust Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-500" /> Adjust User Wallet
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Manual credit or debit adjustment for user: <strong>{selectedUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdjustSubmit} className="space-y-4 mt-3 text-xs">
            <div>
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Adjustment Type</Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setAdjustType("credit")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${adjustType === "credit"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  Credit (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("debit")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${adjustType === "debit"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  Debit (-)
                </button>
              </div>
            </div>

            <div>
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div>
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Reason / Description *</Label>
              <Input
                placeholder="e.g. Goodwill bonus / contest winner bonus"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isAdjusting}
              className="w-full rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {isAdjusting ? "Executing..." : "Apply Adjustment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═════════════════════════════════════════════════════════
          1-CLICK RANDOM WINNER LUCKY DRAW MODAL
      ══════════════════════════════════════════════════════════ */}
      <Dialog open={isDrawModalOpen} onOpenChange={setIsDrawModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Dices className="w-5 h-5 text-amber-500 animate-spin" /> 1-Click Random Winner Lucky Draw
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Transparent weighted raffle draw: Every verified order equals <strong>1 Lucky Draw Ticket</strong>. If a user has 10 entries, they get <strong>10x higher odds of winning</strong>, but <strong>any contender can win randomly</strong>!
            </DialogDescription>
          </DialogHeader>

          {/* If winners were just drawn, show celebration result */}
          {drawnWinnersResult && drawnWinnersResult.length > 0 ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-transparent border-2 border-amber-400 dark:border-amber-500 text-center space-y-1">
                <span className="text-3xl">🎉</span>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Lucky Draw Successfully Executed!
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {drawnWinnersResult.length} Random Winners selected and wallet prizes automatically distributed!
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Official Drawn Champions:
                </span>
                <div className="space-y-2">
                  {drawnWinnersResult.map((w: any) => (
                    <div
                      key={w.rank}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">
                          {w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : w.rank === 3 ? "🥉" : `🎖️ #${w.rank}`}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black text-xs text-slate-900 dark:text-white truncate">
                            {w.userName || "Winner"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {w.prizeTitle || `Rank #${w.rank} Prize`} • 🎟️ Won with {w.winningTickets || 1} tickets ({w.winProbability || "Random Draw"})
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹{w.prize?.toLocaleString()}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Credited</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setIsDrawModalOpen(false)}
                className="w-full rounded-2xl py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
              >
                Close & Return to Contests
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2 text-xs">
              {/* Contest Overview Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Target Contest</span>
                  <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-200">
                    {selectedContestForDraw?.title}
                  </h4>
                  <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400">
                    {selectedContestForDraw?.winnerCount || 1} Winner Position(s) to be awarded
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Prize Pool</span>
                  <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    ₹{(selectedContestForDraw?.prizeAmount || selectedContestForDraw?.prizePool)?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Draw Mode Switch */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Winner Selection Mode
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawMethodChoice("weighted_random")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${drawMethodChoice === "weighted_random"
                        ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    <p className="font-black text-xs flex items-center gap-1.5">
                      <Dices className="w-3.5 h-3.5 text-amber-500" /> Weighted Lucky Draw
                    </p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      10 shares = 10x chance. Anyone can win randomly!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawMethodChoice("leaderboard")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${drawMethodChoice === "leaderboard"
                        ? "bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    <p className="font-black text-xs flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-indigo-500" /> Strict Top Referrers
                    </p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      Strictly highest verified orders rank #1, #2, #3
                    </p>
                  </button>
                </div>
              </div>

              {/* Live Ticket Pool & Odds Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Shuffle className="w-3.5 h-3.5 text-emerald-500" />
                    Eligible Contenders Pool ({drawPreviewData?.data?.participantCount || 0} participants)
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Total: {drawPreviewData?.data?.totalTickets || 0} Tickets in Pot
                  </span>
                </div>

                {isPreviewLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 m-auto" />
                    <p className="text-xs text-slate-400 mt-2">Calculating live ticket pool & win odds...</p>
                  </div>
                ) : !drawPreviewData?.data?.participants || drawPreviewData.data.participants.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      No Qualifying Contenders Yet
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Participants need at least 1 verified delivered order to earn a lucky draw ticket. Once an order qualifies, they will automatically appear here!
                    </p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {drawPreviewData.data.participants.map((p: any, idx: number) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                            {(p.userName || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {p.userName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.qualifiedOrders} orders (₹{p.qualifiedRevenue?.toLocaleString()})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            🎟️ {p.tickets} {p.tickets === 1 ? "Ticket" : "Tickets"}
                          </span>
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 w-16 text-right">
                            {p.winProbability}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 1-Click Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handleExecuteDraw}
                  disabled={isSpinning || isPreviewLoading || !drawPreviewData?.data?.participants?.length}
                  className="w-full rounded-2xl py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  {isSpinning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      🎰 Rolling Lottery Wheel & Picking Winners...
                    </>
                  ) : (
                    <>
                      <Dices className="w-5 h-5" />
                      🎰 Execute 1-Click Random Draw & Credit Winners
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-slate-400 mt-1.5">
                  1-Click action immediately draws winners, assigns prizes, and credits winner wallets.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

