export const SHORT_LINK_PREFIX = "link:";
export const RATE_LIMIT_PREFIX = "ratelimit:shorten:";
export const RATE_LIMIT_MAX_PER_HOUR = 20;
export const MAX_TARGET_URL_LENGTH = 4096;

function getHeader(source, name) {
  if (!source) return null;
  if (typeof source.headers?.get === "function") {
    return source.headers.get(name);
  }
  const headers = source.headers || {};
  return headers[name] || headers[name.toLowerCase()] || null;
}

export function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function isLocalDev() {
  if (typeof window === "undefined") return false;
  return isLocalDevHost(window.location.hostname);
}

/** Prefer the request host so preview deployments work without per-env SITE_URL. */
export function getSiteOriginFromRequest(source) {
  const host = getHeader(source, "x-forwarded-host") || getHeader(source, "host");
  if (host) {
    const proto = getHeader(source, "x-forwarded-proto") || "https";
    return `${proto}://${String(host).split(",")[0].trim()}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return null;
}

export function isAllowedBrowserRequest(source, siteOrigin) {
  const origin = getHeader(source, "origin");
  if (origin && origin === siteOrigin) return true;

  const referer = getHeader(source, "referer");
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

export function getClientIp(source) {
  const forwarded = getHeader(source, "x-forwarded-for");
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return getHeader(source, "x-real-ip") || "unknown";
}
