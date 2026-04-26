"use client";

import React, { useState, useRef } from "react";
import { Star, Image as ImageIcon, Video as VideoIcon, X, PlayCircle, FileVideo, Plus, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";
import { useSubmitReviewMutation } from "@/redux/api/productApi";
import toast from "react-hot-toast";
import Image from "next/image";

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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    
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

    const [submitReview, { isLoading }] = useSubmitReviewMutation();

    const displayedReviews = showAllReviews ? initialReviews : initialReviews.slice(0, 4);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedImages.length + files.length > 4) {
            toast.error("You can only upload up to 4 images");
            return;
        }

        const newImages = [...selectedImages, ...files];
        setSelectedImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedVideos.length + files.length > 1) {
            toast.error("You can only upload 1 video");
            return;
        }

        const newVideos = [...selectedVideos, ...files];
        setSelectedVideos(newVideos);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setVideoPreviews([...videoPreviews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const removeVideo = (index: number) => {
        const newVideos = [...selectedVideos];
        newVideos.splice(index, 1);
        setSelectedVideos(newVideos);

        const newPreviews = [...videoPreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setVideoPreviews(newPreviews);
    };

    const handleReviewSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("rating", rating.toString());
            formData.append("comment", comment);
            formData.append("productId", productId);

            selectedImages.forEach(file => {
                formData.append("images", file);
            });

            selectedVideos.forEach(file => {
                formData.append("videos", file);
            });

            await submitReview(formData).unwrap();
            toast.success("Review submitted successfully");
            resetForm();
            setOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to submit review");
        }
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
            <div className={`lg:col-span-8 space-y-4 p-6 rounded-xl bg-[#cdf7cd] border border-slate-100`}>
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
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                                
                                {/* Media Display */}
                                <div className="flex flex-wrap gap-2">
                                    {review.videos?.map((vid: any, vIdx: number) => (
                                        <div 
                                            key={vIdx} 
                                            className="relative w-20 h-20 rounded-lg overflow-hidden bg-black group cursor-pointer"
                                            onClick={() => openMediaLightbox(review, 'video', vIdx)}
                                        >
                                            <video src={vid.url} className="w-full h-full object-cover opacity-80" />
                                            <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <PlayCircle className="text-white w-8 h-8 drop-shadow-md" />
                                            </div>
                                        </div>
                                    ))}
                                    {review.images?.map((img: any, iIdx: number) => (
                                        <div 
                                            key={iIdx} 
                                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in group"
                                            onClick={() => openMediaLightbox(review, 'image', iIdx)}
                                        >
                                            <Image src={img.url} alt="Review" fill className="object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <Maximize2 className="text-white w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

            <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); setOpen(val); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Rate this product</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-5">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
                                        <Star className={`w-8 h-8 ${rating >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                {rating === 1 && "Terrible"}
                                {rating === 2 && "Bad"}
                                {rating === 3 && "Average"}
                                {rating === 4 && "Good"}
                                {rating === 5 && "Excellent"}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Your Feedback</label>
                            <Textarea
                                placeholder="What did you like or dislike?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[100px] bg-slate-50 border-slate-200"
                            />
                        </div>

                        {/* Media Upload Section */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Add Photos & Video</label>
                            <div className="flex flex-wrap gap-3">
                                {/* Image Previews */}
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-100">
                                        <Image src={preview} alt="Preview" fill className="object-cover" />
                                        <button onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {/* Video Previews */}
                                {videoPreviews.map((preview, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-100 bg-slate-900 flex items-center justify-center">
                                        <FileVideo className="text-white w-6 h-6" />
                                        <button onClick={() => removeVideo(idx)} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Buttons */}
                                {selectedImages.length < 4 && (
                                    <button
                                        onClick={() => imageInputRef.current?.click()}
                                        className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                    >
                                        <ImageIcon size={20} />
                                        <span className="text-[8px] font-bold mt-1">IMAGE</span>
                                    </button>
                                )}
                                {selectedVideos.length < 1 && (
                                    <button
                                        onClick={() => videoInputRef.current?.click()}
                                        className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                    >
                                        <FileVideo size={20} />
                                        <span className="text-[8px] font-bold mt-1">VIDEO</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={imageInputRef} hidden accept="image/*" multiple onChange={handleImageChange} />
                            <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={handleVideoChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleReviewSubmit} disabled={!rating || !comment || isLoading}>
                            {isLoading ? "Submitting..." : "Submit Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Media Lightbox Modal */}
            <Dialog open={isMediaOpen} onOpenChange={setIsMediaOpen}>
                <DialogContent className="max-w-4xl p-0 h-[80vh] bg-black/95 border-none flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <button 
                            onClick={() => setIsMediaOpen(false)}
                            className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all"
                        >
                            <X size={24} />
                        </button>

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

                        <div className="w-full h-full flex items-center justify-center p-4 sm:p-10">
                            {activeMediaList[currentMediaIndex]?.type === 'video' ? (
                                <video 
                                    key={activeMediaList[currentMediaIndex].url}
                                    src={activeMediaList[currentMediaIndex].url} 
                                    controls 
                                    autoPlay 
                                    className="max-w-full max-h-full rounded-lg"
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

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-[10px] font-bold tracking-widest uppercase">
                            {currentMediaIndex + 1} / {activeMediaList.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
