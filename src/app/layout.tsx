import { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ChatBot } from '@/components/ai/ChatBot';
import { DynamicFavicon } from '@/components/common/DynamicFavicon';
import Script from 'next/script';

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

const DEFAULT_METADATA = {
  title: {
    default: 'E-Commerce Store | Best Deals & Products',
    template: '%s | E-Commerce Store',
  },
  description: 'Shop the latest trends in electronics, fashion, and home goods at unbeatable prices. Fast shipping and secure payment.',
  keywords: ['ecommerce', 'online shopping', 'electronics', 'fashion', 'deals', 'store'],
  authors: [{ name: 'E-Commerce Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'E-Commerce Store | Best Deals & Products',
    description: 'Shop the latest trends at unbeatable prices.',
    type: 'website',
    locale: 'en_US',
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
 * Fetches the active store configuration (logo & store branding) on the server.
 * Ensures initial HTML & SEO web crawlers receive the exact dynamic store logo in <link rel="icon">.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const rawServerUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1').trim();
    const res = await fetch(`${rawServerUrl}/home`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const json = await res.json();
      const homeData = json?.setHomePageData || json?.data;
      const logoUrl = typeof homeData?.headerLogo === 'object'
        ? homeData?.headerLogo?.url
        : homeData?.headerLogo;
      const siteName = homeData?.pageName || homeData?.metaTitle || 'E-Commerce Store';
      const description = homeData?.metaDescription || DEFAULT_METADATA.description;

      if (logoUrl && typeof logoUrl === 'string') {
        const isSvg = logoUrl.toLowerCase().endsWith('.svg');
        const iconType = isSvg ? 'image/svg+xml' : 'image/png';

        return {
          ...DEFAULT_METADATA,
          title: {
            default: `${siteName} | Best Deals & Products`,
            template: `%s | ${siteName}`,
          },
          description,
          icons: {
            icon: [
              { url: logoUrl, type: iconType },
              { url: '/icon.svg?v=2', type: 'image/svg+xml' },
              { url: '/favicon.ico?v=2' },
            ],
            shortcut: logoUrl,
            apple: [
              { url: logoUrl },
              { url: '/apple-icon.png?v=2' },
            ],
          },
          openGraph: {
            ...DEFAULT_METADATA.openGraph,
            siteName,
            images: [{ url: logoUrl }],
          },
        };
      }
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
