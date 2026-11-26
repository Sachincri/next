"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useGetAllSupportRequestsQuery } from "@/redux/api/supportApi";
import { Card } from "@/components/ui/card";
import {
    Loader2,
    Inbox,
    Clock,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

const IssuesTable = dynamic(
    () => import("@/components/admin/issues/IssuesTable").then((mod) => mod.IssuesTable),
    { ssr: false }
);
const IssuesChart = dynamic(
    () => import("@/components/admin/issues/IssuesChart").then((mod) => mod.IssuesChart),
    { ssr: false }
);

export default function IssuesPage() {
    const { data, isLoading } = useGetAllSupportRequestsQuery();
    const issues = data?.data?.requests || [];

    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    const stats = useMemo(() => {
        const total = issues.length;
        const pendingOpen = issues.filter(
            (i: any) => i.status === "Pending"
        ).length;
        const inProgress = issues.filter(
            (i: any) => i.status === "In Progress"
        ).length;
        const highUrgent = issues.filter(
            (i: any) => i.priority === "High" || i.priority === "Urgent"
        ).length;
        const resolved = issues.filter(
            (i: any) => i.status === "Resolved"
        ).length;

        return { total, pendingOpen, inProgress, highUrgent, resolved };
    }, [issues]);

    const kpiCards = [
        {
            key: "total",
            label: "Total Issues",
            value: stats.total,
            sublabel: "All support tickets",
            icon: Inbox,
            active: statusFilter === "All" && priorityFilter === "All",
            containerClass:
                "border-border bg-card hover:bg-muted/40",
            iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
            valueClass: "text-foreground",
            onClick: () => {
                setStatusFilter("All");
                setPriorityFilter("All");
            },
        },
        {
            key: "pending",
            label: "Pending / Open",
            value: stats.pendingOpen,
            sublabel: stats.inProgress > 0 ? `+ ${stats.inProgress} in progress` : "Awaiting reply",
            icon: Clock,
            active: statusFilter === "Pending",
            containerClass:
                "border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 dark:border-amber-900/50 dark:bg-amber-950/20",
            iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400",
            valueClass: "text-amber-800 dark:text-amber-300",
            onClick: () => {
                setPriorityFilter("All");
                setStatusFilter(statusFilter === "Pending" ? "All" : "Pending");
            },
        },
        {
            key: "priority",
            label: "High / Urgent Priority",
            value: stats.highUrgent,
            sublabel: "Needs fast action",
            icon: AlertTriangle,
            active: priorityFilter === "HIGH_URGENT",
            containerClass:
                "border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 dark:border-rose-900/50 dark:bg-rose-950/20",
            iconClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-400",
            valueClass: "text-rose-800 dark:text-rose-300",
            onClick: () => {
                setStatusFilter("All");
                setPriorityFilter(priorityFilter === "HIGH_URGENT" ? "All" : "HIGH_URGENT");
            },
        },
        {
            key: "resolved",
            label: "Resolved",
            value: stats.resolved,
            sublabel: "Completed tickets",
            icon: CheckCircle2,
            active: statusFilter === "Resolved",
            containerClass:
                "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 dark:border-emerald-900/50 dark:bg-emerald-950/20",
            iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400",
            valueClass: "text-emerald-800 dark:text-emerald-300",
            onClick: () => {
                setPriorityFilter("All");
                setStatusFilter(statusFilter === "Resolved" ? "All" : "Resolved");
            },
        },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-5">
            {/* Compact Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Support Issues
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage, prioritize, and resolve customer support requests.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                    <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* 4-Stat Compact Actionable KPI Strip */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {kpiCards.map((kpi) => {
                            const Icon = kpi.icon;
                            return (
                                <button
                                    key={kpi.key}
                                    type="button"
                                    onClick={kpi.onClick}
                                    className="text-left focus:outline-none"
                                >
                                    <Card
                                        className={`px-4 py-3 transition-all cursor-pointer ${kpi.containerClass} ${
                                            kpi.active ? "ring-2 ring-primary/40 shadow-sm" : ""
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {kpi.label}
                                                </p>
                                                <p className={`text-2xl font-bold mt-0.5 leading-tight ${kpi.valueClass}`}>
                                                    {kpi.value}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {kpi.sublabel}
                                                </p>
                                            </div>
                                            <div className={`p-2 rounded-lg shrink-0 ${kpi.iconClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Card>
                                </button>
                            );
                        })}
                    </div>

                    {/* Compact Charts Section */}
                    <IssuesChart data={issues} />

                    {/* Filterable Table Section */}
                    <IssuesTable
                        data={issues}
                        isLoading={isLoading}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        priorityFilter={priorityFilter}
                        onPriorityFilterChange={setPriorityFilter}
                    />
                </>
            )}
        </div>
    );
}
