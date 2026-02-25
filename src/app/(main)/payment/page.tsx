import { Metadata } from 'next';
import { Payment } from '@/components/cart/Payment';

export const metadata: Metadata = {
  title: 'Payment | E-Commerce Store',
  description: 'Choose your payment method and complete your order',
};

import { Suspense } from 'react';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Payment />
    </Suspense>
  );
}
