"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { server } from "@/redux/constants";
import { saveReferralCode } from "@/components/common/ReferralTracker";

export default function ShareLinkRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params?.code === "string" ? params.code.trim() : "";

  useEffect(() => {
    if (!code) {
      router.replace("/");
      return;
    }

    saveReferralCode(code);

    fetch(`${server}/share/link/${encodeURIComponent(code)}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        const productId = json?.data?.product?._id;
        if (productId) {
          router.replace(`/product/${productId}?ref=${encodeURIComponent(code)}`);
        } else {
          router.replace(`/?ref=${encodeURIComponent(code)}`);
        }
      })
      .catch(() => {
        router.replace(`/?ref=${encodeURIComponent(code)}`);
      });
  }, [code, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
      <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
      <p className="text-sm font-medium">Applying referral link and redirecting...</p>
    </div>
  );
}
