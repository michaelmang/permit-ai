export const SHORT_LINK_PREFIX = "link:";
export const RATE_LIMIT_PREFIX = "ratelimit:shorten:";
export const RATE_LIMIT_MAX_PER_HOUR = 20;
export const MAX_TARGET_URL_LENGTH = 4096;

export function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function isLocalDev() {
  if (typeof window === "undefined") return false;
  return isLocalDevHost(window.location.hostname);
}

export function getSiteOriginFromRequest(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return null;

  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host.split(",")[0].trim()}`;
}

export function isAllowedBrowserRequest(request, siteOrigin) {
  const origin = request.headers.get("origin");
  if (origin && origin === siteOrigin) return true;

  const referer = request.headers.get("referer");
  if (referer && referer.startsWith(`${siteOrigin}/`)) return true;
  if (referer === `${siteOrigin}/`) return true;

  return false;
}

export function validateConsentUrl(targetUrl, siteOrigin) {
  if (!targetUrl || targetUrl.length > MAX_TARGET_URL_LENGTH) {
    return { ok: false, reason: "URL too long" };
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  const site = new URL(siteOrigin);
  if (parsed.origin !== site.origin) {
    return { ok: false, reason: "URL must be on this site" };
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    return { ok: false, reason: "URL must point to the site root" };
  }

  const payload = parsed.searchParams.get("d");
  if (!payload) {
    return { ok: false, reason: "Missing disclosure payload" };
  }

  return { ok: true };
}

export function createShortId() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let id = "";
  for (const byte of bytes) {
    id += alphabet[byte % alphabet.length];
  }
  return id.slice(0, 8);
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
