import { Suspense } from "react"
import SettingsTabs from "@/components/admin/settings/settings-tabs"

export default function SettingsPage() {
  return (
      <div className="space-y-6">
        <Suspense fallback={<div>Loading settings...</div>}>
          <SettingsTabs />
        </Suspense>
      </div>
  )
}
