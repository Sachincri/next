"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetRealtimeAnalyticsQuery } from "@/redux/api/adminApi";
import { Loader2, Users, Globe } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function GoogleAnalytics() {
    const { data, isLoading, error } = useGetRealtimeAnalyticsQuery(undefined, {
        pollingInterval: 60000 // Poll every minute
    });

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const activeUsers = data?.totalActiveUsers || 0;
    const countryData = data?.countryData || [];

    const chartData = countryData
        .slice(0, 10) // Top 10
        .sort((a: any, b: any) => b.activeUsers - a.activeUsers);

    // If no data or not configured
    if (error || (countryData.length === 0 && activeUsers === 0)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Realtime Traffic
                    </CardTitle>
                    <CardDescription>Connect Google Analytics in Settings to see realtime data.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Realtime Counter */}
            <Card className="col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-blue-100 font-medium text-sm uppercase tracking-wider">
                        Active Users Right Now
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                        <Users className="w-16 h-16 mb-4 text-blue-200 opacity-80" />
                        <div className="text-6xl font-bold tracking-tighter">
                            {activeUsers}
                        </div>
                        <p className="text-blue-200 mt-2 text-sm animate-pulse">
                            Live from Google Analytics
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Traffic by Country Map/Chart */}
            <Card className="col-span-5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Traffic by Location
                    </CardTitle>
                    <CardDescription>Top countries visiting your store right now</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="country"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="activeUsers" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(221, 83%, ${53 + (index * 4)}%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
