'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/redux/api/wishlistApi';
import { Loader2, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAppDispatch } from '@/redux/hooks';
import { addToCartSuccess } from '@/redux/reducer/cartReducer';
import toast from 'react-hot-toast';

export function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const dispatch = useAppDispatch();

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap();
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const handleAddToCart = (product: any) => {
    dispatch(addToCartSuccess({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "/placeholder.svg",
      price: product.price,
      quantity: 1,
      stock: product.stock,
      // category: product.category, // category might not be in CartItem type anymore, leaving it out to be safe or checking types
    } as any));
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
        ) : !wishlist?.products || wishlist.products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">Your wishlist is empty</p>
            <Link href="/product">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.products.map((product: any) => (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden group">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mt-1">₹{product.price}</p>
                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart size={16} />
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
