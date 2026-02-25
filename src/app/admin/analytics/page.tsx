
"use client"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/admin/dashboard-layout"
import AnalyticsHeader from "@/components/admin/analytics/analytics-header"

const GoogleAnalytics = dynamic(() => import("@/components/admin/analytics/google-analytics"), { ssr: false })
const ReportBuilder = dynamic(() => import("@/components/admin/analytics/report-builder"), { ssr: false })
const PrebuiltReports = dynamic(() => import("@/components/admin/analytics/prebuilt-reports"), { ssr: false })

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnalyticsHeader />
        <GoogleAnalytics />
        <ReportBuilder />
        <PrebuiltReports />
      </div>
    </DashboardLayout>
  )
}
