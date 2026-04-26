"use client";

import React from "react";
import { ShoppingCart, Zap, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useAddToCartMutation } from "@/redux/api/cartApi";
import { addToCartSuccess } from "@/redux/reducer/cartReducer";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useProductSelection } from "./ProductSelectionContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductActionButtonsProps {
    productId: string;
    stock: number;
    name: string;
    price: number;
    thumbnail: string;
    colors?: { name: string; image?: string }[];
    sizes?: string[];
    showOnly?: "color" | "size" | "buttons";
}

export const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
    productId,
    stock,
    name,
    price,
    thumbnail,
    colors,
    sizes,
    showOnly
}) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.user);
    const [addToCartServer] = useAddToCartMutation();

    const { selectedColor, setSelectedColor, selectedSize, setSelectedSize } = useProductSelection();

    const validateSelection = () => {
        if (colors && colors.length > 0 && !selectedColor) {
            toast.error("Please select a color");
            return false;
        }
        if (sizes && sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return false;
        }
        return true;
    };

    const getVariant = () => ({
        color: selectedColor || undefined,
        size: selectedSize || undefined,
    });

    const addToCartHandler = async () => {
        if (!validateSelection()) return;

        const variant = getVariant();

        if (isAuthenticated) {
            try {
                const res = await addToCartServer({ productId, quantity: 1, variant }).unwrap();
                toast.success(res?.message || "Item Added To Cart");
            } catch (err: any) {
                toast.error(err.data?.message || "Failed to add to cart");
            }
        } else {
            dispatch(addToCartSuccess({
                product: productId,
                name,
                price,
                image: (selectedColor && colors?.find(c => c.name === selectedColor)?.image) || thumbnail || "",
                stock,
                quantity: 1,
                size: selectedSize || undefined,
                color: selectedColor || undefined,
            }));
            toast.success("Item Added To Cart");
        }
        router.push("/cart");
    };

    const buyNow = async () => {
        if (!validateSelection()) return;

        const variant = getVariant();

        if (isAuthenticated) {
            await addToCartServer({ productId, quantity: 1, variant });
        } else {
            dispatch(addToCartSuccess({
                product: productId,
                name,
                price,
                image: (selectedColor && colors?.find(c => c.name === selectedColor)?.image) || thumbnail || "",
                stock,
                quantity: 1,
                size: selectedSize || undefined,
                color: selectedColor || undefined,
            }));
        }
        router.push("/shipping");
    };

    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const renderColors = () => (
        colors && colors.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Select Color</h3>
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-5">
                    {colors.map((color) => (
                        <div key={color.name} className="flex flex-col items-center gap-1.5">
                            <button
                                onClick={() => setSelectedColor(color.name)}
                                className={cn(
                                    "group relative p-1 rounded-full border-2 transition-all duration-200",
                                    selectedColor === color.name
                                        ? "border-blue-600 scale-110 shadow-md"
                                        : "border-transparent hover:border-gray-300 dark:hover:border-slate-600"
                                )}
                                title={color.name}
                            >
                                {color.image ? (
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-slate-800 relative">
                                        <Image
                                            src={color.image}
                                            alt={color.name}
                                            fill
                                            className="object-contain"
                                            sizes="40px"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-slate-700"
                                        style={{ backgroundColor: color.name.toLowerCase() }}
                                    />
                                )}
                                {/* Checkmark overlay */}
                                {selectedColor === color.name && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                                        <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </button>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-tight transition-colors",
                                selectedColor === color.name ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"
                            )}>
                                {color.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    );

    const renderSizes = () => (
        sizes && sizes.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm flex items-center gap-2">
                        Select Size 
                        <span className="text-[10px] font-normal text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Model is wearing size S</span>
                    </h3>
                    <button className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline">
                        Size Chart
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                                "min-w-[3rem] h-10 px-3 rounded-xl border-2 text-xs font-bold transition-all duration-200",
                                selectedSize === size
                                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm scale-105"
                                    : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
                            )}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        )
    );

    const renderButtons = () => (
        <div className="hidden lg:grid grid-cols-2 gap-4">
            <button
                onClick={stock >= 1 ? addToCartHandler : undefined}
                disabled={stock < 1}
                className="py-4 px-6 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-gray-900 dark:hover:border-slate-100 text-gray-900 dark:text-slate-100 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
                <ShoppingCart className="w-5 h-5" />
                ADD TO CART
            </button>
            <button
                onClick={stock >= 1 ? buyNow : undefined}
                disabled={stock < 1}
                className="py-4 px-6 rounded-xl bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-black dark:hover:bg-white disabled:opacity-50"
            >
                <Zap className="w-5 h-5 fill-current" />
                BUY NOW
            </button>
        </div>
    );

    const renderSticky = () => (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between p-3 lg:px-8 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe transition-transform duration-300",
            (isScrolled || window.innerWidth < 1024) ? "translate-y-0" : "translate-y-full"
        )}>
            <div className="hidden sm:flex items-center gap-4 flex-1">
                <div className="w-12 h-12 relative rounded-md overflow-hidden border border-gray-100 dark:border-slate-700">
                    <Image src={thumbnail || '/placeholder.png'} alt={name} fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-1">{name}</span>
                    <span className="text-base font-bold text-gray-900 dark:text-slate-100">₹{price.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button
                    onClick={stock >= 1 ? addToCartHandler : undefined}
                    disabled={stock < 1}
                    className="flex-1 sm:flex-none sm:w-40 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden xs:inline">Add to Cart</span>
                    <span className="xs:hidden">Add</span>
                </button>
                <button
                    onClick={stock >= 1 ? buyNow : undefined}
                    disabled={stock < 1}
                    className="flex-1 sm:flex-none sm:w-40 py-3 px-4 rounded-xl bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:bg-black dark:hover:bg-white"
                >
                    <Zap className="w-4 h-4 fill-current" />
                    Buy Now
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {!showOnly && (
                <>
                    <div className="space-y-6">
                        {renderColors()}
                        {renderSizes()}
                        {renderButtons()}
                    </div>
                    {renderSticky()}
                </>
            )}

            {showOnly === "color" && renderColors()}
            {showOnly === "size" && renderSizes()}
            {showOnly === "buttons" && (
                <>
                    {renderButtons()}
                    {renderSticky()}
                </>
            )}
        </div>
    );
};

