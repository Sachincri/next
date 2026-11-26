'use client';

import { useEffect } from 'react';

/**
 * BackendWarmup Component
 * 
 * Automatically sends a lightweight wake-up ping to the Render backend:
 * 1. Immediately on page load (wakes up backend if it was asleep)
 * 2. Every 10 minutes while any visitor keeps the browser tab open (prevents Render from sleeping)
 */
export function BackendWarmup() {
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const targetUrl = process.env.NEXT_PUBLIC_SERVER_URL 
          ? process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/api\/v1\/?$/, '') 
          : 'https://server-i8py.onrender.com';

        await fetch(`${targetUrl}/`, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
        });
      } catch {
        // Silently catch background ping errors
      }
    };

    // 1. Immediate wake-up on site visit
    pingBackend();

    // 2. Periodic keep-alive ping every 10 minutes
    const interval = setInterval(pingBackend, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

