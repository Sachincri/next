import { User } from "./user";
import { ShippingInfo } from "./cart";

export interface Order {
    _id: string;
    shippingInfo: ShippingInfo;
    orderItems: OrderItem[];
    user: User;
    paymentInfo: {
        id: string;
        status: string;
        method: string;
    };
    paidAt: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    redeemCoins: number;
    coupon?: {
        code: string;
        discount: number;
    };
    orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled";
    deliveredAt?: string;
    processingAt?: string;
    shippedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id?: string;
    orderId: string;
    productId?: string;
    name: string;
    image: string;
    sellingPrice: number;
    ratings: number;
    quantity: number;
    maximumRetailPrice: number;
    discount: number;
    orderStatus: string;
}

export interface OrderState {
    loading: boolean;
    orders: Order[];
    order: Order | null;
    error: string | null;
    message: string | null;
}

export interface ProfileOrder {
    id: string;
    _id?: string;
    title: string;
    status: 'Delivered' | 'Out for Delivery' | 'Processing' | 'Cancelled';
    price: number;
    image: string;
    deliveredDate?: string;
    orderDate: string;
    trackingId: string;
    quantity: number;
    seller: string;
}

export interface OrderCardProps {
    orderStatus: string;
    name: string;
    image: string;
    price: number;
    id: string;
    ratings: number;
    quantity: number;
    cutedPrice: number;
    discount: number;
}

