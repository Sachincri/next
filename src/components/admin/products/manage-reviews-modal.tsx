"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetReviewsQuery, useDeleteReviewMutation } from "@/redux/api/productApi"
import { Loader2, Star, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ManageReviewsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    productId: string
}

export default function ManageReviewsModal({ isOpen, onOpenChange, productId }: ManageReviewsModalProps) {
    const { data: reviews, isLoading, isError } = useGetReviewsQuery(productId, {
        skip: !productId || !isOpen
    })
    const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation()

    // Alert Dialog State
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertData, setAlertData] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
    }>({ title: "", description: "", onConfirm: () => { } })

    const executeDelete = async (reviewId: string) => {
        try {
            await deleteReview({ reviewId, productId }).unwrap()
            toast.success("Review deleted successfully")
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete review")
        }
    }

    const handleDeleteClick = (reviewId: string) => {
        setAlertData({
            title: "Delete Review",
            description: "Are you sure you want to delete this review? This action cannot be undone.",
            onConfirm: () => executeDelete(reviewId)
        })
        setAlertOpen(true)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Reviews</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : isError ? (
                    <div className="text-center p-8 text-red-500">Failed to load reviews</div>
                ) : reviews?.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">No reviews found for this product.</div>
                ) : (
                    <div className="space-y-4">
                        {reviews?.map((review: any) => (
                            <div key={review._id} className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                <Avatar className="w-10 h-10 border">
                                    <AvatarFallback className="bg-primary/10 text-primary"><User className="w-5 h-5" /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-sm">{review.name || "Anonymous User"}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : "Verified Purchase"}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                            onClick={() => handleDeleteClick(review._id)}
                                            disabled={isDeleting}
                                            title="Delete Review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-0.5 my-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"}`}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertData.title}</AlertDialogTitle>
                        <AlertDialogDescription>{alertData.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            alertData.onConfirm()
                            setAlertOpen(false)
                        }} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
