'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useLoadUserQuery } from '@/redux/api/userApi';
import { Loader } from '@/components/layout/Loader';
import toast from 'react-hot-toast';
import { clearError, clearMessage } from '@/redux/reducer/userReducer';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { error, message, loading: reduxLoading } = useAppSelector((state) => state.user);
  const { isLoading: queryLoading } = useLoadUserQuery();

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : (error as any)?.data?.message || 'An error occurred');
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [dispatch, error, message]);

  // Only show the global loader for initial query loading (session check)
  // reduxLoading should not unmount the whole app for background mutations
  const loading = queryLoading;

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
}
