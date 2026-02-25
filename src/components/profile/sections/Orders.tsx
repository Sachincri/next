import { ProfileOrder as Order } from "@/types";

import { AlertCircle, CheckCircle, Clock, Package, Truck } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ReviewModal from "@/components/product/ReviewModal";
import { useRouter } from "next/navigation";

export const OrdersSection = ({ orders }: { orders: Order[] }) => {
    const router = useRouter();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; image: string } | null>(null);

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
            case 'Out for Delivery': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
            case 'Processing': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
            case 'Cancelled': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            default: return 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50';
        }
    };

    const getOrderStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
            case 'Out for Delivery': return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
            case 'Processing': return <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
            case 'Cancelled': return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
            default: return <Package className="w-4 h-4 text-gray-600 dark:text-slate-400" />;
        }
    };
    return (<div className="space-y-6">
        <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Order History</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm">Track and manage your orders</p>
        </div>

        {orders.map((order, index) => (
            <div
                key={`${order.id}-${index}`}
                onClick={() => router.push(`/order/${order.id}`)}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md dark:hover:shadow-slate-950/20 transition-all duration-200 cursor-pointer"
            >
                <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        {order.image?.startsWith('http') || order.image?.startsWith('/') ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={order.image}
                                    alt={order.title}
                                    fill
                                    className="object-contain p-1"
                                    sizes="80px"
                                />
                            </div>
                        ) : (
                            <span className="text-2xl">{order.image}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-semibold text-gray-800 dark:text-slate-100 mb-1">{order.title}</div>
                                <div className="text-sm text-gray-600 dark:text-slate-400">Quantity: {order.quantity} | Seller: {order.seller}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-lg text-gray-800 dark:text-slate-100">₹{order.price}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            {getOrderStatusIcon(order.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                                {order.deliveredDate && ` on ${order.deliveredDate}`}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-slate-400 mb-3">
                            <div>Order Date: {order.orderDate}</div>
                            <div>Tracking ID: {order.trackingId}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex gap-3">
                        {order.status === 'Processing' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="px-4 py-2 border border-red-300 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Cancel Order
                            </button>
                        ) : order.status === 'Delivered' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-400 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Return/Exchange
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); }} // Maybe add track order logic here
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                                Track Order
                            </button>
                        )}
                    </div>

                    {order.status === 'Delivered' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct({
                                    id: (order as any).productId || order.id,
                                    name: order.title,
                                    image: order.image
                                });
                                setIsReviewModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            Rate Product
                        </button>
                    )}
                </div>
            </div>
        ))}

        {selectedProduct && isReviewModalOpen && (
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false);
                    setSelectedProduct(null);
                }}
                productId={selectedProduct.id}
                productName={selectedProduct.name}
                productImage={selectedProduct.image}
            />
        )}
    </div>)
};