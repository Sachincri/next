
"use client";

import React, { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Info, XCircle } from "lucide-react";
import { useSocket } from '@/contexts/socket-context';
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useGetMyNotificationsQuery, useMarkAllAsReadMutation } from "@/redux/api/userApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    timestamp: Date;
    read: boolean;
    link?: string;
}

export function NotificationsPopover() {
    const { socket, isConnected, joinAdminRoom } = useSocket();
    const { user } = useAppSelector((state: RootState) => state.user);
    const { data, refetch } = useGetMyNotificationsQuery();
    const [markAllAsReadApi] = useMarkAllAsReadMutation();
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (data?.notifications) {
            const mapped = data.notifications.map((n: any) => ({
                id: n._id,
                title: n.title,
                message: n.message,
                type: (n.type?.includes("stock") ? "warning" : n.type?.includes("error") ? "error" : "info") as Notification['type'], // simplistic mapping
                timestamp: new Date(n.createdAt),
                read: n.read,
                link: n.data?.orderId ? `/order/${n.data.orderId}` : undefined,
            }));
            setNotifications(mapped);
            setUnreadCount(data.unreadCount || 0);
        }
    }, [data]);

    useEffect(() => {
        if (isConnected && user?.role === 'admin') {
            joinAdminRoom();
        }
    }, [isConnected, joinAdminRoom, user]);

    useEffect(() => {
        if (!socket) return;

        socket.on("order:created", (data: any) => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                title: "New Order",
                message: `New order received #${data.orderId?.substring(data.orderId.length - 8) || ''} - ₹${data.totalPrice}`,
                type: "success",
                timestamp: new Date(),
                read: false,
                link: `/admin/orders`,
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.success("New Order Received!");

            // Play sound if desired
            const audio = new Audio("/sounds/notification.mp3");
            audio.play().catch(e => console.log("Audio play failed", e));
        });

        socket.on("stock:low", (data: any) => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                title: "Low Stock Alert",
                message: `Product ${data.productName} is low on stock (${data.stock} remaining)`,
                type: "warning",
                timestamp: new Date(),
                read: false,
                link: `/admin/products/${data.productId}`,
            };
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast("Low Stock Alert", { icon: "⚠️" });
        });

        socket.on("notification:new", (newNotif: any) => {
            // General notification event
            refetch();
            toast.success(newNotif.title || "New Notification");
        });

        // Cleanup listeners
        return () => {
            socket.off("order:created");
            socket.off("stock:low");
            socket.off("notification:new");
        };
    }, [socket, refetch]);

    const markAllAsRead = async () => {
        try {
            await markAllAsReadApi().unwrap();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark read:", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1">
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-blue-50/50" : ""}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {notification.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
                                                notification.type === 'error' ? <XCircle className="h-3 w-3" /> :
                                                    <Info className="h-3 w-3" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground pt-1">
                                                {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
