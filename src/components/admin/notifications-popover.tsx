"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useSocket } from "@/contexts/socket-context";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useGetMyNotificationsQuery, useMarkAllAsReadMutation } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    timestamp: Date;
    read: boolean;
    link?: string;
}

interface NotificationsPopoverProps {
    triggerClassName?: string;
}

export function NotificationsPopover({ triggerClassName }: NotificationsPopoverProps = {}) {
    const router = useRouter();
    const { socket, isConnected, joinAdminRoom } = useSocket();
    const { user } = useAppSelector((state: RootState) => state.user);
    const { data, refetch } = useGetMyNotificationsQuery();
    const [markAllAsReadApi] = useMarkAllAsReadMutation();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const openedViaHoverAtRef = useRef<number>(0);

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    const handleMousePointerEnter = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            clearCloseTimer();
            if (!isOpen) {
                openedViaHoverAtRef.current = Date.now();
                setIsOpen(true);
            }
        },
        [clearCloseTimer, isOpen]
    );

    const handleMousePointerLeave = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            clearCloseTimer();
            closeTimerRef.current = setTimeout(() => {
                setIsOpen(false);
            }, 180);
        },
        [clearCloseTimer]
    );

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            // Prevent an immediate hover-then-click on desktop from shutting the popover right after opening
            if (!nextOpen && Date.now() - openedViaHoverAtRef.current < 260) {
                return;
            }
            clearCloseTimer();
            setIsOpen(nextOpen);
        },
        [clearCloseTimer]
    );

    useEffect(() => {
        return () => clearCloseTimer();
    }, [clearCloseTimer]);

    useEffect(() => {
        if (data?.notifications) {
            const mapped = data.notifications.map((n: any) => ({
                id: n._id,
                title: n.title,
                message: n.message,
                type: (n.type?.includes("stock")
                    ? "warning"
                    : n.type?.includes("error")
                      ? "error"
                      : "info") as Notification["type"],
                timestamp: new Date(n.createdAt),
                read: n.read,
                link: n.data?.orderId ? `/order/${n.data.orderId}` : undefined,
            }));
            setNotifications(mapped);
            setUnreadCount(data.unreadCount || 0);
        }
    }, [data]);

    useEffect(() => {
        if (isConnected && user?.role === "admin") {
            joinAdminRoom();
        }
    }, [isConnected, joinAdminRoom, user]);

    useEffect(() => {
        if (!socket) return;

        socket.on("order:created", (payload: any) => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                title: "New Order",
                message: `New order received #${payload.orderId?.substring(payload.orderId.length - 8) || ""} - ₹${payload.totalPrice}`,
                type: "success",
                timestamp: new Date(),
                read: false,
                link: `/admin/orders`,
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.success("New Order Received!");

            const audio = new Audio("/sounds/notification.mp3");
            audio.play().catch((e) => console.log("Audio play failed", e));
        });

        socket.on("stock:low", (payload: any) => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                title: "Low Stock Alert",
                message: `Product ${payload.productName} is low on stock (${payload.stock} remaining)`,
                type: "warning",
                timestamp: new Date(),
                read: false,
                link: `/admin/products/${payload.productId}`,
            };
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast("Low Stock Alert", { icon: "⚠️" });
        });

        socket.on("notification:new", (newNotif: any) => {
            refetch();
            toast.success(newNotif.title || "New Notification");
        });

        return () => {
            socket.off("order:created");
            socket.off("stock:low");
            socket.off("notification:new");
        };
    }, [socket, refetch]);

    const markAllAsRead = async () => {
        try {
            await markAllAsReadApi().unwrap();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark read:", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <div
                className="inline-flex"
                onPointerEnter={handleMousePointerEnter}
                onPointerLeave={handleMousePointerLeave}
            >
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("relative h-9 w-9 shrink-0", triggerClassName)}
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none"
                            >
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent
                align="end"
                sideOffset={8}
                collisionPadding={12}
                onPointerEnter={handleMousePointerEnter}
                onPointerLeave={handleMousePointerLeave}
                className="w-[calc(100vw-24px)] max-w-[360px] sm:w-80 p-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl overflow-hidden z-[70]"
            >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs h-auto py-1 px-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                Mark all read
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close notifications"
                            className="sm:hidden h-7 w-7 text-slate-500 hover:text-slate-800 dark:text-slate-400"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="max-h-[min(320px,58vh)] overflow-y-auto overscroll-contain">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-25" />
                            <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((notification) => {
                                const content = (
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                                                notification.type === "success"
                                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                    : notification.type === "warning"
                                                      ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                                                      : notification.type === "error"
                                                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                                                        : "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                                            }`}
                                        >
                                            {notification.type === "success" ? (
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            ) : notification.type === "error" ? (
                                                <XCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <Info className="h-3.5 w-3.5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-snug text-slate-900 dark:text-slate-100 break-words">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 break-words">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                {notification.timestamp.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );

                                if (notification.link) {
                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push(notification.link!);
                                            }}
                                            className={`w-full text-left p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                                                !notification.read ? "bg-indigo-50/70 dark:bg-indigo-950/30" : ""
                                            }`}
                                        >
                                            {content}
                                        </button>
                                    );
                                }

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                                            !notification.read ? "bg-indigo-50/70 dark:bg-indigo-950/30" : ""
                                        }`}
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
