
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Star } from "lucide-react";
import { useSubmitReviewMutation } from "@/redux/api/productApi";
import toast from "react-hot-toast";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    productImage?: string;
    existingRating?: number;
    existingComment?: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    productId,
    productName,
    productImage,
    existingRating = 0,
    existingComment = "",
}) => {
    const [rating, setRating] = useState(existingRating);
    const [comment, setComment] = useState(existingComment);
    const [hoverRating, setHoverRating] = useState(0);

    const [submitReview, { isLoading, isSuccess, error }] = useSubmitReviewMutation();

    useEffect(() => {
        if (isOpen) {
            setRating(existingRating);
            setComment(existingComment);
        }
    }, [isOpen, existingRating, existingComment]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        try {
            const res = await submitReview({ productId, rating, comment }).unwrap();
            toast.success(res?.message || "Review submitted successfully");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to submit review");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-6 flex gap-4 items-center">
                        {productImage && (
                            <Image
                                src={productImage}
                                alt={productName}
                                width={64}
                                height={64}
                                className="object-contain rounded-md border border-gray-200"
                            />
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Reviewing</p>
                            <p className="font-semibold text-gray-800 line-clamp-1">{productName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Rate this product
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-100 text-gray-300"
                                                } transition-colors duration-200`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="h-5 text-sm font-medium text-yellow-600">
                                {hoverRating > 0 ? (
                                    ["Terrible", "Bad", "Average", "Good", "Excellent"][hoverRating - 1]
                                ) : rating > 0 ? (
                                    ["Terrible", "Bad", "Average", "Good", "Excellent"][rating - 1]
                                ) : ""}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Review
                            </label>
                            <textarea
                                id="comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-gray-700 bg-gray-50 focus:bg-white"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
