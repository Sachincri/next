import MyOrders from '@/components/order/MyOrder'
import React from 'react'

import { Suspense } from 'react';

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyOrders />
    </Suspense>
  )
}

export default page
