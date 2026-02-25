import { Metadata, ResolvingMetadata } from 'next';
import { ProductDetailsPageProps } from '@/types';
import { notFound } from 'next/navigation';
import { ProductInfoServer } from '@/components/product/ProductInfoServer';
import { ProductActionButtons } from '@/components/product/ProductActionButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGallery from '@/components/product/Crousal';
import { ClientIslands } from '@/components/product/ClientIslands';
import { ProductSelectionProvider } from '@/components/product/ProductSelectionContext';
import { ProductDescription } from '@/components/product/ProductDescription';
import Breadcrumb from '@/components/layout/Breadcrumb';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1';

async function getProduct(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.product || data?.data?.product || null;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

async function getSimilarProducts(categoryId: string) {
  try {
    const res = await fetch(`${BASE_URL}/products?category=${categoryId}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.products || data?.data?.products || [];
  } catch (error) {
    console.error("Failed to fetch similar products:", error);
    return [];
  }
}

/**
 * Pre-generate the first page of products at build time (ISG).
 * These routes are served as static HTML instantly — no cold start needed.
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${BASE_URL}/products?page=1`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const products: Array<{ _id: string }> = data?.data?.products || data?.products || [];
    return products.map((p) => ({ id: p._id }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: ProductDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found' };

  const seo = product.seo || {};
  const title = seo.title || `${product.name} | E-Commerce Store`;
  const description = seo.description || product.description?.substring(0, 160);
  const imageUrl = product.images?.[0]?.url;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const id = (await params).id;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const categoryId = typeof product.category === 'object' ? product.category?._id : product.category;
  const currentBrandId = typeof product.brand === 'object' ? product.brand?._id : product.brand;

  const similarProducts = await getSimilarProducts(categoryId);

  const breadcrumbLinks = [
    { label: "Home", url: "/" },
    ...(product.category ? [{ label: product.category.name, url: `/product?category=${product.category._id}` }] : []),
    { label: product.name, url: "" }
  ];

  const commonProps = {
    productId: product._id,
    stock: product.stock,
    name: product.name,
    price: product.sellingPrice || product.price,
    thumbnail: product.thumbnail?.url || product.images?.[0]?.url || "",
    colors: product.colors,
    sizes: product.sizes,
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <ProductSelectionProvider>
        <main className="w-full max-w-7xl md:mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="mb-4">
            <Breadcrumb items={breadcrumbLinks} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Left Column - Gallery & Action Group */}
            <section className="lg:col-span-7 space-y-6 lg:sticky lg:top-24 h-fit z-20">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 lg:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <ProductGallery product={product} />
              </div>

              {/* Action Buttons (Desktop Only) */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <ProductActionButtons {...commonProps} showOnly="buttons" />
              </div>
            </section>

            {/* Right Column - Info & Selectors */}
            <section className="lg:col-span-5 space-y-8">
              <ProductInfoServer product={product} breadcrumbLinks={breadcrumbLinks} />

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                <ProductActionButtons {...commonProps} showOnly="color" />
                <ProductActionButtons {...commonProps} showOnly="size" />
              </div>

              {/* Mobile View: Show all buttons below info */}
              <div className="lg:hidden">
                <ProductActionButtons {...commonProps} />
              </div>
            </section>
          </div>

          {/* Tabs Section */}
          <section className="mt-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <Tabs defaultValue="description">
              <TabsList className="mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.ratings?.count || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <ProductDescription html={product.description} />
              </TabsContent>

              <TabsContent value="specifications">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications?.map((group: { _id?: string; title: string; items: Array<{ _id?: string; key: string; value: string }> }) => (
                    <div key={group._id ?? group.title} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-bold mb-1 text-sm text-slate-800 dark:text-slate-100">{group.title}</h3>
                      <div className="space-y-1">
                        {group.items?.map((item) => (
                          <div key={item._id ?? item.key} className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-slate-400">{item.key}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                {/* Wrapped in ClientIslands below */}
              </TabsContent>
            </Tabs>
          </section>

          {/* Client side islands for interactivity and heavy charts/suggestions */}
          <div className="mt-8">
            <ClientIslands
              productId={product._id}
              initialReviews={product.reviews || []}
              averageRating={product.ratings?.average || 0}
              ratingCount={product.ratings?.count || 0}
              categoryId={categoryId}
              currentBrandId={currentBrandId}
              similarProducts={similarProducts}
            />
          </div>
        </main>
      </ProductSelectionProvider>
    </div>
  );
}

