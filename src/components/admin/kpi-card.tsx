import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
}

export default function KPICard({ title, value, change, changeType, icon }: KPICardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    if (changeType === "positive") return <TrendingUp className="w-3 h-3" />
    if (changeType === "negative") return <TrendingDown className="w-3 h-3" />
    return null
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
          {getTrendIcon()}
          <span>{change}</span>
        </div>
      </CardContent>
    </Card>
  )
}
