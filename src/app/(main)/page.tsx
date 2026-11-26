import { Metadata } from 'next';
import Home from '@/components/home/Home';
import {
  fetchActiveHomeData,
  buildHomeMetadata,
  getSiteUrl,
  optimizeOgImageUrl,
} from '@/lib/seo-utils';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchActiveHomeData();
  return buildHomeMetadata(data, '/');
}

export default async function HomePage() {
  const data = await fetchActiveHomeData();
  const siteUrl = getSiteUrl();
  const seo = data?.seo || {};
  const storeName = data?.storeName || seo.title || 'E-Commerce Store';
  const description =
    seo.description ||
    seo.metaDescription ||
    'Shop the latest trends in electronics, fashion, and home goods at unbeatable prices.';
  const logoUrl =
    typeof data?.headerLogo === 'object'
      ? data?.headerLogo?.url
      : data?.headerLogo;
  const ogImageUrl = optimizeOgImageUrl(seo.ogImage);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: storeName,
        url: siteUrl,
        ...(logoUrl ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
        ...(ogImageUrl ? { image: ogImageUrl } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: storeName,
        description,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/product?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home initialData={data} />
    </>
  );
}
