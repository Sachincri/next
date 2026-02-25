import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"

const topProducts = [
  { name: "Wireless Headphones", sales: 1234, revenue: "$24,680", trend: "+12%" },
  { name: "Smart Watch", sales: 987, revenue: "$19,740", trend: "+8%" },
  { name: "Laptop Stand", sales: 756, revenue: "$15,120", trend: "+15%" },
  { name: "USB-C Cable", sales: 654, revenue: "$6,540", trend: "+5%" },
  { name: "Phone Case", sales: 543, revenue: "$10,860", trend: "+3%" },
]

export default function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
        <p className="text-sm text-muted-foreground">Best performing products this month</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.slice(0, 4).map((product, index) => (
            <div key={product.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{product.revenue}</p>
                <Badge variant="secondary" className="text-xs">
                  {product.trend}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
