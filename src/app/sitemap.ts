import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function fetchAll<T>(url: string, fallback: T[]): Promise<T[]> {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return fallback;
        return res.json().then(d => d?.data?.products || d?.products || d?.data || fallback);
    } catch {
        return fallback;
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages — always included
    const staticPages: MetadataRoute.Sitemap = [
        { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${APP_URL}/product`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${APP_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${APP_URL}/signup`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic: all products
    interface RawProduct { _id: string; updatedAt?: string }
    const products = await fetchAll<RawProduct>(`${BASE_URL}/products?page=1`, []);
    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${APP_URL}/product/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Dynamic: all categories
    interface RawCategory { _id: string; updatedAt?: string }
    const categories = await fetchAll<RawCategory>(`${BASE_URL}/categories`, []);
    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
        url: `${APP_URL}/product?category=${c._id}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
}
