'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Home, ShoppingBag, LogOut, ChevronRight,
  LayoutGrid, HelpCircle, Phone, ShieldCheck, ArrowRight
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
            "fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#0d0e26] text-white backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out z-[100] lg:hidden flex flex-col border-r border-white/10",
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Header Section */}
          <div className="relative p-6 overflow-hidden shrink-0 border-b border-white/10 bg-transparent">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShoppingBag className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
            </div>

            <button
              onClick={closeDrawer}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 mt-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
                    <AvatarImage src={user.avatar?.url} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate text-foreground text-gray-600">{user.name}</h3>
                    <p className="text-muted-foreground text-sm truncate text-gray-600">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">Welcome Guest!</h3>
                  <p className="text-muted-foreground text-sm mb-4">Sign in to access your account</p>
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={closeDrawer}
                      className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold text-sm text-center shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeDrawer}
                      className="flex-1 bg-secondary text-secondary-foreground border border-border py-2 px-4 rounded-lg font-semibold text-sm text-center hover:bg-secondary/80 transition-all active:scale-95"
                    >
                      SignUp
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 space-y-6">

              {/* Main Navigation */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    isActive('/') ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/product"
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    isActive('/product') ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>All Products</span>
                </Link>

                {/* Categories Accordion */}
                <div className="pt-1">
                  <button
                    onClick={() => setExpandCategories(!expandCategories)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-5 h-5" />
                      <span>Categories</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        expandCategories ? 'rotate-90' : ''
                      )}
                    />
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expandCategories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <div className="pl-4 pr-2 pb-2 space-y-1 mt-1 border-l-2 border-border ml-5">
                      {categories?.map((cat: any) => {
                        const catName = typeof cat === 'string' ? cat : cat.name;
                        const catId = typeof cat === 'string' ? cat : (cat.id || cat._id);

                        return (
                          <Link
                            key={catId}
                            href={`/product?category=${catId}`}
                            onClick={closeDrawer}
                            className="block py-2 px-4 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent/50"
                          >
                            {catName}
                          </Link>
                        );
                      })}
                      <Link
                        href="/categories"
                        onClick={closeDrawer}
                        className="flex items-center gap-2 py-2 px-4 text-sm font-medium text-primary hover:underline"
                      >
                        View All Categories <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* User Links */}
              {isAuthenticated && (
                <div className="space-y-1">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    My Account
                  </p>
                  {listArray.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={closeDrawer}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-all",
                        isActive(item.path) ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'My Cart' && cartItems.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {cartItems.length}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              <div className="h-px bg-border" />

              {/* Help & Support */}
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Support
                </p>
                <Link
                  href="/contact"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>Contact Us</span>
                </Link>
                <Link
                  href="/about"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>About Us</span>
                </Link>
                <Link
                  href="/privacy-policy"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Privacy Policy</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          {isAuthenticated && (
            <div className="p-4 mt-auto border-t border-white/10 bg-transparent">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium border border-destructive/20 hover:border-destructive/30"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Footer Info */}
          <div className="p-4 text-center border-t border-white/10 bg-transparent">
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} E-Store. All rights reserved.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
