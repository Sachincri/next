"use client"

import { type ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {

  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  FileText,
  LogOut,
  User,
  MoreVertical,
  MessageSquare,
  Ticket,
} from "lucide-react"
import dynamic from "next/dynamic"
const ThemeToggle = dynamic(() => import("./theme-toggle").then(mod => mod.ThemeToggle), { ssr: false })
const NotificationsPopover = dynamic(() => import("./notifications-popover").then(mod => mod.NotificationsPopover), { ssr: false })
import { useAppSelector } from "@/redux/hooks"
import { useLogoutMutation } from "@/redux/api/userApi"
import toast from "react-hot-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigationGroups = [
  {
    label: "Dashboard",
    items: [
      { title: "Overview", href: "/admin", icon: LayoutDashboard },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Management",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Coupons", href: "/admin/coupons", icon: Ticket },
      { title: "Sales & Revenue", href: "/admin/sales", icon: TrendingUp },
      { title: "Issues", href: "/admin/issues", icon: MessageSquare },
    ]
  },
  {
    label: "System",
    items: [
      { title: "Home Content", href: "/admin/content", icon: FileText },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ]
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.user)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const mountedUser = isMounted ? user : null
  const [logout] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error: any) {
      toast.error(error?.data?.message || "Logout failed")
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">E-Commerce</span>
                <span className="text-xs text-muted-foreground">Admin Portal</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.label} className="mb-4">
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            className={`
                              transition-all duration-200 
                              ${isActive
                                ? 'bg-blue-50 text-blue-600 font-medium shadow-sm hover:bg-blue-100 hover:text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }
                            `}
                          >
                            <Link href={item.href} className="flex items-center gap-3">
                              <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                              <span>{item.title}</span>
                              {/* Optional: Add badges here if needed */}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <div className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2 px-2 hover:bg-sidebar-accent">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={mountedUser?.avatar?.url} alt={mountedUser?.name} />
                      <AvatarFallback className="rounded-lg">
                        {mountedUser?.name?.substring(0, 2).toUpperCase() || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1 overflow-hidden text-left">
                      <span className="text-sm font-semibold truncate w-full">{mountedUser?.name || "Admin User"}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">{mountedUser?.email || "admin@company.com"}</span>
                    </div>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings?tab=profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* Top Navigation Bar */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 items-center gap-2 px-1 sm:px-3 min-w-0">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 w-full sm:hidden" />
                <Input type="search" placeholder="Search orders, products, customers..." className="pl-8 w-full hidden sm:flex" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPopover />
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
