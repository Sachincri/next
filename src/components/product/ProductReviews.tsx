"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Star, CheckCircle2, Image as ImageIcon, Video as VideoIcon, X, PlayCircle, FileVideo, Plus, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
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
import Image from "next/image";

interface ProductReviewsProps {
    product: any;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Media Lightbox State
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [activeMediaList, setActiveMediaList] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const openMediaLightbox = (review: any, type: 'image' | 'video', index: number) => {
        const media: { url: string; type: 'image' | 'video' }[] = [
            ...(review.videos || []).map((v: any) => ({ url: v.url, type: 'video' as const })),
            ...(review.images || []).map((i: any) => ({ url: i.url, type: 'image' as const }))
        ];
        
        // Calculate the correct index in the merged list
        let mergedIndex = index;
        if (type === 'image') {
            mergedIndex = (review.videos?.length || 0) + index;
        }

        setActiveMediaList(media);
        setCurrentMediaIndex(mergedIndex);
        setIsMediaOpen(true);
    };

    const nextMedia = () => {
        setCurrentMediaIndex((prev) => (prev + 1) % activeMediaList.length);
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prev) => (prev - 1 + activeMediaList.length) % activeMediaList.length);
    };

    const [submitReview, { isLoading, isSuccess: reviewSuccess, error: reviewError }] = useSubmitReviewMutation();

    // Safe extraction of reviews with comments
    const reviews = useMemo(() =>
        product?.reviews?.filter((com: any) => com.comment && com.comment !== "") || [],
        [product?.reviews]
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedImages.length + files.length > 4) {
            toast.error("Max 4 images allowed");
            return;
        }
        setSelectedImages([...selectedImages, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedVideos.length + files.length > 1) {
            toast.error("Max 1 video allowed");
            return;
        }
        setSelectedVideos([...selectedVideos, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setVideoPreviews([...videoPreviews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);
        URL.revokeObjectURL(imagePreviews[index]);
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const removeVideo = (index: number) => {
        const newVideos = [...selectedVideos];
        newVideos.splice(index, 1);
        setSelectedVideos(newVideos);
        URL.revokeObjectURL(videoPreviews[index]);
        const newPreviews = [...videoPreviews];
        newPreviews.splice(index, 1);
        setVideoPreviews(newPreviews);
    };

    const resetForm = () => {
        setRating(0);
        setComment("");
        setSelectedImages([]);
        setSelectedVideos([]);
        imagePreviews.forEach(p => URL.revokeObjectURL(p));
        videoPreviews.forEach(p => URL.revokeObjectURL(p));
        setImagePreviews([]);
        setVideoPreviews([]);
    };

    const reviewSubmitHandler = async () => {
        try {
            if (!product?._id) return;
            
            const formData = new FormData();
            formData.append("rating", rating.toString());
            formData.append("comment", comment);
            formData.append("productId", product._id);
            
            selectedImages.forEach(img => formData.append("images", img));
            selectedVideos.forEach(vid => formData.append("videos", vid));

            const res = await submitReview(formData).unwrap();
            toast.success(res.message || "Review submitted successfully");
            setOpen(false);
            resetForm();
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
                        const total = product?.reviews?.length || 1; 
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
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-4">{review.comment}</p>
                            
                            {/* Media Display */}
                            <div className="flex flex-wrap gap-3">
                                {review.videos?.map((vid: any, vIdx: number) => (
                                    <div 
                                        key={vIdx} 
                                        className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-900 group shadow-sm cursor-pointer"
                                        onClick={() => openMediaLightbox(review, 'video', vIdx)}
                                    >
                                        <video src={vid.url} className="w-full h-full object-cover opacity-70" />
                                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <PlayCircle className="text-white w-10 h-10 drop-shadow-md" />
                                        </div>
                                    </div>
                                ))}
                                {review.images?.map((img: any, iIdx: number) => (
                                    <div 
                                        key={iIdx} 
                                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in group"
                                        onClick={() => openMediaLightbox(review, 'image', iIdx)}
                                    >
                                        <Image src={img.url} alt="Review" fill className="object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <Maximize2 className="text-white w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Star className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500 text-center max-w-xs mb-6">Be the first to upload a photo and share your experience with this product.</p>
                        <Button onClick={() => setOpen(true)} variant="outline">Upload Photo & Review</Button>
                    </div>
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); setOpen(val); }}>
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
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Your Review</label>
                            <Textarea
                                placeholder="Tell us what you liked or didn't like..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[120px] bg-gray-50 border-gray-200 focus:bg-white resize-none rounded-xl"
                            />
                        </div>

                        {/* Media Uploads */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Add Photos & Videos</label>
                            <div className="flex flex-wrap gap-3">
                                {imagePreviews.map((p, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-100">
                                        <Image src={p} alt="Preview" fill className="object-cover" />
                                        <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={12} /></button>
                                    </div>
                                ))}
                                {videoPreviews.map((p, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-900 flex items-center justify-center">
                                        <FileVideo className="text-white w-6 h-6" />
                                        <button onClick={() => removeVideo(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={12} /></button>
                                    </div>
                                ))}
                                
                                {selectedImages.length < 4 && (
                                    <button 
                                        onClick={() => imageInputRef.current?.click()}
                                        className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                    >
                                        <ImageIcon size={20} />
                                        <span className="text-[9px] font-bold mt-1">PHOTO</span>
                                    </button>
                                )}
                                {selectedVideos.length < 1 && (
                                    <button 
                                        onClick={() => videoInputRef.current?.click()}
                                        className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                    >
                                        <FileVideo size={20} />
                                        <span className="text-[9px] font-bold mt-1">VIDEO</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={imageInputRef} hidden accept="image/*" multiple onChange={handleImageChange} />
                            <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={handleVideoChange} />
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
                                disabled={rating === 0 || !comment || isLoading}
                            >
                                {isLoading ? "Submitting..." : "Submit Review"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Media Lightbox Modal */}
            <Dialog open={isMediaOpen} onOpenChange={setIsMediaOpen}>
                <DialogContent className="max-w-4xl p-0 h-[80vh] bg-black/95 border-none flex flex-col items-center justify-center rounded-2xl overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Close Button UI Overrides for Lightbox */}
                        <button 
                            onClick={() => setIsMediaOpen(false)}
                            className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all"
                        >
                            <X size={24} />
                        </button>

                        {/* Navigation Buttons */}
                        {activeMediaList.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                    className="absolute left-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                    className="absolute right-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all"
                                >
                                    <ChevronRight size={28} />
                                </button>
                            </>
                        )}

                        {/* Media Content */}
                        <div className="w-full h-full flex items-center justify-center p-4 sm:p-10">
                            {activeMediaList[currentMediaIndex]?.type === 'video' ? (
                                <video 
                                    key={activeMediaList[currentMediaIndex].url}
                                    src={activeMediaList[currentMediaIndex].url} 
                                    controls 
                                    autoPlay 
                                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                                />
                            ) : (
                                <div className="relative w-full h-full">
                                    <Image 
                                        src={activeMediaList[currentMediaIndex]?.url} 
                                        alt="Review media" 
                                        fill 
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            )}
                        </div>

                        {/* Caption/Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-bold tracking-widest uppercase">
                            {currentMediaIndex + 1} / {activeMediaList.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
