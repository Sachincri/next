"use client";

import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LabelList,
    Tooltip as BarTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Issue {
    status: string;
    priority: string;
    category: string;
}

interface IssuesChartProps {
    data: Issue[];
}

const STATUS_ITEMS = [
    { name: "Closed", color: "#6B7280" },
    { name: "In Progress", color: "#3B82F6" },
    { name: "Pending", color: "#FBBF24" },
    { name: "Resolved", color: "#10B981" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
    Low: "#9ca3af",
    Medium: "#60a5fa",
    High: "#fb923c",
    Urgent: "#ef4444",
};

export const IssuesChart: React.FC<IssuesChartProps> = ({ data }) => {
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {
            Closed: 0,
            "In Progress": 0,
            Pending: 0,
            Resolved: 0,
        };
        data.forEach((item) => {
            if (counts[item.status] !== undefined) {
                counts[item.status]++;
            }
        });
        return STATUS_ITEMS.map((item) => ({
            name: item.name,
            color: item.color,
            value: counts[item.name] || 0,
        }));
    }, [data]);

    const totalTickets = data.length;
    const pendingCount = useMemo(
        () => data.filter((item) => item.status === "Pending").length,
        [data]
    );
    const hasStatusSlices = statusData.some((item) => item.value > 0);
    const pieSeries = hasStatusSlices
        ? statusData.filter((item) => item.value > 0)
        : [{ name: "Empty", value: 1, color: "#e2e8f0" }];

    const priorityData = useMemo(() => {
        const counts: Record<string, number> = {
            Low: 0,
            Medium: 0,
            High: 0,
            Urgent: 0,
        };
        data.forEach((item) => {
            if (counts[item.priority] !== undefined) {
                counts[item.priority]++;
            } else {
                counts[item.priority] = (counts[item.priority] || 0) + 1;
            }
        });
        return Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key],
        }));
    }, [data]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Donut Chart */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-base font-bold">Issues by Status</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-5">
                    <div className="relative h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieSeries}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={68}
                                    paddingAngle={hasStatusSlices ? 4 : 0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieSeries.map((entry, index) => (
                                        <Cell key={`status-cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                {hasStatusSlices && (
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--background)",
                                            borderColor: "var(--border)",
                                            borderRadius: "var(--radius)",
                                            color: "var(--foreground)",
                                            fontSize: "12px",
                                        }}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Centered Total Overlay */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold leading-none text-foreground">
                                {totalTickets}
                            </span>
                            <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                                {totalTickets > 0 && pendingCount > 0
                                    ? `${pendingCount} Pending`
                                    : "Total"}
                            </span>
                        </div>
                    </div>

                    {/* High-contrast Legend */}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                        {statusData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    {entry.name}
                                    <span className="ml-1 text-slate-500 dark:text-slate-400">
                                        ({entry.value})
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Priority Bar Chart */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-base font-bold">Issues by Priority</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 px-5">
                    <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={priorityData}
                                margin={{ top: 20, right: 12, left: -18, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "var(--muted-foreground)" }}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                    tick={{ fill: "var(--muted-foreground)" }}
                                />
                                <BarTooltip
                                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        borderColor: "var(--border)",
                                        borderRadius: "var(--radius)",
                                        color: "var(--foreground)",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="value" maxBarSize={44} radius={[6, 6, 0, 0]}>
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        className="fill-slate-700 dark:fill-slate-200 text-xs font-semibold"
                                    />
                                    {priorityData.map((entry, index) => (
                                        <Cell
                                            key={`priority-cell-${index}`}
                                            fill={PRIORITY_COLORS[entry.name] || "#cbd5e1"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
