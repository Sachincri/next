import { Metadata } from 'next';
import { OrderSummary } from '@/components/cart/OrderSummary';

export const metadata: Metadata = {
  title: 'Order Summary | E-Commerce Store',
  description: 'Review your order details before payment',
};

import { Suspense } from 'react';

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={<div>Loading order details...</div>}>
      <OrderSummary />
    </Suspense>
  );
}
