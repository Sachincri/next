"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  IndianRupee,
  ShoppingCart,
  Receipt,
  Percent,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { AnalyticsOverviewData } from "@/types/admin";
import { DATE_RANGE_OPTIONS, DateRangePreset, formatFullINR } from "@/lib/analytics-utils";

interface AnalyticsKpisProps {
  overview?: AnalyticsOverviewData;
  isLoading?: boolean;
  preset: DateRangePreset;
}

export default function AnalyticsKpis({
  overview,
  isLoading = false,
  preset,
}: AnalyticsKpisProps) {
  const comparisonLabel =
    DATE_RANGE_OPTIONS.find((opt) => opt.value === preset)?.comparisonLabel ||
    "vs prev period";

  const kpis = overview?.kpis;

  const cards = [
    {
      title: "Total Revenue",
      value: kpis ? formatFullINR(kpis.totalRevenue.value) : "₹0",
      change: kpis?.totalRevenue.change ?? 0,
      icon: IndianRupee,
      iconClass:
        "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      title: "Total Orders",
      value: kpis ? kpis.totalOrders.value.toLocaleString("en-IN") : "0",
      change: kpis?.totalOrders.change ?? 0,
      icon: ShoppingCart,
      iconClass:
        "text-blue-600 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      title: "Avg. Order Value",
      value: kpis ? formatFullINR(kpis.avgOrderValue.value) : "₹0",
      change: kpis?.avgOrderValue.change ?? 0,
      icon: Receipt,
      iconClass:
        "text-violet-600 bg-violet-100 dark:bg-violet-950/50 dark:text-violet-400",
    },
    {
      title: "Conversion Rate",
      value: kpis ? `${kpis.conversionRate.value.toFixed(2)}%` : "0.00%",
      change: kpis?.conversionRate.change ?? 0,
      icon: Percent,
      iconClass:
        "text-amber-600 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card key={card.title} className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.iconClass}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2.5">
                  <div className="h-7 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-5 w-36 rounded bg-muted animate-pulse" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`gap-1 font-medium text-xs px-2 py-0.5 ${
                        isPositive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
                      }`}
                    >
                      <ChangeIcon className="h-3 w-3" />
                      {isPositive ? "+" : ""}
                      {card.change}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {comparisonLabel}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
