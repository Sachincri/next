"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { useGetAllUsersQuery } from "@/redux/api/adminApi"

export default function CustomersSegments() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: users = [] } = useGetAllUsersQuery()
  const activeSegment = searchParams.get("segment") || "all"

  const counts = {
    all: users.length,
    new: users.filter((u: any) => u.tags?.includes("New")).length,
    frequent: users.filter((u: any) => u.tags?.includes("Frequent")).length,
    "high-value": users.filter((u: any) => u.tags?.includes("High Value")).length,
    inactive: users.filter((u: any) => u.tags?.includes("Inactive")).length,
  }

  const segments = [
    { id: "all", label: "All Customers", count: counts.all },
    { id: "new", label: "New", count: counts.new },
    { id: "frequent", label: "Frequent", count: counts.frequent },
    { id: "high-value", label: "High Value", count: counts["high-value"] },
    { id: "inactive", label: "Inactive", count: counts.inactive },
  ]

  const handleSegmentClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id !== "all") params.set("segment", id)
    else params.delete("segment")
    params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">Segments:</span>
      {segments.map((segment) => (
        <Button
          key={segment.id}
          variant={activeSegment === segment.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleSegmentClick(segment.id)}
          className="gap-2"
        >
          {segment.label}
          <Badge variant={activeSegment === segment.id ? "secondary" : "outline"} className="text-xs">
            {segment.count}
          </Badge>
        </Button>
      ))}
    </div>
  )
}
