import { User } from "./user";
import { Product } from "./product";
import { Order } from "./order";

export interface DashboardStats {
    summary: {
        users: number;
        products: number;
        lowStockProducts: number;
        lowStockDetails?: any[];
        orders: number;
        abandonedCarts: number;
        uncategorizedCount?: number;
        paymentMethods?: any[];
        revenue: number;
        profit: number;
        avgOrderValue: number;
        conversionRate?: number;
        customerSatisfaction?: number;
    };
    stats: {
        summary: {
            users: number;
            products: number;
            orders: number;
            abandonedCarts: number;
            revenue: number;
            profit: number;
            avgOrderValue: number;
            conversionRate?: number;
            customerSatisfaction?: number;
        };
        comparison: {
            last7Days: { revenueGrowth: number; ordersGrowth: number; profitGrowth: number };
            last30Days: { revenueGrowth: number; ordersGrowth: number; profitGrowth: number };
        };
    };
    realTime: {
        today: {
            orders: number;
            revenue: number;
            profit: number;
            users: number;
            ordersGrowth: number;
            revenueGrowth: number;
            profitGrowth: number;
        };
        yesterday: {
            orders: number;
            revenue: number;
            profit: number;
            users: number;
        };

    };
    comparison: {
        last7Days: {
            orders: number;
            revenue: number;
            profit: number;
            ordersGrowth: number;
            revenueGrowth: number;
            profitGrowth: number;
        };
        last30Days: {
            orders: number;
            revenue: number;
            profit: number;
            ordersGrowth: number;
            revenueGrowth: number;
            profitGrowth: number;
        };
    };
    customers: {
        newCustomers: number;
        returningCustomers: number;
        vipCustomers?: number;
    };
    ordersByStatus: Record<string, number>;
    topProducts: Array<{
        _id: string;
        name: string;
        totalSold: number;
        totalRevenue: number;
        totalProfit: number;
        image?: string;
    }>;
    recentActivity?: {
        orders: any[];
        users: any[];
    };
    charts: {
        last7Days: {
            series: Array<{ date: string; orders: number; revenue: number; profit?: number; grossSales?: number; coinDiscount?: number; shippingFees?: number; refunds?: number; refundCount?: number; customers?: number }>;
        };
        last30Days: {
            series: Array<{ date: string; orders: number; revenue: number; profit?: number; grossSales?: number; coinDiscount?: number; shippingFees?: number; refunds?: number; refundCount?: number; customers?: number }>;
        };
        last90Days: {
            series: Array<{ date: string; orders: number; revenue: number; profit?: number; grossSales?: number; coinDiscount?: number; shippingFees?: number; refunds?: number; refundCount?: number; customers?: number }>;
        };
        last12Months: {
            series: Array<{ month: string; orders: number; revenue: number; profit?: number; grossSales?: number; coinDiscount?: number; shippingFees?: number; refunds?: number; refundCount?: number; customers?: number }>;
        };
    };
    byRegion?: Array<{
        region: string;
        revenue: number;
        shippingCost?: number;
        orders: number;
    }>;
    deductions?: {
        grossSales: number;
        cogs: number;
        totalDiscounts: number;
        totalShipping: number;
        totalTax?: number;
        totalRefunds: number;
        netProfit: number;
    };
    productAlerts?: Array<{
        productId: string;
        productName: string;
        rating: number;
        refundCount: number;
        alertType: string;
    }>;
}

export interface ProductAnalytics {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    activeProducts: number;
    topCategories: Array<{ name: string; count: number; revenue?: number; profit?: number }>;
}

export interface CustomerAnalytics {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    topCustomers: Array<{ name: string; orderCount: number; totalSpent: number }>;
}

export interface AdminState {
    loading: boolean;
    users: User[];
    products: Product[];
    orders: Order[];
    error: string | null;
    message: string | null;
    dashStats?: DashboardStats;
    productAnalytics?: ProductAnalytics;
    customerAnalytics?: CustomerAnalytics;
}
