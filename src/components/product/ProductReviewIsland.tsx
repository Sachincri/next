"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";
import { useSubmitReviewMutation } from "@/redux/api/productApi";
import toast from "react-hot-toast";

interface ReviewIslandProps {
    productId: string;
    brandName?: string;
    initialReviews: any[];
    averageRating: number;
    ratingCount: number;
}

export const ReviewIsland: React.FC<ReviewIslandProps> = ({
    productId,
    brandName,
    initialReviews,
    averageRating,
    ratingCount
}) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [submitReview] = useSubmitReviewMutation();

    const displayedReviews = showAllReviews ? initialReviews : initialReviews.slice(0, 4);

    const handleReviewSubmit = async () => {
        try {
            await submitReview({ rating, comment, productId }).unwrap();
            toast.success("Review submitted successfully");
            setOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to submit review");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Summary Column */}
            <div className="lg:col-span-4 bg-white rounded-xl p-6 h-fit border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex justify-between items-center">
                    Ratings Summary
                    <Button onClick={() => setOpen(true)} size="sm">Write Review</Button>
                </h3>
                <div className="flex items-center gap-4 mb-2">
                    <div className="text-4xl font-black text-gray-900">{averageRating.toFixed(1)}</div>
                    <div className="flex flex-col">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? "fill-current" : "text-gray-300"}`} />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{ratingCount.toLocaleString()} Verified Ratings</span>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className={`lg:col-span-8 space-y-2 p-6 rounded-xl bg-[#cdf7cd] border border-slate-100`}>
                {initialReviews.length > 0 ? (
                    <>
                        {displayedReviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-sm text-gray-900">{review.name || "User"}</div>
                                    <div className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold">
                                        {review.rating} <Star className="w-3 h-3 ml-0.5 fill-current" />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        ))}

                        {initialReviews.length > 4 && (
                            <div className="pt-2 text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="text-blue-600 hover:text-blue-700 font-bold text-sm"
                                >
                                    {showAllReviews ? "Show Less" : `See all ${initialReviews.length} reviews`}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-400 text-center italic text-sm">No reviews yet.</p>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Rate this product</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setRating(s)}>
                                    <Star className={`w-8 h-8 ${rating >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                                </button>
                            ))}
                        </div>
                        <Textarea
                            placeholder="Your feedback..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleReviewSubmit} disabled={!rating || !comment}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
