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
  useSidebar,
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
  Megaphone,
  BotMessageSquare,
  ShieldAlert,
  Wallet,
  Trophy,
} from "lucide-react"
import dynamic from "next/dynamic"
import { BrainCircuit } from "lucide-react"
const ThemeToggle = dynamic(() => import("./theme-toggle").then(mod => mod.ThemeToggle), { ssr: false })
const NotificationsPopover = dynamic(() => import("./notifications-popover").then(mod => mod.NotificationsPopover), { ssr: false })
const AiAnalystDrawer = dynamic(() => import("./ai-analyst/AiAnalystDrawer"), { ssr: false })
import { useAppSelector } from "@/redux/hooks"
import { useLogoutMutation } from "@/redux/api/userApi"
import { useGetProactiveAlertsQuery } from "@/redux/api/aiApi"
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
      { title: "Analytics & Insights", href: "/admin/analytics", icon: BarChart3 },
      { title: "AI Chat Analytics", href: "/admin/rag-dashboard", icon: BotMessageSquare },
    ]
  },
  {
    label: "Management",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Smart Campaigns", href: "/admin/campaigns", icon: Megaphone },
      { title: "Coupons", href: "/admin/coupons", icon: Ticket },
      { title: "Sales & Revenue", href: "/admin/sales", icon: TrendingUp },
      { title: "Issues", href: "/admin/issues", icon: MessageSquare },
      { title: "AI Dispute Claims", href: "/admin/disputes", icon: ShieldAlert },
      { title: "Manage Affiliates & Contests", href: "/admin/affiliates", icon: Trophy },
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
  const [isAnalystOpen, setIsAnalystOpen] = useState(false)
  const { data: alertsData } = useGetProactiveAlertsQuery(undefined, { pollingInterval: 60000 })
  const alertCount = alertsData?.data?.alertCount || 0

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
            <SidebarNavItems pathname={pathname} />
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

        <SidebarInset className="min-w-0 overflow-hidden">
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

        {/* Floating AI Analyst Button */}
        <button
          onClick={() => setIsAnalystOpen(true)}
          className="fixed bottom-20 right-6 z-50 group flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
          title="Aura Intelligence"
        >
          <BrainCircuit className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-6" />
          {alertCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative">{alertCount}</span>
            </span>
          ) : (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-400 ring-2 ring-white" />
            </span>
          )}
          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
            Aura Intelligence {alertCount > 0 ? `(${alertCount} Alerts)` : "(Store Analyst)"}
          </span>
        </button>

        {/* AI Analyst Drawer */}
        <AiAnalystDrawer isOpen={isAnalystOpen} onClose={() => setIsAnalystOpen(false)} />
      </div>
    </SidebarProvider>
  )
}

function SidebarNavItems({ pathname }: { pathname: string }) {
  const { setOpenMobile } = useSidebar()

  return (
    <>
      {navigationGroups.map((listGroup) => (
        <SidebarGroup key={listGroup.label} className="mb-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            {listGroup.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {listGroup.items.map((navItem) => {
                const isActive = navItem.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === navItem.href || pathname.startsWith(navItem.href + "/")
                return (
                  <SidebarMenuItem key={navItem.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={navItem.title}
                      onClick={() => setOpenMobile(false)}
                      className={`
                        transition-all duration-200 
                        ${isActive
                          ? 'bg-blue-50 text-blue-600 font-medium shadow-sm hover:bg-blue-100 hover:text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <Link href={navItem.href} className="flex items-center gap-3">
                        <navItem.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{navItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
