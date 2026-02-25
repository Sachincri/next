"use client"

import { useState, useEffect } from "react"
import { useUpdateOrderMutation } from "@/redux/api/adminApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Label } from "@/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Input } from "@/ui/input"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

interface EditOrderModalProps {
    order: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EditOrderModal({ order, open, onOpenChange }: EditOrderModalProps) {
    const [updateOrder, { isLoading }] = useUpdateOrderMutation()

    const [formData, setFormData] = useState({
        status: "placed",
        // Add other editable fields if API supports them, currently API only supports status update in updateOrder
    })

    useEffect(() => {
        if (order) {
            setFormData({
                status: order.orderStatus || "placed",
            })
        }
    }, [order])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!order) return

        try {
            await updateOrder({
                id: order._id,
                orderStatus: formData.status
            }).unwrap()

            toast.success("Order updated successfully")
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update order")
        }
    }

    if (!order) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Order #{order._id.slice(-6)}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Order Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
