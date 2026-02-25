"use client";

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { rehydrateFromStorage } from '@/redux/reducer/productReducer';

export function Providers({ children }: { children: React.ReactNode }) {
  // Safely rehydrate client-only state (recentlyViewed) after first render.
  // This must NOT run on the server — useEffect guarantees it never does.
  useEffect(() => {
    store.dispatch(rehydrateFromStorage());
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
