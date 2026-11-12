"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetSupportRequestDetailsQuery,
  useUpdateSupportStatusMutation,
  useReplyToSupportRequestMutation,
} from "@/redux/api/supportApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  Sparkles,
  ShieldAlert,
  Calendar,
  Tag,
  FileText,
  CornerDownRight,
  Headphones,
} from "lucide-react";

const statusConfig = {
  Pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
  },
  "In Progress": {
    label: "In Progress",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    dot: "bg-blue-500",
  },
  Resolved: {
    label: "Resolved",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  Closed: {
    label: "Closed",
    color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
    dot: "bg-slate-500",
  },
};

const priorityConfig = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  Medium: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  High: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Urgent: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse",
};

export default function IssueDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const issueId = params?.id as string;

  const [replyMessage, setReplyMessage] = useState("");
  const [markResolvedOnReply, setMarkResolvedOnReply] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data, isLoading, error, refetch } = useGetSupportRequestDetailsQuery(issueId, {
    skip: !issueId,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSupportStatusMutation();
  const [sendReply, { isLoading: isSendingReply }] = useReplyToSupportRequestMutation();

  const issue = data?.data?.request;

  React.useEffect(() => {
    if (issue?.adminNotes) {
      setAdminNotes(issue.adminNotes);
    }
  }, [issue?.adminNotes]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading support issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Issue Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested support ticket could not be found or you don't have permission to view it.
        </p>
        <Button onClick={() => router.push("/admin/issues")} variant="outline" className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Issues
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ id: issueId, status: newStatus }).unwrap();
      toast.success(`Ticket marked as ${newStatus}`);
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateStatus({ id: issueId, priority: newPriority }).unwrap();
      toast.success(`Priority updated to ${newPriority}`);
      refetch();
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateStatus({ id: issueId, adminNotes }).unwrap();
      toast.success("Admin notes saved successfully");
      refetch();
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    try {
      await sendReply({
        id: issueId,
        message: replyMessage,
        status: markResolvedOnReply ? "Resolved" : undefined,
      }).unwrap();

      toast.success("Reply sent and customer notified!");
      setReplyMessage("");
      refetch();
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const isAiEscalated = issue.description?.includes("Customer Chat Session:") || issue.subject?.includes("AI Chat Escalation");

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/issues")}
            className="rounded-xl text-xs h-9 px-3 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400">
                #{String(issue._id).slice(-8).toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  statusConfig[issue.status as keyof typeof statusConfig]?.color || "bg-slate-100 text-slate-800"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusConfig[issue.status as keyof typeof statusConfig]?.dot || "bg-current"
                  }`}
                />
                {issue.status}
              </span>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  priorityConfig[issue.priority as keyof typeof priorityConfig] || ""
                }`}
              >
                {issue.priority} Priority
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {issue.subject}
            </h1>
          </div>
        </div>

        {/* Quick Status / Priority Dropdowns */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <select
            value={issue.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Pending">Mark: Pending</option>
            <option value="In Progress">Mark: In Progress</option>
            <option value="Resolved">Mark: Resolved</option>
            <option value="Closed">Mark: Closed</option>
          </select>

          <select
            value={issue.priority}
            disabled={isUpdating}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Low">Priority: Low</option>
            <option value="Medium">Priority: Medium</option>
            <option value="High">Priority: High</option>
            <option value="Urgent">Priority: Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Issue details, AI Context, Conversation thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Escalation Banner if triggered by RAG Agent */}
          {isAiEscalated && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  AI Agent Auto-Escalation
                  <Badge variant="outline" className="text-[10px] font-bold border-purple-400 text-purple-600 dark:text-purple-300">
                    Grounded RAG Pipeline
                  </Badge>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  This support ticket was autonomously generated by Aura AI Concierge because the customer showed frustration or requested direct human intervention.
                </p>
              </div>
            </div>
          )}

          {/* Initial Ticket Inquiry Card */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 py-3.5 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-indigo-500" /> Customer Inquiry Details
                </CardTitle>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(issue.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    Category: {issue.category}
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {issue.description}
                  </p>
                </div>

                {issue.attachments && issue.attachments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Attached Files:</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.attachments.map((file: string, idx: number) => (
                        <a
                          key={idx}
                          href={file}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg hover:underline flex items-center gap-1"
                        >
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conversation Thread / Response History */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Conversation Thread ({issue.responses?.length || 0} Replies)
            </h3>

            {issue.responses && issue.responses.length > 0 ? (
              <div className="space-y-3">
                {issue.responses.map((resp: any, i: number) => {
                  const isAdmin = resp.senderRole === "admin";
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAdmin
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40 ml-4 sm:ml-8"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 mr-4 sm:mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              isAdmin
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {isAdmin ? <Headphones className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {resp.senderName}
                          </span>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {resp.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(resp.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-8">
                        {resp.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500">No replies yet. Send a response to the customer below.</p>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                  Reply to Customer
                </label>
                <Textarea
                  rows={4}
                  placeholder="Type your resolution, guidance, or update for the customer..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={markResolvedOnReply}
                      onChange={(e) => setMarkResolvedOnReply(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Mark ticket as Resolved when sending reply
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={isSendingReply}
                    className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 ml-auto"
                  >
                    {isSendingReply ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Send Reply & Notify Customer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Info & Internal Notes */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <User className="w-4 h-4 text-indigo-500" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center justify-center flex-shrink-0">
                  {issue.user?.name ? issue.user.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {issue.user?.name || "Customer"}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    User ID: {String(issue.user?._id || issue.user).slice(-8)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a
                    href={`mailto:${issue.user?.email}`}
                    className="hover:text-indigo-600 truncate font-medium"
                  >
                    {issue.user?.email || "No email available"}
                  </a>
                </div>

                {issue.user?.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{issue.user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>
                    Created:{" "}
                    {new Date(issue.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Staff Notes Card */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Internal Staff Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-xs">
              <p className="text-[11px] text-slate-400 leading-normal">
                Private notes visible only to store administrators and agents.
              </p>
              <Textarea
                rows={3}
                placeholder="Add private observations, order references, or team comments..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={isUpdating}
                className="w-full rounded-xl text-xs"
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

