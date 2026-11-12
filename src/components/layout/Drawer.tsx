'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Home, ShoppingBag, LogOut, ChevronRight,
  LayoutGrid, HelpCircle, Phone, ShieldCheck, ArrowRight, Trophy
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { useLogoutMutation } from '@/redux/api/userApi';
import { useGetAllCategoriesQuery } from '@/redux/api/productApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DrawerItem {
  icon: React.ReactNode;
  name: string;
  path: string;
}

interface DrawerProps {
  listArray: DrawerItem[];
}

export function DrawerComponent({ listArray }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandCategories, setExpandCategories] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const { cartItems } = useAppSelector((state: RootState) => state.cart);
  const { data: categories } = useGetAllCategoriesQuery();
  const [logout] = useLogoutMutation();

  const toggleDrawer = () => setIsOpen(!isOpen);
  const closeDrawer = () => {
    setIsOpen(false);
    setExpandCategories(false);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('Logged out successfully');
      closeDrawer();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Logout failed');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <button
        onClick={toggleDrawer}
        className="p-2 text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity duration-300"
          onClick={closeDrawer}
        />,
        document.body
      )}

      {/* Sidebar */}
      {mounted && createPortal(
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-gradient-to-b from-[#0f142e] via-[#090b1a] to-[#05060e] text-white backdrop-blur-2xl shadow-[25px_0_60px_-15px_rgba(0,0,0,0.85)] transform transition-transform duration-300 ease-out z-[100] lg:hidden flex flex-col border-r border-white/10",
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Header Section */}
          <div className="relative p-6 overflow-hidden shrink-0 border-b border-white/10 bg-white/[0.02]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShoppingBag className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8 text-white" />
            </div>

            <button
              onClick={closeDrawer}
              aria-label="Close drawer"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 mt-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-indigo-500/40 shadow-lg ring-2 ring-indigo-500/20">
                    <AvatarImage src={user.avatar?.url} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold truncate text-white">{user.name}</h3>
                    <p className="text-xs truncate text-zinc-400 mt-0.5">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white tracking-tight">Welcome Guest!</h3>
                  <p className="text-zinc-400 text-xs mb-3">Sign in to track orders & explore deals</p>
                  <div className="flex gap-2.5">
                    <Link
                      href="/login"
                      onClick={closeDrawer}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-2 px-4 rounded-xl font-semibold text-xs text-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeDrawer}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/15 py-2 px-4 rounded-xl font-semibold text-xs text-center transition-all active:scale-95"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
            <div className="p-4 space-y-5">

              {/* Main Navigation */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all text-sm",
                    isActive('/')
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-400 font-semibold border border-indigo-500/30 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  <Home className="w-5 h-5 text-indigo-400" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/product"
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all text-sm",
                    isActive('/product')
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-400 font-semibold border border-indigo-500/30 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  <ShoppingBag className="w-5 h-5 text-violet-400" />
                  <span>All Products</span>
                </Link>

                <Link
                  href="/leaderboard"
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all text-sm",
                    isActive('/leaderboard')
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-400 font-semibold border border-indigo-500/30 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Leaderboard</span>
                </Link>

                {/* Categories Accordion */}
                <div className="pt-1">
                  <button
                    onClick={() => setExpandCategories(!expandCategories)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-5 h-5 text-cyan-400" />
                      <span>Categories</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 text-zinc-400",
                        expandCategories ? 'rotate-90' : ''
                      )}
                    />
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expandCategories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <div className="pl-4 pr-2 pb-2 space-y-1 mt-1 border-l-2 border-white/10 ml-5">
                      {categories?.map((cat: any) => {
                        const catName = typeof cat === 'string' ? cat : cat.name;
                        const catId = typeof cat === 'string' ? cat : (cat.id || cat._id);

                        return (
                          <Link
                            key={catId}
                            href={`/product?category=${catId}`}
                            onClick={closeDrawer}
                            className="block py-2 px-3 text-xs text-zinc-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-white/[0.04]"
                          >
                            {catName}
                          </Link>
                        );
                      })}
                      <Link
                        href="/categories"
                        onClick={closeDrawer}
                        className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        View All Categories <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* User Links */}
              {isAuthenticated && (
                <div className="space-y-1">
                  <p className="px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    My Account
                  </p>
                  {listArray.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={closeDrawer}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-all text-sm",
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-400 font-semibold border border-indigo-500/30 shadow-sm'
                          : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive(item.path) ? 'text-indigo-400' : 'text-zinc-400'}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'My Cart' && cartItems.length > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {cartItems.length}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              <div className="h-px bg-white/10" />

              {/* Help & Support */}
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Support
                </p>
                <Link
                  href="/contact"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                >
                  <Phone className="w-5 h-5 text-zinc-400" />
                  <span>Contact Us</span>
                </Link>
                <Link
                  href="/about"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                >
                  <HelpCircle className="w-5 h-5 text-zinc-400" />
                  <span>About Us</span>
                </Link>
                <Link
                  href="/privacy-policy"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all text-sm"
                >
                  <ShieldCheck className="w-5 h-5 text-zinc-400" />
                  <span>Privacy Policy</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          {isAuthenticated && (
            <div className="p-4 mt-auto border-t border-white/10 bg-white/[0.02]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all font-medium border border-rose-500/30 hover:border-rose-500/40"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Footer Info */}
          <div className="p-4 text-center border-t border-white/10 bg-black/20">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} E-Store. All rights reserved.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
