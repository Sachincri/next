
"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AnalyticsHeader from "@/components/admin/analytics/analytics-header";
import AnalyticsKpis from "@/components/admin/analytics/analytics-kpis";
import { useGetAnalyticsOverviewQuery } from "@/redux/api/adminApi";
import {
  AnalyticsDateRange,
  DateRangePreset,
  exportAnalyticsCsv,
  getDatesForPreset,
} from "@/lib/analytics-utils";

const GoogleAnalytics = dynamic(
  () => import("@/components/admin/analytics/google-analytics"),
  { ssr: false }
);
const ReportBuilder = dynamic(
  () => import("@/components/admin/analytics/report-builder"),
  { ssr: false }
);
const PrebuiltReports = dynamic(
  () => import("@/components/admin/analytics/prebuilt-reports"),
  { ssr: false }
);

function AnalyticsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPresetParam = searchParams.get("preset") as DateRangePreset | null;
  const initialStart = searchParams.get("startDate") || undefined;
  const initialEnd = searchParams.get("endDate") || undefined;
  const validPreset: DateRangePreset =
    initialPresetParam === "7d" ||
    initialPresetParam === "30d" ||
    initialPresetParam === "this_month" ||
    initialPresetParam === "90d" ||
    initialPresetParam === "custom"
      ? initialPresetParam
      : "30d";

  const [dateRange, setDateRange] = useState<AnalyticsDateRange>(() =>
    getDatesForPreset(validPreset, {
      startDate: initialStart,
      endDate: initialEnd,
    })
  );

  const { data: overview, isFetching, isLoading } = useGetAnalyticsOverviewQuery({
    preset: dateRange.preset,
    ...(dateRange.preset === "custom"
      ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
      : {}),
  });

  const handleDateRangeChange = (next: AnalyticsDateRange) => {
    setDateRange(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", next.preset);
    if (next.preset === "custom") {
      params.set("startDate", next.startDate);
      params.set("endDate", next.endDate);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    router.replace(`/admin/analytics?${params.toString()}`, { scroll: false });
  };

  const handleShareReport = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Shareable report link copied!");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handleExportData = () => {
    if (exportAnalyticsCsv(overview, dateRange)) {
      toast.success("Analytics CSV exported");
    } else {
      toast.error("Analytics data is not ready yet");
    }
  };

  const handleCreateReport = () => {
    const el = document.getElementById("report-builder");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleResetTo90Days = () => {
    handleDateRangeChange(getDatesForPreset("90d"));
  };

  return (
    <div className="space-y-6">
      <AnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onShareReport={handleShareReport}
        onExportData={handleExportData}
        onCreateReport={handleCreateReport}
        isExporting={isLoading}
      />

      <GoogleAnalytics />

      <AnalyticsKpis
        overview={overview}
        isLoading={isLoading || isFetching}
        preset={dateRange.preset}
      />

      <ReportBuilder
        overview={overview}
        isLoading={isLoading}
        onResetRange={handleResetTo90Days}
      />

      <PrebuiltReports
        overview={overview}
        isLoading={isLoading}
        dateRange={dateRange}
        onResetRange={handleResetTo90Days}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading analytics...</div>}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
