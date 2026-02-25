import { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
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
    card: 'summary_large_image',
    title: 'E-Commerce Store',
    description: 'Shop the latest trends at unbeatable prices.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ChatBot } from '@/components/ai/ChatBot';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className={`min-h-screen w-full bg-background text-foreground overflow-x-hidden font-sans antialiased`}>
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
