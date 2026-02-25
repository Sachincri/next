"use client";

import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
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

const STATUS_COLORS = {
    Pending: "#FBBF24",     // Yellow
    "In Progress": "#3B82F6",// Blue
    Resolved: "#10B981",    // Green
    Closed: "#6B7280",      // Gray
};

const PRIORITY_COLORS = {
    Low: "#9ca3af",
    Medium: "#60a5fa",
    High: "#fb923c",
    Urgent: "#ef4444"
}

export const IssuesChart: React.FC<IssuesChartProps> = ({ data }) => {
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {
            Pending: 0,
            "In Progress": 0,
            Resolved: 0,
            Closed: 0,
        };
        data.forEach((item) => {
            if (counts[item.status] !== undefined) {
                counts[item.status]++;
            }
        });
        return Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key],
        }));
    }, [data]);

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
                // Handle case where defaults might differ or data is missing
                if (!counts[item.priority]) counts[item.priority] = 1;
                else counts[item.priority]++;
            }
        });
        return Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key],
        }));
    }, [data]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Status Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Issues by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || "#cbd5e1"}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        borderColor: "var(--border)",
                                        borderRadius: "var(--radius)",
                                        color: "var(--foreground)"
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Priority Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Issues by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                />
                                <BarTooltip
                                    cursor={{ fill: 'var(--muted)' }}
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        borderColor: "var(--border)",
                                        borderRadius: "var(--radius)",
                                        color: "var(--foreground)"
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || "#cbd5e1"} />
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
