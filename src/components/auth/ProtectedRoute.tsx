'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { Loader } from '@/components/layout/Loader';
import { ProtectedRouteProps } from '@/types';

export function ProtectedRoute({
  children,
  isAuthenticated,
  adminRoute = false,
  isAdmin = false,
  redirect = '/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirect);
        return;
      }

      if (adminRoute && !isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, adminRoute, isAdmin, loading, router, redirect]);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated || (adminRoute && !isAdmin)) {
    return <Loader />;
  }

  return <>{children}</>;
}
