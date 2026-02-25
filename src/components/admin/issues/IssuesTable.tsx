"use client";

import React, { useState } from "react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, ArrowUpDown } from "lucide-react";
import { useUpdateSupportStatusMutation } from "@/redux/api/supportApi";
import toast from "react-hot-toast";

interface Issue {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    subject: string;
    category: string;
    description: string;
    status: "Pending" | "In Progress" | "Resolved" | "Closed";
    priority: "Low" | "Medium" | "High" | "Urgent";
    createdAt: string;
}

interface IssuesTableProps {
    data: Issue[];
    isLoading: boolean;
}

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-gray-100 text-gray-800",
};

const priorityColors = {
    Low: "bg-gray-100 text-gray-800",
    Medium: "bg-blue-100 text-blue-800",
    High: "bg-orange-100 text-orange-800",
    Urgent: "bg-red-100 text-red-800",
};

export const IssuesTable: React.FC<IssuesTableProps> = ({ data, isLoading }) => {
    const [updateStatus, { isLoading: isUpdating }] = useUpdateSupportStatusMutation();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateStatus({ id, status: newStatus }).unwrap();
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handlePriorityUpdate = async (id: string, newPriority: string) => {
        try {
            await updateStatus({ id, priority: newPriority }).unwrap();
            toast.success(`Priority updated to ${newPriority}`);
        } catch (error) {
            toast.error("Failed to update priority");
        }
    };


    const sortedData = React.useMemo(() => {
        let sortableItems = [...(data || [])];
        if (sortConfig !== null) {
            sortableItems.sort((a: any, b: any) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }

                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };



    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
                <p className="text-sm text-muted-foreground">View and manage latest support requests</p>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px] cursor-pointer" onClick={() => requestSort('createdAt')}>
                                    Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>
                                    Category <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.length > 0 ? (
                                sortedData.map((issue) => (
                                    <TableRow key={issue._id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium text-xs text-muted-foreground">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{issue.user?.name || "Unknown"}</span>
                                                <span className="text-xs text-muted-foreground">{issue.user?.email || "No email"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate font-medium" title={issue.subject}>
                                                {issue.subject}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {issue.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`font-medium ${statusColors[issue.status]}`}>
                                                {issue.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`font-medium ${priorityColors[issue.priority]}`}>
                                                {issue.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {["Pending", "In Progress", "Resolved", "Closed"].map((s) => (
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
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No issues found.
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
