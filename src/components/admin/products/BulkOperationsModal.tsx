"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Layers, AlertTriangle } from "lucide-react"
import { useBulkProductActionMutation, useGetCategoriesQuery } from "@/redux/api/adminApi"
import toast from "react-hot-toast"

interface BulkOperationsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedProductIds: string[]
  onSuccess?: () => void
}

export default function BulkOperationsModal({
  isOpen,
  onOpenChange,
  selectedProductIds,
  onSuccess,
}: BulkOperationsModalProps) {
  const [actionType, setActionType] = useState<"status" | "stock" | "category" | "price" | "delete">("status")
  const [statusVal, setStatusVal] = useState<"active" | "inactive">("active")
  const [stockType, setStockType] = useState<"set" | "add">("set")
  const [stockVal, setStockVal] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceAdjustType, setPriceAdjustType] = useState<"percent" | "fixed">("percent")
  const [priceAdjustVal, setPriceAdjustVal] = useState<number>(0)

  const { data: categories = [] } = useGetCategoriesQuery()
  const [bulkAction, { isLoading }] = useBulkProductActionMutation()

  const handleApply = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("No products selected for bulk action")
      return
    }

    let payload: any = {}
    if (actionType === "status") {
      payload = { isActive: statusVal === "active" }
    } else if (actionType === "stock") {
      payload = { type: stockType, value: stockVal }
    } else if (actionType === "category") {
      if (!selectedCategory) {
        toast.error("Please select a category")
        return
      }
      payload = { categoryId: selectedCategory }
    } else if (actionType === "price") {
      if (priceAdjustVal === 0) {
        toast.error("Please enter a valid price adjustment value")
        return
      }
      payload = {
        [priceAdjustType]: priceAdjustVal,
      }
    }

    try {
      const res = await bulkAction({
        productIds: selectedProductIds,
        action: actionType,
        data: payload,
      }).unwrap()

      toast.success(res?.message || "Bulk operation completed successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to execute bulk action")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5 text-primary" />
            Bulk Product Operations
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Applying changes to <strong>{selectedProductIds.length}</strong> selected product(s).
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Action Selector */}
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Select Bulk Action</Label>
            <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Change Active Status</SelectItem>
                <SelectItem value="stock">Update Stock Inventory</SelectItem>
                <SelectItem value="category">Assign Category</SelectItem>
                <SelectItem value="price">Adjust Selling Price</SelectItem>
                <SelectItem value="delete">Delete Selected Products</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Configuration */}
          {actionType === "status" && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-2">
              <Label className="text-xs font-medium block">Set Status To</Label>
              <Select value={statusVal} onValueChange={(v: any) => setStatusVal(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Visible in Store)</SelectItem>
                  <SelectItem value="inactive">Inactive (Hidden from Store)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {actionType === "stock" && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={stockType === "set" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setStockType("set")}
                >
                  Set Exact Stock
                </Button>
                <Button
                  type="button"
                  variant={stockType === "add" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setStockType("add")}
                >
                  Add / Subtract
                </Button>
              </div>

              <div>
                <Label className="text-xs font-medium block mb-1">
                  {stockType === "set" ? "New Stock Count" : "Quantity (+ to add, - to reduce)"}
                </Label>
                <Input
                  type="number"
                  value={stockVal}
                  onChange={(e) => setStockVal(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {actionType === "category" && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-2">
              <Label className="text-xs font-medium block">Move to Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="none">-- Remove Category --</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {actionType === "price" && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={priceAdjustType === "percent" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setPriceAdjustType("percent")}
                >
                  By Percentage (%)
                </Button>
                <Button
                  type="button"
                  variant={priceAdjustType === "fixed" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setPriceAdjustType("fixed")}
                >
                  By Fixed Amount (₹)
                </Button>
              </div>

              <div>
                <Label className="text-xs font-medium block mb-1">
                  {priceAdjustType === "percent"
                    ? "Percentage (e.g. 10 for +10%, -15 for -15%)"
                    : "Amount in ₹ (e.g. 100 for +₹100, -50 for -₹50)"}
                </Label>
                <Input
                  type="number"
                  value={priceAdjustVal}
                  onChange={(e) => setPriceAdjustVal(Number(e.target.value))}
                  placeholder="e.g. 10"
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {actionType === "delete" && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 text-xs rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Confirm Deletion</p>
                <p className="mt-0.5">
                  Are you sure you want to permanently delete {selectedProductIds.length} selected product(s)? This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant={actionType === "delete" ? "destructive" : "default"}
            onClick={handleApply}
            disabled={selectedProductIds.length === 0 || isLoading}
          >
            {isLoading ? "Applying..." : actionType === "delete" ? "Delete Products" : "Apply Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
