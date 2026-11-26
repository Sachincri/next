import { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ChatBot } from '@/components/ai/ChatBot';
import { DynamicFavicon } from '@/components/common/DynamicFavicon';
import { BackendWarmup } from '@/components/common/BackendWarmup';
import Script from 'next/script';
import {
  getSiteUrl,
  fetchActiveHomeData,
  buildHomeMetadata,
  optimizeFaviconUrl,
  getFaviconMimeType,
} from '@/lib/seo-utils';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d0e26',
  viewportFit: 'cover',
};

const SITE_URL = getSiteUrl();

const DEFAULT_METADATA: Metadata = {
  title: {
    default: 'E-Commerce Store | Best Deals & Products',
    template: '%s | E-Commerce Store',
  },
  description: 'Shop the latest trends in electronics, fashion, and home goods at unbeatable prices. Fast shipping and secure payment.',
  keywords: ['ecommerce', 'online shopping', 'electronics', 'fashion', 'deals', 'store'],
  authors: [{ name: 'E-Commerce Team' }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'E-Commerce Store | Best Deals & Products',
    description: 'Shop the latest trends at unbeatable prices.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'E-Commerce Store',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'E-Commerce Store',
    description: 'Shop the latest trends at unbeatable prices.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2' },
    ],
    shortcut: '/icon.svg?v=2',
    apple: '/apple-icon.png?v=2',
  },
};

/**
 * Enterprise SSR Dynamic Metadata:
 * Fetches the active store SEO configuration & branding on the server.
 * Ensures web crawlers & social scrapers (WhatsApp, Facebook, X) receive exact OG tags and icons.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const homeData = await fetchActiveHomeData();
    if (homeData) {
      const seoMeta = buildHomeMetadata(homeData, '/');
      const faviconUrl = optimizeFaviconUrl(homeData?.headerLogo);
      const storeName = homeData?.storeName || homeData?.seo?.title || 'E-Commerce Store';

      const icons = faviconUrl
        ? {
            icon: [
              { url: faviconUrl, type: getFaviconMimeType(faviconUrl) },
            ],
            shortcut: faviconUrl,
            apple: [{ url: faviconUrl }],
          }
        : DEFAULT_METADATA.icons;

      return {
        ...DEFAULT_METADATA,
        ...seoMeta,
        title: {
          default: (seoMeta.title as string) || `${storeName} | Best Deals & Products`,
          template: `%s | ${storeName}`,
        },
        icons,
      };
    }
  } catch {
    // Graceful fallback during offline build, cold start, or network delay
  }

  return DEFAULT_METADATA;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className={`min-h-screen w-full bg-background text-foreground overflow-x-hidden font-sans antialiased`}>
        <Providers>
          <DynamicFavicon />
          <BackendWarmup />
          {children}
          <ChatBot />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                fontSize: '14px',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
        </Providers>
      </body>
    </html>
  );
}
