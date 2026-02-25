import { Suspense } from "react"
import DashboardLayout from "@/components/admin/dashboard-layout"
import SettingsTabs from "@/components/admin/settings/settings-tabs"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Suspense fallback={<div>Loading settings...</div>}>
          <SettingsTabs />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
