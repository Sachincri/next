"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGetHomePageDataQuery } from '@/redux/api/homeApi';
import { getFaviconMimeType, optimizeFaviconUrl } from '@/lib/seo-utils';

export function DynamicFavicon() {
  const pathname = usePathname();
  const { data: homeData } = useGetHomePageDataQuery();
  const faviconUrl = optimizeFaviconUrl(homeData?.headerLogo);

  useEffect(() => {
    // Do NOT overwrite SSR <link rel="icon"> tags while homeData is still loading
    // or if no custom CMS logo is configured.
    if (!faviconUrl) return;

    const mimeType = getFaviconMimeType(faviconUrl);

    const updateIconLink = (rel: string) => {
      const links = document.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (links.length > 0) {
        links.forEach((link) => {
          if (link.getAttribute('href') !== faviconUrl) {
            link.href = faviconUrl;
          }
          if (rel === 'apple-touch-icon') {
            if (link.hasAttribute('type')) link.removeAttribute('type');
          } else if (link.getAttribute('type') !== mimeType) {
            link.type = mimeType;
          }
        });
      } else {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = faviconUrl;
        if (rel !== 'apple-touch-icon') {
          link.type = mimeType;
        }
        document.head.appendChild(link);
      }
    };

    try {
      updateIconLink('icon');
      updateIconLink('shortcut icon');
      updateIconLink('apple-touch-icon');
    } catch (err) {
      console.warn('[DynamicFavicon] Error updating favicon:', err);
    }
  }, [faviconUrl, pathname]);

  return null;
}
