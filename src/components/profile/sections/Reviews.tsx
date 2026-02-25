import { useGetMyReviewsQuery } from "@/redux/api/userApi";
import { UserReview as Review } from "@/types";

import { Heart, Star } from "lucide-react";

export const ReviewsSection = () => {
    const { data, isLoading } = useGetMyReviewsQuery();
    console.log("ReviewsSection data:", data);
    const reviews: Review[] = (data as { reviews?: Review[] })?.reviews || [];
    console.log("ReviewsSection reviews:", reviews);

    if (isLoading) {
        return <div className="text-center py-10">Loading reviews...</div>;
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">No reviews yet</h3>
                <p className="text-gray-500 dark:text-slate-400">Reviews you write will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mb-2">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold">Your Reviews Help the Community!</span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-500/80 text-sm">Share your experience with products to help other customers make informed decisions.</p>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id || (review as any)._id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md dark:hover:shadow-slate-950/20 transition-all duration-200">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                {review.productImage ? (
                                    <img src={review.productImage} alt={review.productName} className="w-full h-full object-contain p-1" />
                                ) : (
                                    <span className="text-2xl">📦</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-semibold text-gray-800 dark:text-slate-100 mb-2">{review.productName}</div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-slate-700'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                                Reviewed on {(review.date || (review as any).createdAt) ? new Date(review.date || (review as any).createdAt).toLocaleDateString() : 'Recent'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-3 leading-relaxed">{review.review || (review as any).comment}</p>
                                <div className="flex items-center justify-between">
                                    {/* <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <Heart className="w-4 h-4" />
                                        {review.helpful || 0} people found this helpful
                                    </div> */}
                                    {/* <div className="flex gap-3">
                                        <button className="text-blue-600 text-sm font-medium hover:underline">Edit</button>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}