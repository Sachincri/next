
import React from 'react';

interface InvoiceTemplateProps {
    order: any;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order }) => {
    if (!order) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white text-black" id="invoice-component">
            <div className="flex justify-between items-start mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-gray-500 mt-1">Order #{order._id}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold">Your Store Name</h2>
                    <p className="text-gray-600">123 Commerce St</p>
                    <p className="text-gray-600">Business City, 12345</p>
                    <p className="text-gray-600">support@store.com</p>
                </div>
            </div>

            <div className="flex justify-between mb-8">
                <div>
                    <h3 className="text-gray-600 font-semibold mb-2">Billed To:</h3>
                    <p className="font-medium">{order.shippingInfo?.fullName || order.user?.name}</p>
                    <p className="text-gray-600">{order.shippingInfo?.address}</p>
                    <p className="text-gray-600">
                        {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.pinCode}
                    </p>
                    <p className="text-gray-600">{order.shippingInfo?.country}</p>
                    <p className="text-gray-600">{order.shippingInfo?.phoneNo}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-gray-600 font-semibold mb-2">Order Details:</h3>
                    <p><span className="text-gray-600">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Payment Method:</span> {order.paymentInfo?.method || 'Online'}</p>
                    <p><span className="text-gray-600">Payment Status:</span> {order.paymentInfo?.status || 'Pending'}</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 font-semibold">Item</th>
                        <th className="text-right py-3 font-semibold">Quantity</th>
                        <th className="text-right py-3 font-semibold">Price</th>
                        <th className="text-right py-3 font-semibold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.orderItems?.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-3">
                                <p className="font-medium">{item.name}</p>
                            </td>
                            <td className="text-right py-3">{item.quantity}</td>
                            <td className="text-right py-3">₹{item.price}</td>
                            <td className="text-right py-3">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mb-8">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{order.itemsPrice || order.subTotal || order.orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">₹{order.shippingPrice || 0}</span>
                    </div>
                    <div className="flex justify-between py-4 text-xl font-bold">
                        <span>Total:</span>
                        <span>₹{order.totalPrice}</span>
                    </div>
                </div>
            </div>

            <div className="border-t pt-8 text-center text-gray-500 text-sm">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
