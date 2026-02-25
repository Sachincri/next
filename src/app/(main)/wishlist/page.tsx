import { Metadata } from 'next';
import { Wishlist } from '@/components/profile/Wishlist';

export const metadata: Metadata = {
  title: 'My Wishlist | E-Commerce Store',
  description: 'View and manage your saved items',
};

import { Suspense } from 'react';

export default function WishlistPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wishlist />
    </Suspense>
  );
}
