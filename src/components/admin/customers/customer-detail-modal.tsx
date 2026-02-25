"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Separator } from "@/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useGetUserDetailsQuery } from "@/redux/api/adminApi"
import { User as UserIcon, ShoppingBag, DollarSign, Calendar, Mail, Phone, MapPin, Loader2 } from "lucide-react"

interface CustomerDetailModalProps {
  customer: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CustomerDetailModal({ customer, open, onOpenChange }: CustomerDetailModalProps) {
  const { data: fullCustomer, isLoading } = useGetUserDetailsQuery(customer?._id || "", {
    skip: !open || !customer?._id,
  })

  if (!customer) return null

  // Use fullCustomer data if available, otherwise fallback to the customer object from props
  const displayCustomer = fullCustomer || customer
  const history = fullCustomer?.orderHistory || []

  // Generate some simple LTV data from history for the chart
  const ltvData = history.length > 0
    ? [...history]
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc: any[], order: any, idx: number) => {
        const prevValue = idx > 0 ? acc[idx - 1].value : 0;
        acc.push({
          month: new Date(order.date).toLocaleDateString(undefined, { month: 'short' }),
          value: prevValue + order.total
        });
        return acc;
      }, [])
    : [
      { month: "No Data", value: 0 }
    ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarImage src={displayCustomer.avatar?.url || "/placeholder.svg"} alt={displayCustomer.name} />
                <AvatarFallback>
                  {displayCustomer.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="font-semibold text-xl">{displayCustomer.name}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{displayCustomer.email}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {displayCustomer.role || "User"}
                </Badge>
                {(displayCustomer.points > 0 || displayCustomer.rewardPoints > 0) && (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[10px] uppercase border-amber-200 dark:border-amber-800">
                    {displayCustomer.points || displayCustomer.rewardPoints} Coins
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      Date Registered
                    </div>
                    <p className="font-medium">
                      {displayCustomer.createdAt ? new Date(displayCustomer.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="font-medium truncate" title={displayCustomer.email}>{displayCustomer.email}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="font-medium">{displayCustomer.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      Location
                    </div>
                    <p className="font-medium">{(displayCustomer as any).address || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Recent Purchase History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium text-xs truncate max-w-[150px]">#{order.id}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${order.total?.toFixed(2)}</p>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1 py-0 h-4">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No purchase history found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* LTV Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Lifetime Value Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ltvData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                      <XAxis
                        dataKey="month"
                        className="text-[10px]"
                        tick={{ fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        className="text-[10px]"
                        tick={{ fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--color-foreground)",
                        }}
                        formatter={(value: any) => [`$${value}`, "LTV"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "var(--color-primary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                  <div className="text-2xl font-bold">{displayCustomer.ordersCount || 0}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Lifetime Value</div>
                  <div className="text-2xl font-bold">
                    ${(displayCustomer.purchasedAmount || 0).toLocaleString()}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Segment</div>
                  <div className="flex flex-wrap gap-1">
                    {displayCustomer.tags?.map((tag: string) => (
                      <Badge key={tag} className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-[10px]">
                        {tag}
                      </Badge>
                    )) || (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 text-[10px]">
                          Standard
                        </Badge>
                      )}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Order</div>
                  <div className="font-medium">
                    {displayCustomer.lastOrderDate ? new Date(displayCustomer.lastOrderDate).toLocaleDateString() : "Never"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full">Send Email</Button>
              <Button variant="outline" className="w-full bg-transparent">
                Edit Customer
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View All Orders
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Create Support Ticket
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
