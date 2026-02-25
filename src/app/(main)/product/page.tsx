import { Metadata } from 'next';
import { ProductsPage } from '@/components/product/ProductsPage';
// import { ProductPageProps } from '@/types';

export const metadata: Metadata = {
  title: 'Products | E-Commerce Store',
  description: 'Browse our wide selection of products',
};
export interface ProductsPageProps {
  searchParams: {
    category?: string;
    keyword?: string;
    page?: string;
    price?: string;
    ratings?: string;
  };
  // other props
}
import { Suspense } from 'react';

export default function Products() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
