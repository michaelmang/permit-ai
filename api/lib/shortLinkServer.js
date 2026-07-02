const { randomBytes } = require("node:crypto");

const SHORT_LINK_PREFIX = "link:";
const RATE_LIMIT_PREFIX = "ratelimit:shorten:";
const RATE_LIMIT_MAX_PER_HOUR = 20;
const MAX_TARGET_URL_LENGTH = 4096;

function getHeader(source, name) {
  if (!source) return null;
  if (typeof source.headers?.get === "function") {
    return source.headers.get(name);
  }
  const headers = source.headers || {};
  return headers[name] || headers[name.toLowerCase()] || null;
}

function getSiteOriginFromRequest(source) {
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

function isAllowedBrowserRequest(source, siteOrigin) {
  const origin = getHeader(source, "origin");
  if (origin && origin === siteOrigin) return true;

  const referer = getHeader(source, "referer");
  if (referer && referer.startsWith(`${siteOrigin}/`)) return true;
  if (referer === `${siteOrigin}/`) return true;

  return false;
}

function validateConsentUrl(targetUrl, siteOrigin) {
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

  if (!parsed.searchParams.get("d")) {
    return { ok: false, reason: "Missing disclosure payload" };
  }

  return { ok: true };
}

function createShortId() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(8);
  let id = "";
  for (const byte of bytes) {
    id += alphabet[byte % alphabet.length];
  }
  return id.slice(0, 8);
}

function getClientIp(source) {
  const forwarded = getHeader(source, "x-forwarded-for");
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return getHeader(source, "x-real-ip") || "unknown";
}

function normalizeQueryId(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

module.exports = {
  SHORT_LINK_PREFIX,
  RATE_LIMIT_PREFIX,
  RATE_LIMIT_MAX_PER_HOUR,
  createShortId,
  getClientIp,
  getSiteOriginFromRequest,
  isAllowedBrowserRequest,
  normalizeQueryId,
  validateConsentUrl,
};
