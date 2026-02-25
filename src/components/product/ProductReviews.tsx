"use client";
import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { Star, CheckCircle2 } from "lucide-react";
import {
    useSubmitReviewMutation,
} from "@/redux/api/productApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";

interface ProductReviewsProps {
    product: any;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState("");

    const [submitReview, { isSuccess: reviewSuccess, error: reviewError }] = useSubmitReviewMutation();

    // Safe extraction of reviews with comments
    const reviews = useMemo(() =>
        product?.reviews?.filter((com: any) => com.comment && com.comment !== "") || [],
        [product?.reviews]
    );

    const reviewSubmitHandler = async () => {
        try {
            if (!product?._id) return;
            const res = await submitReview({ rating, comment, productId: product._id }).unwrap();
            toast.success(res.message || "Review submitted successfully");
            setOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to submit review");
        }
    };

    useEffect(() => {
        if (reviewError) {
            const err = reviewError as any;
            toast.error(err.data?.message || "Failed to submit review");
        }
    }, [reviewError]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Summary Column */}
            <div className="lg:col-span-4 bg-gray-50 rounded-xl p-6 h-fit">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex justify-between items-center">
                    Ratings Summary
                    <Button onClick={() => setOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Write Review</Button>
                </h3>

                <div className="flex items-center gap-4 mb-8">
                    <div className="text-5xl font-black text-gray-900">{product?.ratings?.average?.toFixed(1) || "0.0"}</div>
                    <div className="flex flex-col">
                        <div className="flex text-yellow-400 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-5 h-5 ${star <= Math.round(product?.ratings?.average || 0) ? "fill-current" : "text-gray-300 fill-gray-300"}`} />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">{product?.ratings?.count?.toLocaleString()} Verified Ratings</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((r) => {
                        const count = product?.reviews?.filter((rev: any) => Math.round(rev.rating) === r).length || 0;
                        const total = product?.reviews?.length || 1; // avoid div by zero
                        const percentage = (count / total) * 100;

                        return (
                            <div key={r} className="flex items-center gap-3 text-sm">
                                <span className="w-3 font-bold text-gray-600">{r}</span>
                                <Star className="w-4 h-4 text-gray-400" />
                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                                </div>
                                <span className="w-8 text-right text-gray-500 tabular-nums">{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Reviews List Column */}
            <div className="lg:col-span-8 space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review: any, index: number) => (
                        <div key={index} className="bg-white border text-card-foreground shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        {review.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.name || "Anonymous User"}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span>Verified Purchase</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
                                    <span className="font-bold text-green-700 mr-1">{review.rating}</span>
                                    <Star className="w-3 h-3 text-green-600 fill-current" />
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Star className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500 text-center max-w-xs mb-6">Be the first to share your experience with this product.</p>
                        <Button onClick={() => setOpen(true)} variant="outline">Write a Review</Button>
                    </div>
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl font-bold text-center">Rate your experience</DialogTitle>
                        <p className="text-center text-gray-500 text-sm">How do you like {product?.name}?</p>
                    </DialogHeader>
                    <div className="p-6 pt-2 space-y-6">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-all hover:scale-110 active:scale-90"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors duration-200 ${rating >= star ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" : "text-gray-200 fill-gray-50"}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-500 h-5">
                                {rating === 1 && "Terrible"}
                                {rating === 2 && "Bad"}
                                {rating === 3 && "Average"}
                                {rating === 4 && "Good"}
                                {rating === 5 && "Excellent!"}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Your Review</label>
                            <Textarea
                                placeholder="Tell us what you liked or didn't like..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[120px] bg-gray-50 border-gray-200 focus:bg-white resize-none rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-6 pt-0 bg-gray-50/50">
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1 rounded-xl border-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={reviewSubmitHandler}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20"
                                disabled={rating === 0 || !comment}
                            >
                                Submit Review
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
