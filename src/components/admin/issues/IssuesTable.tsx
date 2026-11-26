"use client";

import React, { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Loader2,
    ArrowUpDown,
    Eye,
    Search,
    ChevronDown,
    X,
} from "lucide-react";
import Link from "next/link";
import { useUpdateSupportStatusMutation } from "@/redux/api/supportApi";
import toast from "react-hot-toast";

export type IssueStatus = "Pending" | "In Progress" | "Resolved" | "Closed";
export type IssuePriority = "Low" | "Medium" | "High" | "Urgent";

interface Issue {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    subject: string;
    category: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    createdAt: string;
}

interface IssuesTableProps {
    data: Issue[];
    isLoading: boolean;
    statusFilter?: string;
    onStatusFilterChange?: (status: string) => void;
    priorityFilter?: string;
    onPriorityFilterChange?: (priority: string) => void;
}

const STATUS_OPTIONS: IssueStatus[] = ["Pending", "In Progress", "Resolved", "Closed"];
const PRIORITY_OPTIONS: IssuePriority[] = ["Urgent", "High", "Medium", "Low"];

const statusColors: Record<IssueStatus, string> = {
    Pending: "bg-amber-100 text-amber-800 hover:bg-amber-200/80 border-amber-200",
    "In Progress": "bg-blue-100 text-blue-800 hover:bg-blue-200/80 border-blue-200",
    Resolved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80 border-emerald-200",
    Closed: "bg-slate-100 text-slate-800 hover:bg-slate-200/80 border-slate-200",
};

const priorityColors: Record<IssuePriority, string> = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-blue-100 text-blue-800",
    High: "bg-orange-100 text-orange-800",
    Urgent: "bg-red-100 text-red-800",
};

export const IssuesTable: React.FC<IssuesTableProps> = ({
    data,
    isLoading,
    statusFilter: controlledStatusFilter,
    onStatusFilterChange,
    priorityFilter: controlledPriorityFilter,
    onPriorityFilterChange,
}) => {
    const [updateStatus] = useUpdateSupportStatusMutation();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [internalStatusFilter, setInternalStatusFilter] = useState("All");
    const [internalPriorityFilter, setInternalPriorityFilter] = useState("All");
    const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

    const statusFilter = controlledStatusFilter ?? internalStatusFilter;
    const setStatusFilter = onStatusFilterChange ?? setInternalStatusFilter;
    const priorityFilter = controlledPriorityFilter ?? internalPriorityFilter;
    const setPriorityFilter = onPriorityFilterChange ?? setInternalPriorityFilter;

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { All: (data || []).length };
        STATUS_OPTIONS.forEach((s) => {
            counts[s] = 0;
        });
        (data || []).forEach((item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
        });
        return counts;
    }, [data]);

    const filteredAndSortedData = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const filtered = (data || []).filter((issue) => {
            if (statusFilter !== "All" && issue.status !== statusFilter) {
                return false;
            }
            if (priorityFilter === "HIGH_URGENT") {
                if (issue.priority !== "High" && issue.priority !== "Urgent") {
                    return false;
                }
            } else if (priorityFilter !== "All" && issue.priority !== priorityFilter) {
                return false;
            }
            if (q) {
                const name = (issue.user?.name || "").toLowerCase();
                const email = (issue.user?.email || "").toLowerCase();
                const subject = (issue.subject || "").toLowerCase();
                const category = (issue.category || "").toLowerCase();
                if (
                    !name.includes(q) &&
                    !email.includes(q) &&
                    !subject.includes(q) &&
                    !category.includes(q)
                ) {
                    return false;
                }
            }
            return true;
        });

        if (sortConfig === null) {
            return filtered;
        }

        return [...filtered].sort((a: any, b: any) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });
    }, [data, searchQuery, statusFilter, priorityFilter, sortConfig]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingTicketId(id);
        try {
            await updateStatus({ id, status: newStatus }).unwrap();
            toast.success(`Ticket status updated to ${newStatus}`);
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdatingTicketId(null);
        }
    };

    const handlePriorityUpdate = async (id: string, newPriority: string) => {
        setUpdatingTicketId(id);
        try {
            await updateStatus({ id, priority: newPriority }).unwrap();
            toast.success(`Priority updated to ${newPriority}`);
        } catch {
            toast.error("Failed to update priority");
        } finally {
            setUpdatingTicketId(null);
        }
    };

    const requestSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const hasActiveFilters =
        searchQuery.trim() !== "" || statusFilter !== "All" || priorityFilter !== "All";

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("All");
        setPriorityFilter("All");
    };

    return (
        <Card>
            <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="text-lg">Recent Tickets</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            View, filter, and update customer support requests inline
                        </p>
                    </div>

                    {/* Search & Priority Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name, email, or subject..."
                                className="pl-8 h-9 text-sm"
                            />
                        </div>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="h-9 w-[150px] text-sm">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Priorities</SelectItem>
                                <SelectItem value="HIGH_URGENT">High / Urgent</SelectItem>
                                {PRIORITY_OPTIONS.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-9 px-2.5 text-xs text-muted-foreground"
                            >
                                <X className="w-3.5 h-3.5 mr-1" /> Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Quick Status Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {["All", ...STATUS_OPTIONS].map((status) => {
                        const active = statusFilter === status;
                        return (
                            <Button
                                key={status}
                                type="button"
                                size="sm"
                                variant={active ? "default" : "outline"}
                                onClick={() => setStatusFilter(status)}
                                className="h-7 px-2.5 text-xs rounded-full gap-1.5"
                            >
                                <span>{status}</span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                        active
                                            ? "bg-primary-foreground/20 text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {statusCounts[status] ?? 0}
                                </span>
                            </Button>
                        );
                    })}
                </div>
            </CardHeader>

            <CardContent className="px-5 pb-5">
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead
                                    className="w-[100px] cursor-pointer whitespace-nowrap"
                                    onClick={() => requestSort("createdAt")}
                                >
                                    Date <ArrowUpDown className="ml-1 h-3.5 w-3.5 inline" />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead
                                    className="cursor-pointer whitespace-nowrap"
                                    onClick={() => requestSort("category")}
                                >
                                    Category <ArrowUpDown className="ml-1 h-3.5 w-3.5 inline" />
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedData.length > 0 ? (
                                filteredAndSortedData.map((issue) => (
                                    <TableRow key={issue._id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(issue.createdAt).toLocaleDateString("en-IN")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">
                                                    {issue.user?.name || "Unknown"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {issue.user?.email || "No email"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/admin/issues/${issue._id}`}
                                                className="max-w-[220px] truncate font-medium hover:text-indigo-600 hover:underline block"
                                                title={issue.subject}
                                            >
                                                {issue.subject}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal whitespace-nowrap">
                                                {issue.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild disabled={updatingTicketId === issue._id}>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center focus:outline-none"
                                                        title="Click to change status"
                                                    >
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-medium cursor-pointer border gap-1 transition-colors ${statusColors[issue.status] || ""}`}
                                                        >
                                                            {updatingTicketId === issue._id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : null}
                                                            {issue.status}
                                                            <ChevronDown className="w-3 h-3 opacity-75" />
                                                        </Badge>
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuLabel className="text-xs">
                                                        Quick Status Update
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            onClick={() => handleStatusUpdate(issue._id, s)}
                                                            disabled={issue.status === s}
                                                            className="cursor-pointer"
                                                        >
                                                            {s}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={`font-medium ${priorityColors[issue.priority] || ""}`}
                                            >
                                                {issue.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="h-8 px-2.5 text-xs rounded-xl gap-1"
                                                >
                                                    <Link href={`/admin/issues/${issue._id}`}>
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/admin/issues/${issue._id}`}
                                                                className="flex items-center gap-2 cursor-pointer font-semibold text-indigo-600"
                                                            >
                                                                <Eye className="w-4 h-4" /> View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <DropdownMenuItem
                                                                key={s}
                                                                onClick={() => handleStatusUpdate(issue._id, s)}
                                                                disabled={issue.status === s}
                                                            >
                                                                Mark as {s}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Update Priority</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {["Low", "Medium", "High", "Urgent"].map((p) => (
                                                            <DropdownMenuItem
                                                                key={p}
                                                                onClick={() => handlePriorityUpdate(issue._id, p)}
                                                                disabled={issue.priority === p}
                                                            >
                                                                Set {p}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                        {hasActiveFilters
                                            ? "No matching support tickets found for the selected filters."
                                            : "No support issues found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
