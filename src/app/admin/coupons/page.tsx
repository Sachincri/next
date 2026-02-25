"use client";

import { useState } from "react";
import DashboardLayout from "@/components/admin/dashboard-layout";
import { useGetCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } from "@/redux/api/adminApi";
import { Plus, Trash2, Ticket, Calendar, Search, Loader2 } from "lucide-react";
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
    DialogTrigger,
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
import { toast } from "react-hot-toast";

export default function CouponsPage() {
    const { data: coupons, isLoading, refetch } = useGetCouponsQuery();
    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
    const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage", // 'percentage' | 'fixed'
        discountAmount: "",
        expiryDate: "",
        usageLimit: "",
        minPurchaseAmount: "0",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.code || !formData.discountAmount || !formData.expiryDate) {
                toast.error("Please fill in all required fields");
                return;
            }

            await createCoupon({
                ...formData,
                code: formData.code.toUpperCase(),
                discountAmount: Number(formData.discountAmount),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                minPurchaseAmount: Number(formData.minPurchaseAmount),
            }).unwrap();

            toast.success("Coupon created successfully");
            setIsDialogOpen(false);
            setFormData({
                code: "",
                discountType: "percentage",
                discountAmount: "",
                expiryDate: "",
                usageLimit: "",
                minPurchaseAmount: "0",
            });
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create coupon");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                await deleteCoupon(id).unwrap();
                toast.success("Coupon deleted successfully");
                refetch();
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to delete coupon");
            }
        }
    };

    const filteredCoupons = coupons?.filter((coupon: any) =>
        coupon.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                        <p className="text-muted-foreground">
                            Manage discount coupons and promotions
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Coupon</DialogTitle>
                                <DialogDescription>
                                    Create a new discount code for your customers.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Coupon Code *</Label>
                                        <Input
                                            id="code"
                                            name="code"
                                            placeholder="SUMMER2024"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            required
                                            className="uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Discount Type</Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(val) => handleSelectChange("discountType", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isCreating}>
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Coupon
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search coupons..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border bg-card">
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
                            ) : !filteredCoupons?.length ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Ticket className="h-8 w-8 text-muted-foreground/50" />
                                            <p>No coupons found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCoupons.map((coupon: any) => {
                                    const isExpired = new Date(coupon.expiryDate) < new Date();
                                    const isActive = coupon.isActive && !isExpired;

                                    return (
                                        <TableRow key={coupon._id}>
                                            <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                                            <TableCell>
                                                {coupon.discountType === 'percentage'
                                                    ? `${coupon.discountAmount}% OFF`
                                                    : `₹${coupon.discountAmount} OFF`}
                                                {coupon.minPurchaseAmount > 0 && (
                                                    <div className="text-xs text-muted-foreground">Min: ₹{coupon.minPurchaseAmount}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                                                    {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {coupon.usedCount} / {coupon.usageLimit || "∞"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">{new Date(coupon.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(coupon._id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
