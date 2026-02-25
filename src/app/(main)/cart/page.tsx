import React from 'react'
import Cart from '@/components/cart/Cart'


import { Suspense } from 'react';

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Cart />
    </Suspense>
  );
}


