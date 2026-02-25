import { Metadata } from 'next';
import { Shipping } from '@/components/cart/Shipping';

export const metadata: Metadata = {
  title: 'Shipping Information | E-Commerce Store',
  description: 'Enter your delivery address details',
};

import { Suspense } from 'react';

export default function ShippingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Shipping />
    </Suspense>
  );
}
