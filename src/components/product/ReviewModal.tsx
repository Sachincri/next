import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Star, Image as ImageIcon, FileVideo, Plus } from "lucide-react";
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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
    const [hoverRating, setHoverRating] = useState(0);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [submitReview, { isLoading }] = useSubmitReviewMutation();

    useEffect(() => {
        if (isOpen) {
            setRating(existingRating);
            setComment(existingComment);
            resetFiles();
        }
    }, [isOpen, existingRating, existingComment]);

    const resetFiles = () => {
        imagePreviews.forEach(p => URL.revokeObjectURL(p));
        videoPreviews.forEach(p => URL.revokeObjectURL(p));
        setSelectedImages([]);
        setSelectedVideos([]);
        setImagePreviews([]);
        setVideoPreviews([]);
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("rating", rating.toString());
            formData.append("comment", comment);
            formData.append("productId", productId);
            
            selectedImages.forEach(img => formData.append("images", img));
            selectedVideos.forEach(vid => formData.append("videos", vid));

            const res = await submitReview(formData).unwrap();
            toast.success(res?.message || "Review submitted successfully");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to submit review");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 overflow-hidden">
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

                    <div className="mb-6 flex gap-4 items-center p-3 bg-slate-50 rounded-xl">
                        {productImage && (
                            <Image
                                src={productImage}
                                alt={productName}
                                width={56}
                                height={56}
                                className="object-cover rounded-lg border border-gray-200"
                            />
                        )}
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</p>
                            <p className="font-bold text-gray-800 line-clamp-1 text-sm">{productName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                                Rate this product
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="p-1 focus:outline-none transition-all hover:scale-110 active:scale-95"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            size={28}
                                            className={`${star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                                : "fill-gray-50 text-gray-200"
                                                } transition-colors duration-200`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="h-4 text-[10px] font-bold text-yellow-600 uppercase tracking-wider">
                                {hoverRating > 0 ? (
                                    ["Terrible", "Bad", "Average", "Good", "Excellent"][hoverRating - 1]
                                ) : rating > 0 ? (
                                    ["Terrible", "Bad", "Average", "Good", "Excellent"][rating - 1]
                                ) : ""}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="comment" className="block text-xs font-bold text-gray-500 uppercase tracking-tight">
                                Your Feedback
                            </label>
                            <textarea
                                id="comment"
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none text-sm text-gray-700 bg-gray-50/50"
                            />
                        </div>

                        {/* Media Section */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight">
                                Add Media
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {imagePreviews.map((p, i) => (
                                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100">
                                        <Image src={p} alt="Preview" fill className="object-cover" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={10} /></button>
                                    </div>
                                ))}
                                {videoPreviews.map((p, i) => (
                                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100 bg-slate-900 flex items-center justify-center">
                                        <FileVideo className="text-white w-5 h-5" />
                                        <button type="button" onClick={() => removeVideo(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={10} /></button>
                                    </div>
                                ))}
                                
                                {selectedImages.length < 4 && (
                                    <button 
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                    >
                                        <ImageIcon size={18} />
                                        <span className="text-[7px] font-bold mt-1">PHOTO</span>
                                    </button>
                                )}
                                {selectedVideos.length < 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => videoInputRef.current?.click()}
                                        className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                    >
                                        <FileVideo size={18} />
                                        <span className="text-[7px] font-bold mt-1">VIDEO</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={imageInputRef} hidden accept="image/*" multiple onChange={handleImageChange} />
                            <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={handleVideoChange} />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || rating === 0}
                                className="flex-[2] py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
