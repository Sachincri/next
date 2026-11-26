"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    useGetCouponsQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
} from "@/redux/api/adminApi";
import {
    Plus,
    Trash2,
    Ticket,
    Calendar,
    Search,
    Loader2,
    Copy,
    Check,
    Pencil,
    TrendingUp,
    PauseCircle,
    CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";

type CouponStatus = "active" | "paused" | "expired";
type StatusFilter = "all" | CouponStatus;

interface CouponFormState {
    code: string;
    discountType: "percentage" | "fixed";
    discountAmount: string;
    expiryDate: string;
    usageLimit: string;
    minPurchaseAmount: string;
    isActive: boolean;
}

const INITIAL_FORM_STATE: CouponFormState = {
    code: "",
    discountType: "percentage",
    discountAmount: "",
    expiryDate: "",
    usageLimit: "",
    minPurchaseAmount: "0",
    isActive: true,
};

function getCouponStatus(coupon: any, referenceDate = new Date()): CouponStatus {
    const isExpired = coupon?.expiryDate ? new Date(coupon.expiryDate) < referenceDate : false;
    if (isExpired) return "expired";
    return coupon?.isActive ? "active" : "paused";
}

function formatDateInputValue(dateValue?: string | Date): string {
    if (!dateValue) return "";
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().split("T")[0];
}

export default function CouponsPage() {
    const { data: coupons = [], isLoading, refetch } = useGetCouponsQuery();
    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
    const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
    const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
    const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [formData, setFormData] = useState<CouponFormState>(INITIAL_FORM_STATE);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    const isSubmitting = isCreating || isUpdating;
    const todayInputMin = new Date().toISOString().split("T")[0];

    const stats = useMemo(() => {
        const now = new Date();
        let activeCount = 0;
        let pausedCount = 0;
        let expiredCount = 0;
        let totalRedemptions = 0;

        for (const coupon of coupons) {
            const status = getCouponStatus(coupon, now);
            if (status === "active") activeCount += 1;
            else if (status === "paused") pausedCount += 1;
            else expiredCount += 1;

            totalRedemptions += Number(coupon?.usedCount) || 0;
        }

        return {
            totalCount: coupons.length,
            activeCount,
            pausedCount,
            expiredCount,
            inactiveOrExpiredCount: pausedCount + expiredCount,
            totalRedemptions,
        };
    }, [coupons]);

    const filteredCoupons = useMemo(() => {
        const now = new Date();
        const query = search.trim().toLowerCase();

        return coupons.filter((coupon: any) => {
            const matchesSearch =
                !query ||
                String(coupon?.code || "")
                    .toLowerCase()
                    .includes(query);
            if (!matchesSearch) return false;

            if (statusFilter === "all") return true;
            return getCouponStatus(coupon, now) === statusFilter;
        });
    }, [coupons, search, statusFilter]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: "percentage" | "fixed") => {
        setFormData((prev) => ({ ...prev, discountType: value }));
    };

    const openCreateDialog = () => {
        setEditingCoupon(null);
        setFormData(INITIAL_FORM_STATE);
        setIsDialogOpen(true);
    };

    const openEditDialog = (coupon: any) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code || "",
            discountType: coupon.discountType === "fixed" ? "fixed" : "percentage",
            discountAmount:
                coupon.discountAmount !== undefined && coupon.discountAmount !== null
                    ? String(coupon.discountAmount)
                    : "",
            expiryDate: formatDateInputValue(coupon.expiryDate),
            usageLimit:
                coupon.usageLimit !== undefined && coupon.usageLimit !== null
                    ? String(coupon.usageLimit)
                    : "",
            minPurchaseAmount:
                coupon.minPurchaseAmount !== undefined && coupon.minPurchaseAmount !== null
                    ? String(coupon.minPurchaseAmount)
                    : "0",
            isActive: Boolean(coupon.isActive),
        });
        setIsDialogOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCoupon(null);
            setFormData(INITIAL_FORM_STATE);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCode = formData.code.trim().toUpperCase();

        if (!trimmedCode || formData.discountAmount === "" || !formData.expiryDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        const parsedAmount = Number(formData.discountAmount);
        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            toast.error("Please enter a valid non-negative discount value");
            return;
        }

        if (formData.discountType === "percentage" && parsedAmount > 100) {
            toast.error("Percentage discount cannot exceed 100%");
            return;
        }

        const parsedMinPurchase = Number(formData.minPurchaseAmount || 0);
        if (!Number.isFinite(parsedMinPurchase) || parsedMinPurchase < 0) {
            toast.error("Minimum purchase amount cannot be negative");
            return;
        }

        const parsedUsageLimit = formData.usageLimit.trim()
            ? Number(formData.usageLimit)
            : null;
        if (parsedUsageLimit !== null && (!Number.isInteger(parsedUsageLimit) || parsedUsageLimit < 1)) {
            toast.error("Usage limit must be at least 1 or left blank for unlimited");
            return;
        }

        const payload = {
            code: trimmedCode,
            discountType: formData.discountType,
            discountAmount: parsedAmount,
            expiryDate: formData.expiryDate,
            usageLimit: parsedUsageLimit,
            minPurchaseAmount: parsedMinPurchase,
            ...(editingCoupon ? { isActive: formData.isActive } : {}),
        };

        try {
            if (editingCoupon) {
                await updateCoupon({ id: editingCoupon._id, data: payload }).unwrap();
                toast.success("Coupon updated successfully");
            } else {
                await createCoupon(payload).unwrap();
                toast.success("Coupon created successfully");
            }
            handleDialogOpenChange(false);
            refetch();
        } catch (error: any) {
            toast.error(
                error?.data?.message ||
                    (editingCoupon ? "Failed to update coupon" : "Failed to create coupon")
            );
        }
    };

    const handleCopyCode = async (coupon: any) => {
        const code = String(coupon?.code || "");
        if (!code) return;

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = code;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setCopiedId(coupon._id);
            toast.success(`Copied ${code}`);
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = setTimeout(() => {
                setCopiedId((current) => (current === coupon._id ? null : current));
            }, 1800);
        } catch {
            toast.error("Failed to copy coupon code");
        }
    };

    const handleToggleActive = async (coupon: any, nextActive: boolean) => {
        if (!coupon?._id || togglingId === coupon._id) return;

        setTogglingId(coupon._id);
        try {
            await updateCoupon({
                id: coupon._id,
                data: { isActive: nextActive },
            }).unwrap();
            toast.success(`${coupon.code} ${nextActive ? "activated" : "paused"}`);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update coupon status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCoupon(id).unwrap();
            toast.success("Coupon deleted successfully");
            setCouponToDelete(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete coupon");
        }
    };

    const filterOptions: { value: StatusFilter; label: string; count: number }[] = [
        { value: "all", label: "All", count: stats.totalCount },
        { value: "active", label: "Active", count: stats.activeCount },
        { value: "paused", label: "Paused", count: stats.pausedCount },
        { value: "expired", label: "Expired", count: stats.expiredCount },
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                        <p className="text-muted-foreground">
                            Manage discount coupons, usage caps, and promotions
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Create Coupon
                    </Button>
                </div>

                {/* Top KPI Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-xs flex items-center justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Active Coupons
                            </p>
                            <p className="text-2xl font-bold tabular-nums">
                                {isLoading ? "—" : stats.activeCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Live &amp; redeemable at checkout
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-xs flex items-center justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Redemptions
                            </p>
                            <p className="text-2xl font-bold tabular-nums">
                                {isLoading ? "—" : stats.totalRedemptions.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Across {stats.totalCount} total coupon{stats.totalCount === 1 ? "" : "s"}
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-xs flex items-center justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Expired / Paused
                            </p>
                            <p className="text-2xl font-bold tabular-nums">
                                {isLoading ? "—" : stats.inactiveOrExpiredCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isLoading
                                    ? "Loading status..."
                                    : `${stats.pausedCount} paused · ${stats.expiredCount} expired`}
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <PauseCircle className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Search & Status Filter Pills */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search coupons..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter coupons by status">
                        {filterOptions.map((pill) => {
                            const selected = statusFilter === pill.value;
                            return (
                                <button
                                    key={pill.value}
                                    type="button"
                                    onClick={() => setStatusFilter(pill.value)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                        selected
                                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                            : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <span>{pill.label}</span>
                                    <span
                                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold tabular-nums ${
                                            selected
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {pill.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="rounded-md border bg-card overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : !filteredCoupons.length ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2.5">
                                            <Ticket className="h-9 w-9 text-muted-foreground/50" />
                                            {coupons.length > 0 ? (
                                                <>
                                                    <p className="font-medium text-foreground">
                                                        No matching coupons found
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Try adjusting your search term or status filter.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-1"
                                                        onClick={() => {
                                                            setSearch("");
                                                            setStatusFilter("all");
                                                        }}
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-medium text-foreground">No coupons yet</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Create your first discount code to boost conversions.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCoupons.map((coupon: any) => {
                                    const status = getCouponStatus(coupon);
                                    const isExpired = status === "expired";
                                    const isActive = status === "active";
                                    const usedCount = Number(coupon.usedCount) || 0;
                                    const hasLimit =
                                        typeof coupon.usageLimit === "number" && coupon.usageLimit > 0;
                                    const usagePct = hasLimit
                                        ? Math.min(100, Math.round((usedCount / coupon.usageLimit) * 100))
                                        : 0;
                                    const isCopied = copiedId === coupon._id;
                                    const isToggling = togglingId === coupon._id;

                                    return (
                                        <TableRow key={coupon._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-semibold tracking-wide">
                                                        {coupon.code}
                                                    </span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                onClick={() => handleCopyCode(coupon)}
                                                                aria-label={`Copy coupon code ${coupon.code}`}
                                                            >
                                                                {isCopied ? (
                                                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                ) : (
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {isCopied ? "Copied!" : `Copy ${coupon.code}`}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="font-medium">
                                                    {coupon.discountType === "percentage"
                                                        ? `${coupon.discountAmount}% OFF`
                                                        : `₹${coupon.discountAmount} OFF`}
                                                </div>
                                                {Number(coupon.minPurchaseAmount) > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Min: ₹{coupon.minPurchaseAmount}
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            isActive
                                                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                                                : isExpired
                                                                  ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                                                                  : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                                        }
                                                    >
                                                        {isActive ? "Active" : isExpired ? "Expired" : "Paused"}
                                                    </Badge>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="inline-flex items-center">
                                                                <Switch
                                                                    checked={!isExpired && Boolean(coupon.isActive)}
                                                                    disabled={isExpired || isToggling}
                                                                    onCheckedChange={(checked) =>
                                                                        handleToggleActive(coupon, checked)
                                                                    }
                                                                    aria-label={`Toggle ${coupon.code} active status`}
                                                                />
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {isExpired
                                                                ? "Expired coupon — edit expiry date to reactivate"
                                                                : coupon.isActive
                                                                  ? "Pause coupon"
                                                                  : "Activate coupon"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="space-y-1.5 min-w-[110px]">
                                                    <div className="flex items-center justify-between text-xs font-medium tabular-nums">
                                                        <span>
                                                            {usedCount} / {hasLimit ? coupon.usageLimit : "∞"}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {hasLimit ? `${usagePct}%` : "Unlimited"}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="h-1.5 w-28 rounded-full bg-muted overflow-hidden"
                                                        aria-hidden="true"
                                                    >
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                !hasLimit
                                                                    ? "w-full bg-primary/25"
                                                                    : usagePct >= 100
                                                                      ? "bg-red-500"
                                                                      : usagePct >= 80
                                                                        ? "bg-amber-500"
                                                                        : "bg-emerald-500 dark:bg-emerald-400"
                                                            }`}
                                                            style={hasLimit ? { width: `${usagePct}%` } : undefined}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <span
                                                        className={`text-sm ${
                                                            isExpired
                                                                ? "text-red-600 dark:text-red-400 font-medium"
                                                                : ""
                                                        }`}
                                                    >
                                                        {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-muted-foreground hover:text-foreground"
                                                                onClick={() => openEditDialog(coupon)}
                                                                aria-label={`Edit coupon ${coupon.code}`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit coupon</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                                                                onClick={() => setCouponToDelete(coupon._id)}
                                                                disabled={isDeleting}
                                                                aria-label={`Delete coupon ${coupon.code}`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete coupon</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create / Edit Coupon Modal */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCoupon ? `Edit Coupon (${editingCoupon.code})` : "Create New Coupon"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCoupon
                                ? "Update the discount value, minimum order amount, usage cap, or expiry date."
                                : "Create a new discount code for your customers."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="SUMMER2024"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    className="uppercase font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Discount Type</Label>
                                <Select value={formData.discountType} onValueChange={handleSelectChange}>
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">
                                    Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"} *
                                </Label>
                                <Input
                                    id="amount"
                                    name="discountAmount"
                                    type="number"
                                    placeholder="0"
                                    value={formData.discountAmount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    max={formData.discountType === "percentage" ? "100" : undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date *</Label>
                                <Input
                                    id="expiry"
                                    name="expiryDate"
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    required
                                    min={editingCoupon ? undefined : todayInputMin}
                                    className="dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                                <Input
                                    id="usageLimit"
                                    name="usageLimit"
                                    type="number"
                                    placeholder="Unlimited"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minPurchase">Min Purchase Amount (₹)</Label>
                                <Input
                                    id="minPurchase"
                                    name="minPurchaseAmount"
                                    type="number"
                                    placeholder="0"
                                    value={formData.minPurchaseAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        {editingCoupon && (
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="coupon-active-switch" className="text-sm font-medium">
                                        Coupon Active
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Paused coupons cannot be redeemed until reactivated.
                                    </p>
                                </div>
                                <Switch
                                    id="coupon-active-switch"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, isActive: checked }))
                                    }
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDialogOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingCoupon ? "Save Changes" : "Create Coupon"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!couponToDelete}
                onOpenChange={(open) => !open && setCouponToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the coupon and
                            it will no longer be usable by customers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => couponToDelete && handleDelete(couponToDelete)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? "Deleting..." : "Delete Coupon"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
