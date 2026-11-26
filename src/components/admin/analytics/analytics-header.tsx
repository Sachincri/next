"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Calendar, Download, Plus, Share, Check } from "lucide-react";
import {
  AnalyticsDateRange,
  DATE_RANGE_OPTIONS,
  DateRangePreset,
  getDatesForPreset,
} from "@/lib/analytics-utils";

interface AnalyticsHeaderProps {
  dateRange?: AnalyticsDateRange;
  onDateRangeChange?: (next: AnalyticsDateRange) => void;
  onShareReport?: () => void;
  onExportData?: () => void;
  onCreateReport?: () => void;
  isExporting?: boolean;
}

export default function AnalyticsHeader({
  dateRange = getDatesForPreset("30d"),
  onDateRangeChange,
  onShareReport,
  onExportData,
  onCreateReport,
  isExporting = false,
}: AnalyticsHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handlePresetChange = (value: string) => {
    const preset = value as DateRangePreset;
    onDateRangeChange?.(getDatesForPreset(preset, dateRange));
  };

  const handleCustomDateChange = (field: "startDate" | "endDate", val: string) => {
    if (!val) return;
    onDateRangeChange?.({
      ...dateRange,
      preset: "custom",
      [field]: val,
    });
  };

  const handleShareClick = () => {
    onShareReport?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1.5">
          Analytics &amp; Insights
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Advanced analytics and custom reporting tools
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Global Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange.preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="h-9 w-[165px] bg-background">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateRange.preset === "custom" && (
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                aria-label="Start date"
                value={dateRange.startDate}
                max={dateRange.endDate}
                onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                className="h-9 w-[138px] text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                aria-label="End date"
                value={dateRange.endDate}
                min={dateRange.startDate}
                onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                className="h-9 w-[138px] text-xs"
              />
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={handleShareClick}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-emerald-600" />
          ) : (
            <Share className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copied" : "Share Report"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportData}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>

        <Button size="sm" onClick={onCreateReport}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>
    </div>
  );
}
