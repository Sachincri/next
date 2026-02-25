"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Badge } from "@/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, Mail, ChevronLeft, ChevronRight, Trash2, Coins, Ticket } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog"
import CustomerDetailModal from "./customer-detail-modal"
import AssignCouponModal from "./assign-coupon-modal"
import { useGetAllUsersQuery, useDeleteUserMutation, useUpdateUserRoleMutation } from "@/redux/api/adminApi"
import toast from "react-hot-toast"

export default function CustomersTable() {
  const { data: users, isLoading, error } = useGetAllUsersQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds for real-time data
  })
  const [deleteUser] = useDeleteUserMutation()
  const [updateUserRole] = useUpdateUserRoleMutation()

  const router = useRouter()
  const searchParams = useSearchParams()

  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "")
  const lastPushedSearch = useRef(searchParams.get("search") || "")
  const activeSegment = searchParams.get("segment") || "all"

  // URL Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== lastPushedSearch.current) {
        lastPushedSearch.current = localSearch;
        const params = new URLSearchParams(searchParams.toString())
        if (localSearch) params.set("search", localSearch)
        else params.delete("search")
        params.delete("page")
        router.push(`?${params.toString()}`, { scroll: false })
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [localSearch, router, searchParams])

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  const [showAssignCoupon, setShowAssignCoupon] = useState(false)

  // Alert Dialog State
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertData, setAlertData] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ title: "", description: "", onConfirm: () => { } })

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: "bg-purple-100 text-purple-800", label: "Admin" },
      seller: { color: "bg-blue-100 text-blue-800", label: "Seller" },
      user: { color: "bg-green-100 text-green-800", label: "Customer" },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user
    return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
  }

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setShowCustomerDetail(true)
  }

  const handleAssignCoupon = (customer: any) => {
    setSelectedCustomer(customer)
    setShowAssignCoupon(true)
  }

  const executeDeleteUser = async (id: string) => {
    try {
      const res = await deleteUser(id).unwrap()
      toast.success(res?.message || "User deleted successfully")
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user")
    }
  }

  const handleDeleteUserClick = (id: string) => {
    setAlertData({
      title: "Delete User",
      description: "Are you sure you want to delete this user? This action cannot be undone.",
      onConfirm: () => executeDeleteUser(id)
    })
    setAlertOpen(true)
  }

  const executeToggleRole = async (user: any) => {
    const newRole = user.role === "admin" ? "user" : "admin"
    try {
      const res = await updateUserRole({ id: user._id, role: newRole }).unwrap()
      toast.success(res?.message || `User role updated to ${newRole}`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user role")
    }
  }

  const handleToggleRoleClick = (user: any) => {
    const newRole = user.role === "admin" ? "user" : "admin"
    setAlertData({
      title: "Change User Role",
      description: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      onConfirm: () => executeToggleRole(user)
    })
    setAlertOpen(true)
  }

  const filteredCustomers = (users || []).filter((customer) => {
    // 1. Search Filter
    const searchLower = localSearch.toLowerCase()
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer._id?.toLowerCase().includes(searchLower)

    if (!matchesSearch) return false

    // 2. Segment Filter
    // Note: To perfectly determine "frequent", "high-value" or "purchases", we need order history data.
    // If we only have basic customer data, we'll try to estimate or mock this where real data is missing.
    // If real data fields aren't present on `customer` (like `customer.totalPurchases`), they will fall back gracefully.

    // Approximation for `new`: registered within last 30 days
    const daysSinceReg = (new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 3600 * 24)
    const isNew = daysSinceReg <= 30

    // We will assume `customer.purchasedAmount` or `ordersCount` exists to determine high-value / frequent. 
    // If not, we fall back to generic checks for the sake of the feature.
    const purchaseAmt = customer.purchasedAmount || 0;
    const orderCount = customer.ordersCount || 0;

    if (activeSegment === "new" && !isNew) return false;
    if (activeSegment === "frequent" && orderCount < 5) return false;
    if (activeSegment === "high-value" && purchaseAmt < 1000) return false; // arbitrarily > $1000
    if (activeSegment === "inactive" && daysSinceReg > 90 && orderCount === 0) return false;

    return true;
  })

  // Pagination Logic 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when searches/filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [localSearch, activeSegment])


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Customers ({filteredCustomers.length})</CardTitle>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-10 text-muted-foreground text-sm">Loading users...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Date Registered</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">All-Time Purchase</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Total Coins</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={customer.avatar?.url || "/placeholder.svg"} alt={customer.name} />
                            <AvatarFallback>
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="font-medium text-sm hover:text-primary hover:underline"
                            >
                              {customer.name}
                            </button>
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{getRoleBadge(customer.role)}</td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{customer._id}</td>
                      <td className="py-3 px-4 font-medium text-sm">
                        {customer.purchasedAmount?.toLocaleString() || "0.00"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-amber-600 font-medium font-mono text-sm">
                          <Coins className="w-3 h-3" />
                          {customer.rewardPoints || 0}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignCoupon(customer)}>
                              <Ticket className="w-4 h-4 mr-2" />
                              Give Coupon
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleRoleClick(customer)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {customer.role === "admin" ? "Demote to User" : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUserClick(customer._id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {users?.length || 0} users
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomerDetailModal customer={selectedCustomer} open={showCustomerDetail} onOpenChange={setShowCustomerDetail} />
      <AssignCouponModal customer={selectedCustomer} open={showAssignCoupon} onOpenChange={setShowAssignCoupon} />

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertData.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertData.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              alertData.onConfirm()
              setAlertOpen(false)
            }} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
