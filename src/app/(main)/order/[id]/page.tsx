import React from 'react';
import OrderDetails from '@/components/order/OrderDetails'


import { Suspense } from 'react';

const page = () => {
  return (
    <Suspense fallback={<div>Loading order details...</div>}>
      <OrderDetails />
    </Suspense>
  )
}

export default page
