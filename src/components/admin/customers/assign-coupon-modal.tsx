"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Label } from "@/ui/label"
import { useGetCouponsQuery, useAssignCouponMutation } from "@/redux/api/adminApi"
import toast from "react-hot-toast"
import { Loader2, Ticket } from "lucide-react"

interface AssignCouponModalProps {
    customer: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function AssignCouponModal({ customer, open, onOpenChange }: AssignCouponModalProps) {
    const [selectedCouponId, setSelectedCouponId] = useState<string>("")
    const { data: response, isLoading: isLoadingCoupons } = useGetCouponsQuery(undefined, {
        skip: !open // Only fetch when open
    })

    // Extract coupons array from response (matches backend: successResponse(res, 200, '...', coupons))
    // But wait, adminApi `getCoupons` transformResponse returns `response.data`.
    // If backend sends { success: true, ..., data: [...] } then `response.data` is the array.
    // User backend code: `successResponse` typically sends { success: true, message: '...', data: coupons }.
    // AdminApi transformResponse: `response.data`. So `coupons` should be the array or `response` is the array.
    // Let's assume response IS the array of coupons based on my adminApi edit.
    // Wait, I put `getCoupons: ... transformResponse: (response: any) => response.data`.

    const coupons = Array.isArray(response) ? response : []

    const [assignCoupon, { isLoading: isAssigning }] = useAssignCouponMutation()

    const handleAssign = async () => {
        if (!selectedCouponId || !customer) return

        try {
            await assignCoupon({
                userId: customer._id,
                couponId: selectedCouponId
            }).unwrap()

            toast.success(`Coupon assigned to ${customer.name}`)
            onOpenChange(false)
            setSelectedCouponId("")
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to assign coupon")
        }
    }

    if (!customer) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-primary" />
                        Give Coupon to Customer
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Customer</h4>
                        <p className="text-sm text-muted-foreground">
                            Assigning to <span className="font-semibold text-foreground">{customer.name}</span> ({customer.email})
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coupon">Select Coupon</Label>
                        <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                            <SelectTrigger id="coupon">
                                <SelectValue placeholder="Select a coupon..." />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingCoupons ? (
                                    <div className="flex justify-center p-2 text-sm text-muted-foreground">Loading...</div>
                                ) : coupons.length === 0 ? (
                                    <div className="flex justify-center p-2 text-sm text-muted-foreground">No active coupons found</div>
                                ) : (
                                    coupons.filter((c: any) => c.isActive && new Date(c.expiryDate) > new Date()).map((coupon: any) => (
                                        <SelectItem key={coupon._id} value={coupon._id}>
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{coupon.code}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} OFF`}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={!selectedCouponId || isAssigning}>
                        {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign Coupon
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
