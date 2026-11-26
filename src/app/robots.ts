import type { MetadataRoute } from 'next';
import { resolveRequestSiteUrl } from '@/lib/seo-server';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const baseUrl = await resolveRequestSiteUrl();
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/me/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
