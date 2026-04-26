'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, CreditCard } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isCheckoutPage = ['/shipping', '/order-summary', '/payment'].includes(pathname);
  const currentYear = new Date().getFullYear();

  if (isCheckoutPage) {
    return (
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500">
        &copy; {currentYear} E-Store. Safe & Secure Checkout.
      </footer>
    );
  }

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/product' },
        { name: 'Featured', href: '/product?featured=true' },
        { name: 'New Arrivals', href: '/product?sort=newest' },
        { name: 'Best Sellers', href: '/product?sort=bestsellers' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Sustainability', href: '/sustainability' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Shipping & Returns', href: '/help/shipping' },
        { name: 'Order Status', href: '/orders' },
        { name: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Accessibility', href: '/accessibility' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ];

  return (
    <footer className="bg-[#0d0e26] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors duration-300">


      {/* Trust Badges */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">100% secure payments</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Easy Returns</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">7-day return policy</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Authentic Products</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sourced directly from brands</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">24/7 Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dedicated help center</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-slate-900 font-bold text-lg">E</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Store</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Premium quality products curated for your lifestyle. Experience shopping like never before with our customer-first approach.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>123 Commerce St, New York, NY</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Copyright */}
            <p className="text-sm text-slate-500 dark:text-slate-400 order-2 md:order-1">
              &copy; {currentYear} E-Store. All rights reserved.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-4 order-1 md:order-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all font-bold"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Payments */}
            <div className="flex items-center gap-2 order-3">
              <div className="h-8 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">VISA</span>
              </div>
              <div className="h-8 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">MC</span>
              </div>
              <div className="h-8 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AMEX</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
