"use client";

import React, { useState } from "react";
import { useCreateShareLinkMutation } from "@/redux/api/shareApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { copyToClipboardSafe } from "@/lib/utils";
import { Share2, Copy, Check, Sparkles, MessageCircle, Twitter } from "lucide-react";

interface ProductShareEarnButtonProps {
  productId: string;
  productName: string;
}

export const ProductShareEarnButton: React.FC<ProductShareEarnButtonProps> = ({ productId, productName }) => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [createShareLink, { isLoading }] = useCreateShareLinkMutation();

  const handleOpen = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to generate your tracked Share & Earn referral link");
      return;
    }
    setIsOpen(true);
    try {
      const res: any = await createShareLink({ productId, type: "product" }).unwrap();
      const code = res?.data?.shareLink?.code || res?.data?.link?.code;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      if (code) {
        setShareUrl(`${origin}/product/${productId}?ref=${encodeURIComponent(code)}`);
      } else {
        setShareUrl(res?.data?.shareUrl || `${origin}/product/${productId}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not create share link");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setShareUrl(`${origin}/product/${productId}`);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await copyToClipboardSafe(shareUrl);
    setCopied(true);
    toast.success("Affiliate link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Check out ${productName} on Aura Store: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareTwitter = () => {
    const text = `Check out ${productName} on Aura Store! ${shareUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold text-xs transition-all shadow-xs group"
      >
        <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
        <span>Share & Earn Commission on This Product</span>
        <Share2 className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:opacity-100" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Refer & Earn Commission
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Share your tracked link. When friends or followers order this product (min ₹2,000 threshold), the commission is directly credited to your wallet!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3 text-xs">
            {isLoading ? (
              <div className="py-8 text-center text-slate-400">Generating unique tracking link...</div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <span className="truncate font-mono font-medium text-slate-700 dark:text-slate-300 text-xs select-all">
                    {shareUrl}
                  </span>
                  <Button
                    size="sm"
                    onClick={copyLink}
                    className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex-shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={shareWhatsApp}
                    className="flex-1 rounded-xl text-xs flex items-center justify-center gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareTwitter}
                    className="flex-1 rounded-xl text-xs flex items-center justify-center gap-1.5 border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                  >
                    <Twitter className="w-4 h-4 text-sky-500" /> X / Twitter
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

