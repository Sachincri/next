"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  Building2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAdminPrivacyOverviewQuery,
  useUpdateAdminDataRequestMutation,
} from "@/redux/api/privacyApi";

interface PrivacyRequestsPanelProps {
  formData: {
    showCookieBanner: boolean;
    grievanceOfficerName: string;
    grievanceOfficerEmail: string;
    grievanceOfficerPhone: string;
    dpdpPolicyVersion: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (id: string, checked: boolean) => void;
  onSaveSettings: () => Promise<void>;
  isSavingSettings: boolean;
}

export default function PrivacyRequestsPanel({
  formData,
  onInputChange,
  onSwitchChange,
  onSaveSettings,
  isSavingSettings,
}: PrivacyRequestsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [adminNotesById, setAdminNotesById] = useState<Record<string, string>>({});

  const { data: overview, isLoading } = useGetAdminPrivacyOverviewQuery(
    statusFilter === "all" ? undefined : { status: statusFilter }
  );
  const [updateRequest, { isLoading: updatingReq }] = useUpdateAdminDataRequestMutation();

  const summary = overview?.summary || {
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    totalRequests: 0,
  };
  const requests = overview?.requests || [];
  const usersSummary = overview?.usersSummary || [];

  const handleResolve = async (
    id: string,
    status: "pending" | "in_progress" | "completed" | "rejected"
  ) => {
    try {
      const notes = adminNotesById[id];
      const res = await updateRequest({ id, status, adminNotes: notes }).unwrap();
      toast.success(res?.message || `Request marked as ${status.replace("_", " ")}`);
      setActiveNoteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update request");
    }
  };

  return (
    <div className="space-y-6">
      {/* Grievance Officer Config Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                DPDP Compliance, Cookie Banner &amp; Grievance Officer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Published live on your public{" "}
                <Link href="/privacy-policy" target="_blank" className="text-indigo-600 underline inline-flex items-center gap-1">
                  Privacy Notice <ExternalLink className="w-3 h-3" />
                </Link>{" "}
                page per India DPDP Rules (2025).
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void onSaveSettings()}
              disabled={isSavingSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0"
            >
              {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Save DPDP Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Cookie Consent Banner Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="space-y-1">
              <Label htmlFor="showCookieBanner" className="text-sm font-semibold cursor-pointer">
                Show Cookie Consent Banner (DPDP Act)
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enable this when using analytics/marketing cookies or when DPDP cookie banner enforcement begins. Login, Checkout, and Footer privacy controls remain active even when OFF.
              </p>
            </div>
            <Switch
              id="showCookieBanner"
              checked={Boolean(formData.showCookieBanner)}
              onCheckedChange={(checked) => onSwitchChange("showCookieBanner", checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grievanceOfficerName">Grievance Officer Name</Label>
              <Input
                id="grievanceOfficerName"
                value={formData.grievanceOfficerName}
                onChange={onInputChange}
                placeholder="Data Protection & Grievance Officer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grievanceOfficerEmail">Grievance Officer Email</Label>
              <Input
                id="grievanceOfficerEmail"
                type="email"
                value={formData.grievanceOfficerEmail}
                onChange={onInputChange}
                placeholder="privacy@yourstore.in"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grievanceOfficerPhone">Contact Phone (Optional)</Label>
              <Input
                id="grievanceOfficerPhone"
                value={formData.grievanceOfficerPhone}
                onChange={onInputChange}
                placeholder="+91 98XXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpdpPolicyVersion">Policy Version</Label>
              <Input
                id="dpdpPolicyVersion"
                value={formData.dpdpPolicyVersion}
                onChange={onInputChange}
                placeholder="v1.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Pending Requests</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{summary.pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Completed / Resolved</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Tracked Customers</div>
            <div className="text-2xl font-bold mt-1">{usersSummary.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Requests Queue */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Data Access, Deletion &amp; Grievance Requests
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Completing a Deletion request automatically anonymizes personal PII while preserving GST tax invoices.
              </p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading DPDP requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No privacy or data requests match the selected filter.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req: any) => {
                const u = req.userId || {};
                const isPending = req.status === "pending" || req.status === "in_progress";
                return (
                  <div
                    key={req._id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={req.type === "deletion" ? "destructive" : "outline"} className="capitalize">
                            {req.type}
                          </Badge>
                          <span className="font-semibold text-sm">
                            {req.subject || "Privacy Request"}
                          </span>
                          <Badge
                            variant={req.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {req.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Customer: <strong>{u.name || "User"}</strong> ({u.email || "N/A"})
                          {u.isAnonymized && " • [Anonymized]"}
                          {" • "}Submitted {new Date(req.createdAt).toLocaleString("en-IN")}
                        </div>
                        {req.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                            {req.notes}
                          </p>
                        )}
                        {req.adminNotes && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">
                            Resolution Note: {req.adminNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isPending && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={updatingReq}
                              onClick={() => setActiveNoteId(activeNoteId === req._id ? null : req._id)}
                              className="text-xs"
                            >
                              Add Note
                            </Button>
                            {req.status === "pending" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={updatingReq}
                                onClick={() => void handleResolve(req._id, "in_progress")}
                                className="text-xs"
                              >
                                Mark In Progress
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              disabled={updatingReq}
                              onClick={() => void handleResolve(req._id, "completed")}
                              className={
                                req.type === "deletion"
                                  ? "bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                              }
                            >
                              {req.type === "deletion" ? (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" /> Approve &amp; Anonymize
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={updatingReq}
                              onClick={() => void handleResolve(req._id, "rejected")}
                              className="text-xs text-rose-600 hover:text-rose-700"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {activeNoteId === req._id && (
                      <div className="pt-2 border-t flex flex-col sm:flex-row gap-2">
                        <Textarea
                          value={adminNotesById[req._id] ?? req.adminNotes ?? ""}
                          onChange={(e) =>
                            setAdminNotesById((prev) => ({ ...prev, [req._id]: e.target.value }))
                          }
                          placeholder="Add resolution note for compliance audit log..."
                          className="min-h-[60px] text-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Consent Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Customer Consent Status Directory
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Live Email, WhatsApp, Analytics, and Privacy Notice consent status enforced across campaigns.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Privacy Notice</th>
                  <th className="py-2.5 px-3">Email Marketing</th>
                  <th className="py-2.5 px-3">WhatsApp</th>
                  <th className="py-2.5 px-3">Analytics</th>
                  <th className="py-2.5 px-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersSummary.slice(0, 25).map((u: any) => {
                  const c = u.consentPreferences || {};
                  return (
                    <tr key={u._id} className="hover:bg-muted/30">
                      <td className="py-2.5 px-3">
                        <div className="font-medium flex items-center gap-1.5">
                          {u.name}
                          {u.isAnonymized && (
                            <Badge variant="destructive" className="text-[10px]">Anonymized</Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={c.privacyNoticeAccepted ? "default" : "secondary"} className="text-[10px]">
                          {c.privacyNoticeAccepted ? "Accepted" : "Legacy / Unset"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={c.emailMarketing === false ? "outline" : c.emailMarketing ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {c.emailMarketing ? "Opted In" : c.emailMarketing === false ? "Opted Out" : "Not Set"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={c.whatsappMarketing === false ? "outline" : c.whatsappMarketing ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {c.whatsappMarketing ? "Opted In" : c.whatsappMarketing === false ? "Opted Out" : "Not Set"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium">
                          {c.analytics ? "Granted" : "Blocked"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
