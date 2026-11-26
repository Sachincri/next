"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, X, Plus, Loader2, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import type { AnalyticsOverviewData } from "@/types/admin";
import {
  CURRENCY_METRICS,
  formatAxisDate,
  formatCompactINR,
  formatTooltipValueWithDate,
} from "@/lib/analytics-utils";

const availableMetrics = [
  { id: "revenue", label: "Revenue", color: "#3b82f6" },
  { id: "orders", label: "Orders", color: "#10b981" },
  { id: "aov", label: "Average Order Value", color: "#8b5cf6" },
];

const availableDimensions = [{ id: "date", label: "Date" }];

const SAVED_REPORT_STORAGE_KEY = "admin_analytics_report_config";

interface ReportBuilderProps {
  overview?: AnalyticsOverviewData;
  isLoading?: boolean;
  onResetRange?: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string; name?: string; value?: number; color?: string }>;
  label?: string;
}

function ReportChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs space-y-1.5">
      {payload.map((entry) => {
        const key = String(entry.dataKey || "");
        const metricLabel =
          availableMetrics.find((m) => m.id === key)?.label || entry.name || key;
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color || "#3b82f6" }}
            />
            <span className="text-muted-foreground">{metricLabel}:</span>
            <span className="font-semibold text-foreground">
              {formatTooltipValueWithDate(key, entry.value ?? 0, label)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportBuilder({
  overview,
  isLoading = false,
  onResetRange,
}: ReportBuilderProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["revenue"]);
  const [selectedDimension, setSelectedDimension] = useState("date");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_REPORT_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.selectedMetrics) && parsed.selectedMetrics.length > 0) {
        const valid = parsed.selectedMetrics.filter((id: string) =>
          availableMetrics.some((m) => m.id === id)
        );
        if (valid.length > 0) setSelectedMetrics(valid);
      }
      if (parsed.chartType === "line" || parsed.chartType === "bar") {
        setChartType(parsed.chartType);
      }
    } catch {
      // Ignore invalid localStorage payload
    }
  }, []);

  const chartData = useMemo(() => {
    return (overview?.series || []).map((item) => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders,
      aov:
        item.aov ??
        (item.orders > 0 ? parseFloat((item.revenue / item.orders).toFixed(2)) : 0),
    }));
  }, [overview]);

  const hasCurrencyMetric = selectedMetrics.some((m) => CURRENCY_METRICS.has(m));
  const hasCountMetric = selectedMetrics.includes("orders");

  const activePointCount = useMemo(() => {
    if (chartData.length === 0 || selectedMetrics.length === 0) return 0;
    return chartData.filter((point: any) =>
      selectedMetrics.some((metric) => Number(point[metric] || 0) > 0)
    ).length;
  }, [chartData, selectedMetrics]);

  const isEmptyChart =
    selectedMetrics.length === 0 || chartData.length === 0 || activePointCount === 0;
  const isSparseData = chartData.length <= 2 || activePointCount <= 2;

  const addMetric = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    }
  };

  const removeMetric = (metricId: string) => {
    if (selectedMetrics.length <= 1) {
      toast.error("Select at least one metric to display");
      return;
    }
    setSelectedMetrics(selectedMetrics.filter((id) => id !== metricId));
  };

  const getMetricConfig = (metricId: string) => {
    return availableMetrics.find((m) => m.id === metricId);
  };

  const handleSaveReport = () => {
    try {
      localStorage.setItem(
        SAVED_REPORT_STORAGE_KEY,
        JSON.stringify({ selectedMetrics, selectedDimension, chartType })
      );
      toast.success("Report configuration saved");
    } catch {
      toast.error("Unable to save report configuration");
    }
  };

  const handleGenerateReport = () => {
    if (isEmptyChart) {
      toast.error("No data available for the selected metrics and date range");
      return;
    }
    const headers = [selectedDimension, ...selectedMetrics].join(",");
    const rows = chartData.map((row: any) =>
      [row[selectedDimension], ...selectedMetrics.map((m) => row[m] ?? 0)].join(",")
    );
    const blob = new Blob([[headers, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `custom-report-${selectedMetrics.join("-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Custom report generated and downloaded");
  };

  if (isLoading) {
    return (
      <Card id="report-builder" className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card id="report-builder">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Interactive Report Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select metrics and dimensions to create custom analytics reports
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3">Selected Metrics</h4>
            <div className="flex flex-wrap gap-2">
              {selectedMetrics.map((metricId) => {
                const metric = getMetricConfig(metricId);
                return (
                  <Badge key={metricId} variant="secondary" className="gap-1.5 py-1 px-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: metric?.color }}
                    />
                    {metric?.label}
                    <button
                      type="button"
                      onClick={() => removeMetric(metricId)}
                      aria-label={`Remove ${metric?.label}`}
                      className="hover:bg-muted-foreground/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            {selectedMetrics.length < availableMetrics.length && (
              <Select key={selectedMetrics.join(",")} onValueChange={addMetric}>
                <SelectTrigger className="mt-2.5">
                  <Plus className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Add metric" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics
                    .filter((m) => !selectedMetrics.includes(m.id))
                    .map((metric) => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-3">Dimension</h4>
            <Select value={selectedDimension} onValueChange={setSelectedDimension}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDimensions.map((dimension) => (
                  <SelectItem key={dimension.id} value={dimension.id}>
                    {dimension.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-medium mb-3">Chart Type</h4>
            <div className="inline-flex w-fit items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                type="button"
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                aria-label="Line chart"
                onClick={() => setChartType("line")}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={chartType === "bar" ? "default" : "ghost"}
                size="sm"
                aria-label="Bar chart"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Chart */}
        <div className="h-96 border border-border rounded-lg p-4">
          {isEmptyChart ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No analytics data for this period
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                There are no recorded orders or revenue in the selected date range.
              </p>
              {onResetRange && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onResetRange}
                >
                  View Last 90 Days
                </Button>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: hasCurrencyMetric && hasCountMetric ? 16 : 24, left: 4, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                  <XAxis
                    dataKey={selectedDimension}
                    tickFormatter={formatAxisDate}
                    padding={{ left: 20, right: 20 }}
                    minTickGap={24}
                    interval="preserveStartEnd"
                    className="text-[11px]"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  {hasCurrencyMetric ? (
                    <YAxis
                      yAxisId="currency"
                      tickFormatter={formatCompactINR}
                      width={66}
                      className="text-[11px]"
                      tick={{ fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                  ) : (
                    <YAxis
                      yAxisId="count"
                      allowDecimals={false}
                      width={44}
                      className="text-[11px]"
                      tick={{ fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                  )}
                  {hasCurrencyMetric && hasCountMetric && (
                    <YAxis
                      yAxisId="count"
                      orientation="right"
                      allowDecimals={false}
                      width={44}
                      className="text-[11px]"
                      tick={{ fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                  )}
                  <Tooltip
                    content={<ReportChartTooltip />}
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  />
                  {selectedMetrics.map((metricId) => {
                    const metric = getMetricConfig(metricId);
                    const yAxisId = CURRENCY_METRICS.has(metricId) ? "currency" : "count";
                    return (
                      <Line
                        key={metricId}
                        yAxisId={yAxisId}
                        type="monotone"
                        dataKey={metricId}
                        name={metric?.label}
                        stroke={metric?.color}
                        strokeWidth={2.5}
                        connectNulls
                        dot={{
                          fill: metric?.color,
                          stroke: "var(--color-card)",
                          strokeWidth: 2,
                          r: isSparseData ? 5 : 3.5,
                        }}
                        activeDot={{ r: 7, strokeWidth: 2 }}
                      />
                    );
                  })}
                </LineChart>
              ) : (
                <BarChart
                  data={chartData}
                  barCategoryGap={chartData.length <= 3 ? "35%" : "20%"}
                  margin={{ top: 12, right: hasCurrencyMetric && hasCountMetric ? 16 : 24, left: 4, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                  <XAxis
                    dataKey={selectedDimension}
                    tickFormatter={formatAxisDate}
                    padding={{ left: 16, right: 16 }}
                    minTickGap={24}
                    interval="preserveStartEnd"
                    className="text-[11px]"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  {hasCurrencyMetric ? (
                    <YAxis
                      yAxisId="currency"
                      tickFormatter={formatCompactINR}
                      width={66}
                      className="text-[11px]"
                      tick={{ fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                  ) : (
                    <YAxis
                      yAxisId="count"
                      allowDecimals={false}
                      width={44}
                      className="text-[11px]"
                      tick={{ fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                  )}
                  {hasCurrencyMetric && hasCountMetric && (
                    <YAxis
                      yAxisId="count"
                      orientation="right"
                      allowDecimals={false}
                      width={44}
                      className="text-[11px]"
                      tick={{ fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                  )}
                  <Tooltip
                    content={<ReportChartTooltip />}
                    cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  />
                  {selectedMetrics.map((metricId) => {
                    const metric = getMetricConfig(metricId);
                    const yAxisId = CURRENCY_METRICS.has(metricId) ? "currency" : "count";
                    return (
                      <Bar
                        key={metricId}
                        yAxisId={yAxisId}
                        dataKey={metricId}
                        name={metric?.label}
                        fill={metric?.color}
                        maxBarSize={48}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleSaveReport}>
            Save Report
          </Button>
          <Button type="button" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
