import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ShoppingCart, Package, UserPlus, AlertTriangle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "order",
    message: "New order #1234 placed",
    time: "2 minutes ago",
    icon: ShoppingCart,
    status: "success",
  },
  {
    id: 2,
    type: "stock",
    message: "Wireless Headphones low stock (5 left)",
    time: "15 minutes ago",
    icon: Package,
    status: "warning",
  },
  {
    id: 3,
    type: "user",
    message: "New customer registration: john@example.com",
    time: "1 hour ago",
    icon: UserPlus,
    status: "info",
  },
  {
    id: 4,
    type: "payment",
    message: "Payment failed for order #1230",
    time: "2 hours ago",
    icon: AlertTriangle,
    status: "error",
  },
  {
    id: 5,
    type: "order",
    message: "Order #1229 shipped",
    time: "3 hours ago",
    icon: ShoppingCart,
    status: "success",
  },
]

export default function ActivityFeed() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "error":
        return "text-red-600 bg-red-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest updates and alerts</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
