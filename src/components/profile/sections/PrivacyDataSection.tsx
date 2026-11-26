"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Download,
  Trash2,
  Mail,
  MessageSquare,
  Cookie,
  Loader2,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetMyPrivacyDataQuery,
  useUpdateMarketingConsentMutation,
  useLazyExportMyDataQuery,
  useSubmitDataRequestMutation,
} from "@/redux/api/privacyApi";
import { useCookieConsent } from "@/components/privacy/CookieConsentContext";
import { useAppDispatch } from "@/redux/hooks";
import { apiSlice } from "@/redux/api/apiSlice";

export default function PrivacyDataSection() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { openPreferences } = useCookieConsent();

  const { data: privacyData, isLoading } = useGetMyPrivacyDataQuery();
  const [updateMarketing, { isLoading: updatingMarketing }] = useUpdateMarketingConsentMutation();
  const [triggerExport, { isFetching: exporting }] = useLazyExportMyDataQuery();
  const [submitDataRequest, { isLoading: submittingRequest }] = useSubmitDataRequestMutation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"immediate" | "review">("immediate");
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmWord, setConfirmWord] = useState("");

  const [requestType, setRequestType] = useState<"access" | "correction" | "grievance">("correction");
  const [requestSubject, setRequestSubject] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  const prefs = privacyData?.consentPreferences || {};
  const consentLogs = privacyData?.consentLogs || [];
  const dataRequests = privacyData?.dataRequests || [];

  const handleToggleMarketing = async (field: "emailMarketing" | "whatsappMarketing", checked: boolean) => {
    try {
      await updateMarketing({ [field]: checked }).unwrap();
      toast.success(
        `${field === "emailMarketing" ? "Email" : "WhatsApp"} marketing preference ${
          checked ? "enabled" : "withdrawn"
        }.`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update marketing preference");
    }
  };

  const handleDownloadData = async () => {
    try {
      const data = await triggerExport().unwrap();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `my-dpdp-personal-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Your personal data JSON file is downloading.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to export personal data");
    }
  };

  const handleSubmitGeneralRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim()) {
      toast.error("Please enter a brief subject for your request");
      return;
    }
    try {
      await submitDataRequest({
        type: requestType,
        subject: requestSubject.trim(),
        notes: requestNotes.trim(),
      }).unwrap();
      toast.success("Your DPDP data request has been logged for our Grievance Officer.");
      setRequestSubject("");
      setRequestNotes("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit privacy request");
    }
  };

  const handleConfirmDeletion = async () => {
    if (confirmWord.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      const res = await submitDataRequest({
        type: "deletion",
        subject: "Customer Account & Personal Data Deletion",
        notes: deleteReason.trim(),
        immediateAnonymization: deleteMode === "immediate",
      }).unwrap();

      setIsDeleteModalOpen(false);
      setConfirmWord("");
      setDeleteReason("");

      const anonymized = res?.data?.anonymized;
      if (anonymized) {
        toast.success("Your personal data has been anonymized. Mandatory GST records remain preserved.");
        dispatch(apiSlice.util.resetApiState());
        router.push("/");
        window.location.href = "/";
      } else {
        toast.success("Your deletion request has been queued and all marketing consent withdrawn.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process deletion request");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading Privacy &amp; Data controls...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Privacy &amp; Data Controls (DPDP Act)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage marketing permissions, export your data in JSON, or exercise your Right to Erasure.{" "}
            <Link href="/privacy-policy" className="text-indigo-600 underline font-medium">
              Read Privacy Notice
            </Link>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={openPreferences}
          className="gap-1.5 text-xs font-semibold shrink-0"
        >
          <Cookie className="h-4 w-4" />
          Cookie Preferences
        </Button>
      </div>

      {/* 1. Marketing Consent Toggles */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Manage Marketing Consent
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              1-click changes take effect immediately across Smart Campaigns and are logged with timestamps.
            </p>
          </div>
          {updatingMarketing && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <Label htmlFor="dpdp-email-marketing" className="text-sm font-semibold cursor-pointer">
                  Email Campaigns &amp; Offers
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Promotional emails &amp; newsletters. Transactional order alerts are unaffected.
                </p>
              </div>
            </div>
            <Switch
              id="dpdp-email-marketing"
              checked={Boolean(prefs.emailMarketing)}
              disabled={updatingMarketing}
              onCheckedChange={(checked) => void handleToggleMarketing("emailMarketing", checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <Label htmlFor="dpdp-wa-marketing" className="text-sm font-semibold cursor-pointer">
                  WhatsApp Promotional Updates
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Promotional broadcast alerts on WhatsApp. Delivery tracking remains active.
                </p>
              </div>
            </div>
            <Switch
              id="dpdp-wa-marketing"
              checked={Boolean(prefs.whatsappMarketing)}
              disabled={updatingMarketing}
              onCheckedChange={(checked) => void handleToggleMarketing("whatsappMarketing", checked)}
            />
          </div>
        </div>
      </div>

      {/* 2. Download My Data & Account Deletion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
              <Download className="h-4 w-4 text-indigo-600" />
              Download My Data (Right to Access)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download a structured <code className="font-mono">.json</code> copy of your profile details, saved addresses, order history, and consent audit logs.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={exporting}
            onClick={() => void handleDownloadData()}
            className="w-full gap-2 text-xs font-semibold"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download My Data (.json)
          </Button>
        </div>

        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-rose-700 dark:text-rose-400">
              <Trash2 className="h-4 w-4" />
              Request Account &amp; Data Deletion
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Permanently erase or anonymize your personal profile and withdraw all marketing permissions while preserving GST/tax invoice records required by Indian law.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full gap-2 text-xs font-semibold"
          >
            <Trash2 className="h-4 w-4" />
            Request Account &amp; Data Deletion
          </Button>
        </div>
      </div>

      {/* 3. Submit Correction / Access / Grievance Request */}
      <form
        onSubmit={handleSubmitGeneralRequest}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Submit a Correction, Access, or Grievance Request
          </h3>
          <p className="text-xs text-slate-500">
            Track requests handled directly by our Grievance Officer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dpdp-req-type" className="text-xs">Request Type</Label>
            <Select
              value={requestType}
              onValueChange={(v) => setRequestType(v as "access" | "correction" | "grievance")}
            >
              <SelectTrigger id="dpdp-req-type" className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="correction">Data Correction</SelectItem>
                <SelectItem value="access">Additional Data Access</SelectItem>
                <SelectItem value="grievance">Privacy Grievance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="dpdp-req-subject" className="text-xs">Subject</Label>
            <Input
              id="dpdp-req-subject"
              value={requestSubject}
              onChange={(e) => setRequestSubject(e.target.value)}
              placeholder="e.g. Correct invoice contact detail or grievance summary"
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dpdp-req-notes" className="text-xs">Details (Optional)</Label>
          <Textarea
            id="dpdp-req-notes"
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            placeholder="Describe what data should be corrected or reviewed..."
            className="min-h-[70px] text-xs"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submittingRequest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            {submittingRequest && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Submit Privacy Request
          </Button>
        </div>
      </form>

      {/* 4. Data Requests Status List & Consent Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            My Privacy Requests ({dataRequests.length})
          </h3>
          {dataRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No data requests submitted yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {dataRequests.map((req: any) => (
                <div key={req._id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {req.type} — {req.subject || "Privacy Request"}
                    </span>
                    <Badge
                      variant={req.status === "completed" ? "default" : "secondary"}
                      className="text-[10px] capitalize"
                    >
                      {req.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {req.notes && <p className="text-slate-500">{req.notes}</p>}
                  {req.adminNotes && (
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Officer Note: {req.adminNotes}
                    </p>
                  )}
                  <div className="text-[10px] text-slate-400">
                    Submitted {new Date(req.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Recent Consent Audit Log
          </h3>
          {consentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No consent events logged yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {consentLogs.slice(0, 12).map((log: any) => (
                <div key={log._id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 text-xs">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {String(log.purpose).replace(/_/g, " ")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      via {log.source} • {log.policyVersion} • {new Date(log.timestamp).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {log.status === "granted" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Granted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <XCircle className="h-3 w-3" /> Withdrawn
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900 border border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
              Confirm Account &amp; Personal Data Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed">
              Your personal name, email, phone number, saved addresses, and marketing permissions will be anonymized/erased. Under Indian GST law, financial tax invoices and order totals remain retained strictly for statutory compliance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Processing Mode</Label>
              <Select value={deleteMode} onValueChange={(v) => setDeleteMode(v as "immediate" | "review")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate Self-Service Anonymization (Recommended)</SelectItem>
                  <SelectItem value="review">Queue Request for Grievance Officer Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delete-reason" className="text-xs">Reason (Optional)</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Tell us if there is anything we could improve..."
                className="min-h-[60px] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-delete-word" className="text-xs font-semibold">
                Type <span className="font-mono text-rose-600">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete-word"
                value={confirmWord}
                onChange={(e) => setConfirmWord(e.target.value)}
                placeholder="DELETE"
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={submittingRequest || confirmWord.trim().toUpperCase() !== "DELETE"}
              onClick={() => void handleConfirmDeletion()}
              className="text-xs font-semibold"
            >
              {submittingRequest && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Confirm Erasure Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
