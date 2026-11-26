import type { Metadata } from "next";

const CLOUDINARY_TRANSFORM = "f_jpg,q_auto:eco,w_1200,h_630,c_fill";
const TRANSFORM_SEGMENT_RE =
  /^(w_|h_|c_|f_|q_|dpr_|ar_|e_|g_|bo_|r_|b_|l_|u_|fl_|t_)/;
const PRODUCTION_FALLBACK_API_URL = "https://server-i8py.onrender.com/api/v1";
const PLACEHOLDER_HOST_RE = /your-live-domain\.com/i;
const LOCAL_HOST_RE = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;

const normalizeAbsoluteOrigin = (
  raw?: string | null,
  assumeHttps = false
): string | null => {
  const trimmed = raw?.trim();
  if (!trimmed || PLACEHOLDER_HOST_RE.test(trimmed)) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : assumeHttps
      ? `https://${trimmed}`
      : trimmed;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
};

const isLocalUrl = (url: string): boolean => {
  try {
    return LOCAL_HOST_RE.test(new URL(url).host);
  } catch {
    return true;
  }
};

export function getSiteUrl(): string {
  const explicitCandidates = [
    normalizeAbsoluteOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeAbsoluteOrigin(process.env.NEXT_PUBLIC_APP_URL),
    normalizeAbsoluteOrigin(process.env.SITE_URL),
    normalizeAbsoluteOrigin(process.env.FRONTEND_URL),
  ];

  for (const candidate of explicitCandidates) {
    if (candidate && !isLocalUrl(candidate)) {
      return candidate;
    }
  }

  const vercelUrl =
    normalizeAbsoluteOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL, true) ||
    normalizeAbsoluteOrigin(process.env.VERCEL_URL, true);
  if (vercelUrl && !isLocalUrl(vercelUrl)) {
    return vercelUrl;
  }

  const anyExplicit = explicitCandidates.find(Boolean);
  if (anyExplicit) return anyExplicit;

  return process.env.NODE_ENV === "production"
    ? "https://your-live-domain.com"
    : "http://localhost:3000";
}

/**
 * Resolve the canonical public site URL from explicit env vars, optional request headers,
 * or Vercel deployment environment variables without requiring server-only imports.
 */
export function resolveSiteUrlFromHeaders(
  reqHeaders?: { get(name: string): string | null } | null
): string {
  const explicitCandidates = [
    normalizeAbsoluteOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeAbsoluteOrigin(process.env.NEXT_PUBLIC_APP_URL),
    normalizeAbsoluteOrigin(process.env.SITE_URL),
    normalizeAbsoluteOrigin(process.env.FRONTEND_URL),
  ];

  for (const candidate of explicitCandidates) {
    if (candidate && !isLocalUrl(candidate)) {
      return candidate;
    }
  }

  let localRequestOrigin: string | null = null;
  if (reqHeaders) {
    const rawHost =
      reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || "";
    const host = rawHost.split(",")[0]?.trim();
    if (host) {
      const rawProto = reqHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
      const isLocal = LOCAL_HOST_RE.test(host);
      const proto = rawProto || (isLocal ? "http" : "https");
      const origin = normalizeAbsoluteOrigin(`${proto}://${host}`);
      if (origin && !isLocal) {
        return origin;
      }
      if (origin) {
        localRequestOrigin = origin;
      }
    }
  }

  const vercelUrl =
    normalizeAbsoluteOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL, true) ||
    normalizeAbsoluteOrigin(process.env.VERCEL_URL, true);
  if (vercelUrl && !isLocalUrl(vercelUrl)) {
    return vercelUrl;
  }

  return localRequestOrigin || getSiteUrl();
}

export function getServerApiUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SERVER_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];

  for (const raw of candidates) {
    const trimmed = raw?.trim().replace(/\/+$/, "");
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;
      const cleanPath = parsed.pathname.replace(/\/+$/, "");
      return cleanPath.endsWith("/api/v1")
        ? `${parsed.origin}${cleanPath}`
        : `${parsed.origin}${cleanPath}/api/v1`;
    } catch {
      // Ignore relative paths during SSR
    }
  }

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_FALLBACK_API_URL
    : "http://localhost:5000/api/v1";
}

/**
 * Optimizes an OG Image URL for WhatsApp, Facebook, Instagram, and X crawlers:
 * - Upgrades http:// to https://
 * - Transforms Cloudinary URLs to 1200x630 JPG compressed under 300 KB
 * - Strips .webp/.avif extensions in favor of .jpg
 */
export function optimizeOgImageUrl(
  rawImage?: string | { url?: string } | null
): string | undefined {
  if (!rawImage) return undefined;
  const raw =
    typeof rawImage === "string" ? rawImage.trim() : (rawImage.url || "").trim();
  if (!raw || raw === "pending" || raw.startsWith("blob:")) return undefined;

  let normalized = raw;

  if (normalized.startsWith("/")) {
    normalized = `${getSiteUrl()}${normalized}`;
  } else if (
    normalized.startsWith("http://") &&
    !normalized.includes("localhost") &&
    !normalized.includes("127.0.0.1")
  ) {
    normalized = normalized.replace("http://", "https://");
  }

  const marker = "/image/upload/";
  if (normalized.includes("res.cloudinary.com") && normalized.includes(marker)) {
    const idx = normalized.indexOf(marker);
    const prefix = normalized.slice(0, idx + marker.length);
    const rest = normalized.slice(idx + marker.length);

    const parts = rest.split("/");
    const versionIdx = parts.findIndex((p) => /^v\d+$/.test(p));

    let cleanParts: string[];
    if (versionIdx !== -1) {
      cleanParts = parts.slice(versionIdx);
    } else {
      cleanParts = [...parts];
      while (
        cleanParts.length > 1 &&
        (cleanParts[0].includes(",") || TRANSFORM_SEGMENT_RE.test(cleanParts[0]))
      ) {
        cleanParts.shift();
      }
    }

    let cleanPath = cleanParts.join("/");
    cleanPath = cleanPath.replace(
      /\.(webp|png|avif|jpeg|gif)(\?.*)?$/i,
      ".jpg$2"
    );

    normalized = `${prefix}${CLOUDINARY_TRANSFORM}/${cleanPath}`;
  }

  return normalized;
}

export function getFaviconMimeType(url: string): string {
  const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
  if (cleanUrl.endsWith(".svg")) return "image/svg+xml";
  if (cleanUrl.endsWith(".ico")) return "image/x-icon";
  if (cleanUrl.endsWith(".webp")) return "image/webp";
  if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
}

/**
 * Normalizes the CMS header logo URL into a crisp, fast-loading browser favicon URL:
 * - Upgrades http:// to https:// on non-local hosts
 * - Serves Cloudinary assets as a lightweight 128x128 PNG so MIME type & size match all browsers
 */
export function optimizeFaviconUrl(
  rawLogo?: string | { url?: string } | null
): string | undefined {
  if (!rawLogo) return undefined;
  const raw =
    typeof rawLogo === "string" ? rawLogo.trim() : (rawLogo.url || "").trim();
  if (!raw || raw === "pending" || raw.startsWith("blob:")) return undefined;

  let normalized = raw;
  if (
    normalized.startsWith("http://") &&
    !normalized.includes("localhost") &&
    !normalized.includes("127.0.0.1")
  ) {
    normalized = normalized.replace("http://", "https://");
  }

  const marker = "/image/upload/";
  if (normalized.includes("res.cloudinary.com") && normalized.includes(marker)) {
    const idx = normalized.indexOf(marker);
    const prefix = normalized.slice(0, idx + marker.length);
    const rest = normalized.slice(idx + marker.length);
    const parts = rest.split("/");
    const versionIdx = parts.findIndex((p) => /^v\d+$/.test(p));

    let cleanParts: string[];
    if (versionIdx !== -1) {
      cleanParts = parts.slice(versionIdx);
    } else {
      cleanParts = [...parts];
      while (
        cleanParts.length > 1 &&
        (cleanParts[0].includes(",") || TRANSFORM_SEGMENT_RE.test(cleanParts[0]))
      ) {
        cleanParts.shift();
      }
    }

    const cleanPath = cleanParts
      .join("/")
      .replace(/\.(webp|avif|jpeg|jpg|gif|svg)(\?.*)?$/i, ".png$2");

    normalized = `${prefix}w_128,h_128,c_fit,f_png,q_auto/${cleanPath}`;
  }

  return normalized;
}

export async function fetchActiveHomeData(): Promise<any | null> {
  try {
    const serverUrl = getServerApiUrl();
    const res = await fetch(`${serverUrl}/home`, {
      next: { revalidate: 60, tags: ["home-seo"] },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.setHomePageData || json?.data || null;
  } catch {
    return null;
  }
}

export async function triggerHomeSeoRevalidate(path = "/"): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: "home-seo", path }),
    });
  } catch {
    // Non-fatal in case running standalone or offline
  }
}

export function buildHomeMetadata(
  homeData: any | null,
  pagePath = "/"
): Metadata {
  const siteUrl = getSiteUrl();
  const seo = homeData?.seo || {};
  const storeName = homeData?.storeName || "E-Commerce Store";

  const title =
    seo.title || `${storeName} | Best Deals & Products`;
  const description =
    seo.description ||
    seo.metaDescription ||
    "Shop the latest trends in electronics, fashion, and home goods at unbeatable prices. Fast shipping and secure payment.";

  const ogTitle = seo.ogTitle?.trim() || title;
  const ogDescription = seo.ogDescription?.trim() || description;
  const ogImageUrl = optimizeOgImageUrl(seo.ogImage);

  const canonical = seo.canonicalUrl?.trim() || pagePath;
  const pageFullUrl = seo.canonicalUrl?.trim()
    ? seo.canonicalUrl.trim()
    : `${siteUrl}${pagePath === "/" ? "" : pagePath}`;
  const allowIndex = !Boolean(seo.noIndex);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: allowIndex,
      follow: allowIndex,
      googleBot: {
        index: allowIndex,
        follow: allowIndex,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      locale: "en_IN",
      url: pageFullUrl,
      siteName: storeName,
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: ogTitle,
                type: "image/jpeg",
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
