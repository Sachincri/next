import React from "react";
import { Star, RotateCcw, Award, Truck, Tag, CheckCircle2 } from "lucide-react";
import Breadcrumb from "../layout/Breadcrumb";

interface ProductInfoServerProps {
    product: any;
    breadcrumbLinks: { label: string; url?: string }[];
}

export const ProductInfoServer: React.FC<ProductInfoServerProps> = ({
    product,
    breadcrumbLinks
}) => {

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-4">
                {product.brand && (
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {typeof product.brand === 'object' ? product.brand.name : ''}
                    </div>
                )}
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-slate-100 leading-tight">
                    {product.name}
                </h1>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-gray-900 dark:bg-slate-700 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        <span>{product.ratings?.average?.toFixed(1) || "0.0"}</span>
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                    </div>
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium underline decoration-dotted underline-offset-4">
                        {product.ratings?.count || 0} Ratings
                    </span>
                </div>
            </div>

            {/* Price Block */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-slate-100 tracking-tight">₹{product?.sellingPrice?.toLocaleString()}</span>
                    {product?.maximumRetailPrice && (
                        <span className="text-xl md:text-2xl text-gray-400 dark:text-slate-500 line-through font-medium">₹{product.maximumRetailPrice?.toLocaleString()}</span>
                    )}
                    {product.discount > 0 && (
                        <span className="text-white font-bold px-3 py-1 bg-green-600 rounded-lg text-sm md:text-base tracking-wide shadow-sm ml-2">
                            {product.discount}% OFF
                        </span>
                    )}
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-xs font-medium mt-2">Inclusive of all taxes</p>

                {/* Inventory Status */}
                {(product?.stock !== undefined && product?.stock <= 5 && product?.stock > 0) && (
                    <div className="mt-3 text-red-600 text-sm font-semibold flex items-center gap-1 animate-pulse">
                       Only {product.stock} left in stock!
                    </div>
                )}

                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                    {[
                        { icon: RotateCcw, text: "7 Day Return", color: "text-blue-600 dark:text-blue-400" },
                        { icon: Award, text: "Warranty", color: "text-orange-500 dark:text-orange-400" },
                        { icon: Truck, text: `Delivery by ${new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, color: "text-green-600 dark:text-green-400" }
                    ].map((item) => (
                        <div key={item.text} className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight mb-3">
                        Highlights
                    </h3>
                    <ul className="space-y-2.5">
                        {product.highlights.map((h: string, idx: number) => {
                            const colonIndex = h.indexOf(":");
                            const hasKeyValue = colonIndex > 0 && colonIndex < 28;
                            const keyPart = hasKeyValue ? h.substring(0, colonIndex).trim() : null;
                            const valPart = hasKeyValue ? h.substring(colonIndex + 1).trim() : null;

                            return (
                                <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-slate-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-slate-400 mt-1.5 shrink-0" />
                                    <div className="leading-relaxed flex-1">
                                        {hasKeyValue ? (
                                            <>
                                                <span className="font-semibold text-gray-900 dark:text-slate-100 mr-1.5">
                                                    {keyPart}:
                                                </span>
                                                <span className="text-gray-600 dark:text-slate-300">
                                                    {valPart}
                                                </span>
                                            </>
                                        ) : (
                                            <span>{h}</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Offers */}
            {product.offers && product.offers.length > 0 && (
                <div className="border border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4 text-sm flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Available Offers
                    </h3>
                    <div className="space-y-3">
                        {product.offers.slice(0, 3).map((off: string) => (
                            <div key={off} className="flex gap-2 text-xs">
                                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-slate-300 font-medium">{off}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
