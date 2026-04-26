'use client';

import React from 'react';
// import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, Package, Heart, LayoutDashboard, LogOut } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import dynamic from 'next/dynamic';
const NotificationsPopover = dynamic(() => import('@/components/admin/notifications-popover').then(mod => mod.NotificationsPopover), { ssr: false });
import { Search } from './Search';
const DrawerComponent = dynamic(() => import('./Drawer').then(mod => mod.DrawerComponent), { ssr: false });
import { useLogoutMutation } from '@/redux/api/userApi';
import { useGetHomePageDataQuery } from '@/redux/api/homeApi';
import { useGetCartQuery } from '@/redux/api/cartApi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const isCheckoutPage = ['/shipping', '/order-summary', '/payment'].includes(pathname);

  const { cartItems } = useAppSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.user);
  const { data: homeData } = useGetHomePageDataQuery();
  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  const [logout] = useLogoutMutation();
  const [mounted, setMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  // If authenticated show server length, otherwise show local length
  const cartCount = isAuthenticated ? (serverCart?.length || 0) : cartItems.length;

  React.useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only apply on mobile (less than 768px typically)
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // Scrolling down & not at the very top
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        // Always show on desktop
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const logoUrl = typeof homeData?.headerLogo === 'object' ? homeData.headerLogo.url : homeData?.headerLogo;

  const userMenuItems = [
    { icon: <User className="w-4 h-4" />, name: 'My Account', path: '/me' },
    { icon: <Package className="w-4 h-4" />, name: 'My Orders', path: '/me?tab=orders' },
    { icon: <ShoppingCart className="w-4 h-4" />, name: 'My Cart', path: '/cart' },
    { icon: <Heart className="w-4 h-4" />, name: 'WishList', path: '/wishlist' },
  ];

  if (mounted && user && user.role === 'admin') {
    userMenuItems.push({
      icon: <LayoutDashboard className="w-4 h-4" />,
      name: 'Dashboard',
      path: '/admin'
    });
  }

  const logoutHandler = async () => {
    try {
      const res = await logout().unwrap();
      toast.success(res?.message || 'Logged out successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Logout failed');
    }
  };

  if (isCheckoutPage) {
    return (
      <nav className="bg-[#0d0e26] sticky top-0 w-full z-50 shadow-md">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20 px-4 md:px-8">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors">
              {logoUrl ? (
                <div className="relative h-14 w-30 md:w-48">
                  <Image src={logoUrl} alt="Logo" fill style={{ objectFit: 'cover', objectPosition: 'left' }} priority />
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight">E-Store</span>
                  <span className="text-[10px] opacity-80 flex items-center">
                    Explore <span className="text-yellow-400 font-bold ml-1 italic">Plus</span>
                  </span>
                </div>
              )}
            </Link>
            <div className="flex items-center space-x-2 text-green-400">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-bold text-sm sm:text-base">100% Secure Checkout</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`bg-[#0d0e26] sticky top-0 w-full z-50 shadow-md transition-transform duration-300 ease-in-out translate-y-0`}>
      <div className="container-custom">
        <div className="flex justify-between md:justify-center items-center h-20 md:gap-8">
          {/* Mobile menu & Logo Group */}
          <div className="flex items-center space-x-0">
            <div className="lg:hidden">
              <DrawerComponent listArray={userMenuItems} />
            </div>

            <Link href="/" className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors">
              {logoUrl ? (
                <div className="relative h-14 w-30 md:w-48">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'left' }}
                    priority
                  />
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight">E-Store</span>
                  <span className="text-[10px] opacity-80 flex items-center">
                    Explore <span className="text-yellow-400 font-bold ml-1 italic">Plus</span>
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <Search />
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            {/* User Notifications */}
            {mounted && isAuthenticated && (
              <div className="text-white">
                <NotificationsPopover />
              </div>
            )}

            {/* Login/User dropdown */}
            <div className="relative group">
              <Link
                href={mounted && isAuthenticated ? '/me' : '/login'}
                className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors py-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block font-medium">
                  {mounted && isAuthenticated ? user?.name : 'Login'}
                </span>
              </Link>

              <div className="absolute top-full left-0 h-2 w-full bg-transparent" />

              {/* Dropdown menu for authenticated users */}
              {mounted && isAuthenticated && (
                <div className="absolute right-0 mt-0 w-48 bg-white dark:bg-slate-800 rounded-md shadow-xl dark:shadow-slate-900/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200  border border-gray-100 dark:border-slate-700 overflow-hidden z-[60]">
                  <div className="py-1">
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="flex items-center My Orders space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-50 dark:border-slate-700 last:border-0"
                      >
                        <span className="text-gray-500 dark:text-slate-400">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <div className="bg-gray-50 dark:bg-slate-900/50">
                      <button
                        onClick={logoutHandler}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center space-x-2 text-white hover:text-blue-200 transition-colors py-2"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#0d0e26] text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block font-medium">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden pb-4 px-4">
        <Search />
      </div>
    </nav>
  );
}
