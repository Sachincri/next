import { headers } from "next/headers";
import { resolveSiteUrlFromHeaders } from "./seo-utils";

/**
 * Resolve the canonical public site URL during an active Server Component or MetadataRoute request.
 */
export async function resolveRequestSiteUrl(): Promise<string> {
  try {
    const reqHeaders = await headers();
    return resolveSiteUrlFromHeaders(reqHeaders);
  } catch {
    return resolveSiteUrlFromHeaders(null);
  }
}
