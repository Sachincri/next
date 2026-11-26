import type { MetadataRoute } from 'next';
import { getServerApiUrl } from '@/lib/seo-utils';
import { resolveRequestSiteUrl } from '@/lib/seo-server';

export const dynamic = 'force-dynamic';

async function fetchAll<T>(url: string, fallback: T[]): Promise<T[]> {
    try {
        const res = await fetch(url, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return fallback;
        return res.json().then(d => d?.data?.products || d?.products || d?.data || fallback);
    } catch {
        return fallback;
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [appUrl, baseUrl] = await Promise.all([
        resolveRequestSiteUrl(),
        Promise.resolve(getServerApiUrl()),
    ]);

    // Static pages — always included
    const staticPages: MetadataRoute.Sitemap = [
        { url: appUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${appUrl}/product`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${appUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${appUrl}/signup`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic: all products and categories in parallel
    interface RawProduct { _id: string; updatedAt?: string }
    interface RawCategory { _id: string; updatedAt?: string }

    const [products, categories] = await Promise.all([
        fetchAll<RawProduct>(`${baseUrl}/products?page=1&limit=500`, []),
        fetchAll<RawCategory>(`${baseUrl}/categories`, []),
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${appUrl}/product/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
        url: `${appUrl}/product?category=${c._id}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
}
