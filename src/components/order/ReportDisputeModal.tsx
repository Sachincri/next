"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateDisputeClaimMutation } from "@/redux/api/disputeApi";
import toast from "react-hot-toast";
import { AlertTriangle, UploadCloud, Video, Image as ImageIcon, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface ReportDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const REASONS = [
  { value: "defective_product", label: "Defective / Broken product (ख़राब / टूटा हुआ प्रोडक्ट)" },
  { value: "wrong_product", label: "Wrong product received (गलत प्रोडक्ट मिला)" },
  { value: "missing_item", label: "Missing item from package (पार्सल में सामान ग़ायब है)" },
  { value: "package_tampered", label: "Package seal broken / tampered (पार्सल की सील टूटी या खुली थी)" },
  { value: "empty_box", label: "Received empty box (खाली डिब्बा मिला)" },
];

export const ReportDisputeModal: React.FC<ReportDisputeModalProps> = ({ isOpen, onClose, order }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    order?.orderItems?.[0]?.product?._id || order?.orderItems?.[0]?.product || ""
  );
  const [reason, setReason] = useState<string>("defective_product");
  const [userDescription, setUserDescription] = useState<string>("");
  const [unboxingVideoProvided, setUnboxingVideoProvided] = useState<boolean>(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const [createDisputeClaim, { isLoading }] = useCreateDisputeClaimMutation();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length + photos.length > 5) {
        toast.error("You can upload a maximum of 5 photos.");
        return;
      }
      setPhotos((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file size must be under 100MB");
        return;
      }
      setVideo(file);
      setUnboxingVideoProvided(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error("Please select the product you received defective or wrong.");
      return;
    }

    if (!userDescription.trim()) {
      toast.error("Please provide a brief description of the issue.");
      return;
    }

    if (photos.length === 0 && !video) {
      toast.error("Please upload at least one photo or video as proof.");
      return;
    }

    const formData = new FormData();
    formData.append("orderId", order._id);
    formData.append("productId", selectedProductId);
    formData.append("reason", reason);
    formData.append("userDescription", userDescription);
    formData.append("unboxingVideoProvided", String(unboxingVideoProvided || !!video));

    photos.forEach((file) => {
      formData.append("photos", file);
    });

    if (video) {
      formData.append("videos", video);
    }

    try {
      const res: any = await createDisputeClaim(formData).unwrap();
      toast.success(res?.message || "Dispute claim submitted successfully! AI review initiated.");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit dispute claim. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Report Defective or Wrong Product
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Upload photos & unboxing video. Our AI forensic engine compares warehouse dispatch proof to verify delivery partner tampering or store error.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-xs sm:text-sm">
          {/* Select Product */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Product with Issue *
            </Label>
            <div className="grid grid-cols-1 gap-2 mt-1.5">
              {order?.orderItems?.map((item: any, idx: number) => {
                const pId = item.product?._id || item.product || item._id;
                const isSelected = selectedProductId === pId;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedProductId(pId)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100 font-medium"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 m-auto text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ₹{(item.sellingPrice || item.price)?.toLocaleString()} • Qty: {item.quantity}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason for Dispute *
            </Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Explain What You Received *
            </Label>
            <Textarea
              rows={3}
              placeholder="Tell us what was inside the package, defect location, or difference from ordered product..."
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              className="mt-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Photos Upload */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Photo Proofs (Max 5 photos) *</span>
              <span className="text-[10px] text-slate-400 font-normal">{photos.length}/5 photos</span>
            </Label>
            <div className="mt-1.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:border-amber-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={photos.length >= 5}
                className="hidden"
                id="customer-dispute-photos"
              />
              <label
                htmlFor="customer-dispute-photos"
                className="cursor-pointer flex flex-col items-center gap-1.5 py-1 text-slate-600 dark:text-slate-400"
              >
                <UploadCloud className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-semibold">Upload photos of received product & parcel box</span>
                <span className="text-[10px] text-slate-400">Include clear photo of courier shipping label and tape</span>
              </label>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <Image src={preview} alt="preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-90 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Unboxing / Defect Video (Highly Recommended)</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Faster AI Approval</span>
            </Label>
            <div className="mt-1.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:border-amber-400 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="customer-dispute-video"
              />
              <label
                htmlFor="customer-dispute-video"
                className="cursor-pointer flex flex-col items-center gap-1.5 py-1 text-slate-600 dark:text-slate-400"
              >
                <Video className="w-6 h-6 text-indigo-500" />
                <span className="text-xs font-semibold">
                  {video ? video.name : "Select unboxing video / 360° product video"}
                </span>
                <span className="text-[10px] text-slate-400">MP4, WEBM, MOV (Max 100MB)</span>
              </label>
            </div>
            {video && (
              <div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs">
                <span className="truncate">{video.name}</span>
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="text-red-500 font-bold ml-2 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Fair Resolution Guarantee:</strong> If our AI or warehouse team confirms delivery partner tampering, theft, or broken items, 100% refund will be instantly credited to your wallet.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading & Submitting...
                </>
              ) : (
                "Submit Dispute Claim"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

