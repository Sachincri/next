"use client";

import type React from "react"
import { ThemeProvider } from "@/components/admin/theme-provider"
import { Suspense } from "react"
import { useAppSelector } from "@/redux/hooks"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/admin/dashboard-layout"

const SocketProvider = dynamic(() => import("@/contexts/socket").then(mod => mod.SocketProvider), { ssr: false })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isAuthenticated, user } = useAppSelector((state) => state.user)

  return (
    <div suppressHydrationWarning>
      <ProtectedRoute
        isAuthenticated={isAuthenticated}
        isAdmin={user?.role === 'admin'}
        adminRoute={true}
      >
        <Suspense fallback={null}>
          <SocketProvider>
            <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
              <DashboardLayout>
                {children}
              </DashboardLayout>
            </ThemeProvider>
          </SocketProvider>
        </Suspense>
      </ProtectedRoute>
    </div>
  )
}
