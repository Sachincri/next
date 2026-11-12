"use client";

import React, { useState } from "react";
import {
  useGetAdminDisputesQuery,
  useUploadAdminEvidenceMutation,
  useTriggerAiReviewMutation,
  useResolveDisputeMutation,
} from "@/redux/api/disputeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Video,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Wallet,
  Truck,
  Eye,
  Loader2,
  Search,
  Scale,
  Barcode,
  Check,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function AdminDisputesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for Admin Evidence Upload
  const [dispatchWeight, setDispatchWeight] = useState("");
  const [barcodeScanned, setBarcodeScanned] = useState("");
  const [warehouseNotes, setWarehouseNotes] = useState("");
  const [packingPhotos, setPackingPhotos] = useState<File[]>([]);
  const [packingVideo, setPackingVideo] = useState<File | null>(null);

  // Form state for Resolution
  const [resolveAction, setResolveAction] = useState<string>("");
  const [resolveReason, setResolveReason] = useState<string>("");
  const [customRefundAmount, setCustomRefundAmount] = useState<string>("");

  const { data, isLoading, refetch } = useGetAdminDisputesQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const [uploadAdminEvidence, { isLoading: isUploadingEvidence }] = useUploadAdminEvidenceMutation();
  const [triggerAiReview, { isLoading: isRunningAiReview }] = useTriggerAiReviewMutation();
  const [resolveDispute, { isLoading: isResolving }] = useResolveDisputeMutation();

  const claims = data?.data?.claims || [];

  const handleOpenClaim = (claim: any) => {
    setSelectedClaim(claim);
    setDispatchWeight(claim.adminEvidence?.dispatchWeightGrams ? String(claim.adminEvidence.dispatchWeightGrams) : "");
    setBarcodeScanned(claim.adminEvidence?.barcodeScanned || "");
    setWarehouseNotes(claim.adminEvidence?.notes || "");
    setPackingPhotos([]);
    setPackingVideo(null);
    setResolveAction("");
    setResolveReason("");
    setCustomRefundAmount(claim.orderItem?.sellingPrice ? String(claim.orderItem.sellingPrice) : "");
    setIsModalOpen(true);
  };

  const handleUploadAdminProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (packingPhotos.length === 0 && !packingVideo && !dispatchWeight && !barcodeScanned) {
      toast.error("Please provide at least packing photo/video or weight/barcode.");
      return;
    }

    const formData = new FormData();
    if (dispatchWeight) formData.append("dispatchWeightGrams", dispatchWeight);
    if (barcodeScanned) formData.append("barcodeScanned", barcodeScanned);
    if (warehouseNotes) formData.append("notes", warehouseNotes);
    formData.append("autoTriggerAi", "true");

    packingPhotos.forEach((photo) => {
      formData.append("packingPhotos", photo);
    });

    if (packingVideo) {
      formData.append("packingVideo", packingVideo);
    }

    try {
      const res: any = await uploadAdminEvidence({
        id: selectedClaim._id,
        formData,
      }).unwrap();

      toast.success(res?.message || "Warehouse evidence uploaded & AI forensic analysis complete!");
      setSelectedClaim(res?.data?.claim);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to upload warehouse evidence");
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!selectedClaim) return;
    try {
      const res: any = await triggerAiReview(selectedClaim._id).unwrap();
      toast.success("AI Forensic review refreshed successfully!");
      setSelectedClaim(res?.data?.claim);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "AI review failed");
    }
  };

  const handleExecuteResolution = async (action: string) => {
    if (!selectedClaim) return;

    try {
      const res: any = await resolveDispute({
        id: selectedClaim._id,
        data: {
          action,
          reason: resolveReason || `Resolved as ${action.replace(/_/g, " ")} by admin.`,
          refundAmount: customRefundAmount ? Number(customRefundAmount) : selectedClaim.orderItem?.sellingPrice,
          creditToWallet: true,
        },
      }).unwrap();

      toast.success(res?.message || `Dispute ${action.replace(/_/g, " ")} executed!`);
      setSelectedClaim(res?.data?.claim);
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resolve dispute");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_admin_evidence":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Awaiting Warehouse Proof
          </span>
        );
      case "analyzing_by_ai":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Sparkles className="w-3 h-3" /> AI Analyzing...
          </span>
        );
      case "ai_reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3 h-3" /> AI Reviewed (Decision Needed)
          </span>
        );
      case "approved_refund":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Refunded to Wallet
          </span>
        );
      case "approved_replacement":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Truck className="w-3 h-3" /> Replacement Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" /> Claim Rejected
          </span>
        );
      case "escalated_to_courier":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Truck className="w-3 h-3" /> Courier Claim
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case "customer_favor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Customer Truthful (Genuine Defect)
          </span>
        );
      case "delivery_tampering":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            Courier Tampered / Fraud
          </span>
        );
      case "warehouse_favor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
            Warehouse Proper / False Claim
          </span>
        );
      case "inconclusive":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
            Inconclusive (Needs Manual Check)
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">Pending Proofs</span>;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Defective & Wrong Product Claims
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Multimodal AI compares customer photos & unboxing video against warehouse CCTV packing proof to detect courier tampering, fraud, or damage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by Claim Number (#DISP-...) or Product Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Claims" },
            { id: "awaiting_admin_evidence", label: "Awaiting Proof" },
            { id: "ai_reviewed", label: "AI Reviewed" },
            { id: "approved_refund", label: "Refunded" },
            { id: "escalated_to_courier", label: "Courier Escalate" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs text-slate-500">Loading dispute claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6">
            <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No dispute claims found</p>
            <p className="text-xs text-slate-500">All customer orders are currently in good standing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Claim ID & Date</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Dispute Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">AI Forensic Verdict</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {claims.map((claim: any) => (
                  <tr
                    key={claim._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {claim.claimNumber}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(claim.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    <td className="py-4 px-4 min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden relative flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                          {claim.orderItem?.productImage ? (
                            <Image
                              src={claim.orderItem.productImage}
                              alt={claim.orderItem.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 m-auto text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {claim.orderItem?.productName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            ₹{claim.orderItem?.sellingPrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900 dark:text-white">{claim.user?.name || "Customer"}</p>
                      <p className="text-[11px] text-slate-400">{claim.user?.email || claim.user?.phone || "-"}</p>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold capitalize">
                        {claim.reason.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(claim.status)}</td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {claim.aiAnalysis ? (
                        <div className="space-y-1">
                          {getVerdictBadge(claim.aiAnalysis.verdict)}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Confidence:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {claim.aiAnalysis.confidenceScore}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Awaiting Proofs</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => handleOpenClaim(claim)}
                        className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect & Resolve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Claim Detail & AI Forensic Modal */}
      {selectedClaim && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-3xl shadow-2xl">
            <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Dispute Claim #{selectedClaim.claimNumber}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Product: <strong>{selectedClaim.orderItem?.productName}</strong> (₹
                      {selectedClaim.orderItem?.sellingPrice}) • User: {selectedClaim.user?.name}
                    </DialogDescription>
                  </div>
                </div>
                <div>{getStatusBadge(selectedClaim.status)}</div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-3 text-xs sm:text-sm">
              {/* STEP 1: Customer Evidence */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Customer Claim & Proofs
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 capitalize">
                    Reason: {selectedClaim.reason.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  "{selectedClaim.userDescription}"
                </p>

                {/* Customer Photos */}
                {selectedClaim.userEvidence?.photos?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                      Customer Photos ({selectedClaim.userEvidence.photos.length}):
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedClaim.userEvidence.photos.map((photo: any, i: number) => (
                        <a
                          key={i}
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 group hover:opacity-90"
                        >
                          <Image src={photo.url} alt="proof" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Video */}
                {selectedClaim.userEvidence?.videos?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-indigo-500" />
                      Customer Unboxing / Defect Video:
                    </p>
                    <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
                      <video
                        src={selectedClaim.userEvidence.videos[0].url}
                        controls
                        className="w-full max-h-56 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Warehouse Packing Evidence */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-500" />
                    Warehouse Packing CCTV & Dispatch Records
                  </h3>
                  {selectedClaim.adminEvidence?.uploadedAt && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Records Attached
                    </span>
                  )}
                </div>

                {selectedClaim.adminEvidence?.uploadedAt ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Scale className="w-3 h-3" /> Dispatch Weight
                        </span>
                        <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {selectedClaim.adminEvidence.dispatchWeightGrams || "N/A"} grams
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Barcode className="w-3 h-3" /> Barcode Scanned
                        </span>
                        <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {selectedClaim.adminEvidence.barcodeScanned || "Verified"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400">Warehouse Notes</span>
                        <p className="font-medium text-xs text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                          {selectedClaim.adminEvidence.notes || "Standard security dispatch"}
                        </p>
                      </div>
                    </div>

                    {/* Warehouse Packing Photos */}
                    {selectedClaim.adminEvidence?.packingPhotos?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                          Warehouse Packing Photos:
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {selectedClaim.adminEvidence.packingPhotos.map((photo: any, i: number) => (
                            <a
                              key={i}
                              href={photo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 group hover:opacity-90"
                            >
                              <Image src={photo.url} alt="warehouse proof" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ExternalLink className="w-4 h-4" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warehouse Packing Video */}
                    {selectedClaim.adminEvidence?.packingVideo && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                          Warehouse Packing CCTV Video:
                        </p>
                        <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
                          <video
                            src={selectedClaim.adminEvidence.packingVideo.url}
                            controls
                            className="w-full max-h-56 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleUploadAdminProof} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Warehouse Dispatch Weight (grams)
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 450"
                          value={dispatchWeight}
                          onChange={(e) => setDispatchWeight(e.target.value)}
                          className="mt-1 text-xs rounded-xl bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Scanned Product Barcode / SKU
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. 890123456789"
                          value={barcodeScanned}
                          onChange={(e) => setBarcodeScanned(e.target.value)}
                          className="mt-1 text-xs rounded-xl bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Warehouse Packing CCTV / Photo Proofs
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        <div className="border border-dashed border-slate-300 dark:border-slate-700 p-2.5 rounded-xl text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            id="admin-photos-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && setPackingPhotos(Array.from(e.target.files))}
                          />
                          <label
                            htmlFor="admin-photos-upload"
                            className="cursor-pointer text-xs flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400"
                          >
                            <ImageIcon className="w-5 h-5 text-indigo-500" />
                            <span>{packingPhotos.length > 0 ? `${packingPhotos.length} photos selected` : "Select Packing Photos"}</span>
                          </label>
                        </div>

                        <div className="border border-dashed border-slate-300 dark:border-slate-700 p-2.5 rounded-xl text-center">
                          <input
                            type="file"
                            accept="video/*"
                            id="admin-video-upload"
                            className="hidden"
                            onChange={(e) => e.target.files && setPackingVideo(e.target.files[0] || null)}
                          />
                          <label
                            htmlFor="admin-video-upload"
                            className="cursor-pointer text-xs flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400"
                          >
                            <Video className="w-5 h-5 text-indigo-500" />
                            <span>{packingVideo ? packingVideo.name : "Select Packing Video"}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Warehouse Notes
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Dispatched in original sealed condition, tamper-evident tape applied"
                        value={warehouseNotes}
                        onChange={(e) => setWarehouseNotes(e.target.value)}
                        className="mt-1 text-xs rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isUploadingEvidence}
                      className="w-full rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                    >
                      {isUploadingEvidence ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading Proof & Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Upload Evidence & Run AI Forensic Review
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* STEP 3: Multimodal Gemini AI Forensic Report Card */}
              {selectedClaim.aiAnalysis && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          Multimodal AI Forensic Verdict
                        </h3>
                        <p className="text-[11px] text-purple-700 dark:text-purple-300">
                          Gemini Vision comparative analysis of customer proofs vs warehouse records
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getVerdictBadge(selectedClaim.aiAnalysis.verdict)}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isRunningAiReview}
                        onClick={handleRunAiAnalysis}
                        className="text-xs h-7 px-2 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 rounded-lg"
                      >
                        {isRunningAiReview ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Hindi Summary Banner */}
                  {selectedClaim.aiAnalysis.summaryHindi && (
                    <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-900 dark:text-purple-100 font-semibold text-xs leading-relaxed">
                      🤖 <strong className="underline decoration-purple-400">AI निष्कर्ष (Hindi):</strong>{" "}
                      {selectedClaim.aiAnalysis.summaryHindi}
                    </div>
                  )}

                  {/* Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Confidence Score</span>
                      <p className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                        {selectedClaim.aiAnalysis.confidenceScore}%
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Tape Tampered?</span>
                      <p
                        className={`text-xs font-bold mt-1 ${
                          selectedClaim.aiAnalysis.packagingTapeTampered
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {selectedClaim.aiAnalysis.packagingTapeTampered ? "⚠️ YES (Tampered)" : "✓ NO (Intact)"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Weight Discrepancy?</span>
                      <p
                        className={`text-xs font-bold mt-1 ${
                          selectedClaim.aiAnalysis.weightMismatch
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {selectedClaim.aiAnalysis.weightMismatch ? "⚠️ Discrepancy" : "✓ Matched"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Recommended Action</span>
                      <p className="text-xs font-bold mt-1 text-slate-900 dark:text-white capitalize">
                        {selectedClaim.aiAnalysis.recommendedAction?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  {/* Key Observations */}
                  {selectedClaim.aiAnalysis.keyObservations?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Key Observations:
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {selectedClaim.aiAnalysis.keyObservations.map((obs: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Admin 1-Click Resolution Execution */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Execute Final Resolution
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Resolution Reason / Note to Customer
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Approved 100% refund due to damaged courier parcel"
                      value={resolveReason}
                      onChange={(e) => setResolveReason(e.target.value)}
                      className="mt-1 text-xs rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Refund Amount (₹)
                    </Label>
                    <Input
                      type="number"
                      value={customRefundAmount}
                      onChange={(e) => setCustomRefundAmount(e.target.value)}
                      className="mt-1 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <Button
                    onClick={() => handleExecuteResolution("approved_refund")}
                    disabled={isResolving}
                    className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Approve Refund (Wallet)
                  </Button>

                  <Button
                    onClick={() => handleExecuteResolution("approved_replacement")}
                    disabled={isResolving}
                    className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Approve Replacement
                  </Button>

                  <Button
                    onClick={() => handleExecuteResolution("escalated_to_courier")}
                    disabled={isResolving}
                    className="rounded-xl text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Escalate to Courier
                  </Button>

                  <Button
                    onClick={() => handleExecuteResolution("rejected")}
                    disabled={isResolving}
                    className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Claim
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

