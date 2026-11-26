import { format, isValid, parseISO, startOfMonth, subDays } from "date-fns";
import type { AnalyticsOverviewData } from "@/types/admin";

export type DateRangePreset = "7d" | "30d" | "this_month" | "90d" | "custom";

export interface AnalyticsDateRange {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}

export const DATE_RANGE_OPTIONS: Array<{
  value: DateRangePreset;
  label: string;
  comparisonLabel: string;
}> = [
  { value: "7d", label: "Last 7 Days", comparisonLabel: "vs prev 7 days" },
  { value: "30d", label: "Last 30 Days", comparisonLabel: "vs prev 30 days" },
  { value: "this_month", label: "This Month", comparisonLabel: "vs prev period" },
  { value: "90d", label: "Last 90 Days", comparisonLabel: "vs prev 90 days" },
  { value: "custom", label: "Custom Range", comparisonLabel: "vs prev period" },
];

export const CURRENCY_METRICS = new Set(["revenue", "aov", "sales", "target"]);

/**
 * Format numeric values into compact INR labels for chart Y-axes (e.g., ₹80K, ₹60K, ₹20K).
 */
export function formatCompactINR(value: number | string): string {
  const num = Number(value) || 0;
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);

  if (abs === 0) return "₹0";
  if (abs >= 1_000_000) {
    return `${sign}₹${(abs / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}

/**
 * Format full INR values using Indian numbering separators (e.g., ₹60,000).
 */
export function formatFullINR(value: number | string, maximumFractionDigits = 0): string {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(num);
}

/**
 * Format ISO date (YYYY-MM-DD or YYYY-MM) into readable label (e.g., 16 Nov 2026 or Nov 2026).
 */
export function formatChartDate(rawDate?: string): string {
  if (!rawDate) return "";
  const clean = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parsed = parseISO(clean);
    if (isValid(parsed)) return format(parsed, "dd MMM yyyy");
  }
  if (/^\d{4}-\d{2}$/.test(clean)) {
    const parsed = parseISO(`${clean}-01`);
    if (isValid(parsed)) return format(parsed, "MMM yyyy");
  }
  return clean;
}

/**
 * Format short axis ticks (e.g., 16 Nov or Nov 26).
 */
export function formatAxisDate(rawDate?: string): string {
  if (!rawDate) return "";
  const clean = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parsed = parseISO(clean);
    if (isValid(parsed)) return format(parsed, "dd MMM");
  }
  if (/^\d{4}-\d{2}$/.test(clean)) {
    const parsed = parseISO(`${clean}-01`);
    if (isValid(parsed)) return format(parsed, "MMM yy");
  }
  return clean;
}

/**
 * Format a tooltip row cleanly (e.g., ₹60,000 • 16 Nov 2026).
 */
export function formatTooltipValueWithDate(
  metricId: string,
  value: number | string,
  dateStr?: string
): string {
  const num = Number(value) || 0;
  const formattedVal = CURRENCY_METRICS.has(metricId)
    ? formatFullINR(num)
    : num.toLocaleString("en-IN");
  const formattedDate = formatChartDate(dateStr);
  return formattedDate ? `${formattedVal} • ${formattedDate}` : formattedVal;
}

/**
 * Compute YYYY-MM-DD start/end bounds for a preset range.
 */
export function getDatesForPreset(
  preset: DateRangePreset,
  currentRange?: { startDate?: string; endDate?: string }
): AnalyticsDateRange {
  const today = new Date();
  const formatDay = (d: Date) => format(d, "yyyy-MM-dd");

  if (preset === "7d") {
    return {
      preset,
      startDate: formatDay(subDays(today, 6)),
      endDate: formatDay(today),
    };
  }
  if (preset === "this_month") {
    return {
      preset,
      startDate: formatDay(startOfMonth(today)),
      endDate: formatDay(today),
    };
  }
  if (preset === "90d") {
    return {
      preset,
      startDate: formatDay(subDays(today, 89)),
      endDate: formatDay(today),
    };
  }
  if (preset === "custom") {
    return {
      preset,
      startDate: currentRange?.startDate || formatDay(subDays(today, 29)),
      endDate: currentRange?.endDate || formatDay(today),
    };
  }
  return {
    preset: "30d",
    startDate: formatDay(subDays(today, 29)),
    endDate: formatDay(today),
  };
}

export function exportAnalyticsCsv(
  overview: AnalyticsOverviewData | undefined,
  range: AnalyticsDateRange
): boolean {
  if (!overview || typeof window === "undefined") return false;

  const lines: string[] = [
    ["Metric", "Value", "Previous Period", "Change (%)"].join(","),
    [
      "Total Revenue",
      overview.kpis.totalRevenue.value,
      overview.kpis.totalRevenue.previous,
      overview.kpis.totalRevenue.change,
    ].join(","),
    [
      "Total Orders",
      overview.kpis.totalOrders.value,
      overview.kpis.totalOrders.previous,
      overview.kpis.totalOrders.change,
    ].join(","),
    [
      "Avg. Order Value",
      overview.kpis.avgOrderValue.value,
      overview.kpis.avgOrderValue.previous,
      overview.kpis.avgOrderValue.change,
    ].join(","),
    [
      "Conversion Rate (%)",
      overview.kpis.conversionRate.value,
      overview.kpis.conversionRate.previous,
      overview.kpis.conversionRate.change,
    ].join(","),
    "",
    ["Date", "Revenue (INR)", "Orders", "Average Order Value (INR)"].join(","),
    ...(overview.series || []).map((pt) =>
      [pt.date, pt.revenue, pt.orders, pt.aov].join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `analytics-${range.preset}-${range.startDate}-to-${range.endDate}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}
