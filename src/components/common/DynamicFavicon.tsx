"use client";

import { useEffect } from 'react';
import { useGetHomePageDataQuery } from '@/redux/api/homeApi';

export function DynamicFavicon() {
  const { data: homeData } = useGetHomePageDataQuery();

  const logoUrl = typeof homeData?.headerLogo === 'object'
    ? homeData?.headerLogo?.url
    : homeData?.headerLogo;

  useEffect(() => {
    // If admin has set a dynamic logo in CMS, use it; otherwise use branded store icon with cache-busting
    const targetUrl = logoUrl || '/icon.svg?v=2';

    const updateIconLink = (rel: string, href: string) => {
      const links = document.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (links.length > 0) {
        links.forEach((link) => {
          if (link.href !== href) {
            link.href = href;
          }
        });
      } else {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (href.endsWith('.svg') || href.includes('.svg?')) {
          link.type = 'image/svg+xml';
        } else if (href.endsWith('.png')) {
          link.type = 'image/png';
        }
        document.head.appendChild(link);
      }
    };

    try {
      updateIconLink('icon', targetUrl);
      updateIconLink('shortcut icon', targetUrl);
      updateIconLink('apple-touch-icon', targetUrl);
    } catch (err) {
      console.warn('[DynamicFavicon] Error updating favicon:', err);
    }
  }, [logoUrl]);

  return null;
}
