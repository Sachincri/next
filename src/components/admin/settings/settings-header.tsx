"use client"

import { Button } from "@/components/ui/button"
import { Save, RefreshCw, Loader2 } from "lucide-react"

interface SettingsHeaderProps {
  onSave?: () => void;
  isUpdating?: boolean;
}

export default function SettingsHeader({ onSave, isUpdating }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings & Integrations</h1>
        <p className="text-muted-foreground">Configure your store settings and manage integrations</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>

        <Button size="sm" onClick={onSave} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
