import { Order, ProfileOrder } from "./order";
import { ShippingInfo } from "./cart";


export interface UserReview {
    id: string;
    productName: string;
    rating: number;
    review: string;
    date: string;
    productImage: string;
    helpful: number;
}

export interface Reward {
    id: string;
    title: string;
    description: string;
    points: number;
    expiryDate: string;
    type: 'cashback' | 'discount' | 'freebie';
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    rewardPoints?: number;
    orderHistory?: Order[];
    avatar?: {
        public_id: string;
        url: string;
    };
    address: ShippingInfo[];
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
    purchasedAmount?: number;
    ordersCount?: number;
}

export interface UserState {
    loading: boolean;
    isAuthenticated: boolean;
    user: User | null;
    otpSent: boolean;
    error: string | null;
    message: string | null;
    addresses?: Array<{
        id: string;
        type: 'Home' | 'Work' | 'Other';
        name: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        mobile: string;
        isDefault: boolean;
        landmark?: string;
    }>;
    orders?: ProfileOrder[];
    reviews?: UserReview[];
    rewards?: Reward[];
}
