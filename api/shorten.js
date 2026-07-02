import {
  createShortId,
  getClientIp,
  getSiteOriginFromRequest,
  isAllowedBrowserRequest,
  RATE_LIMIT_MAX_PER_HOUR,
  RATE_LIMIT_PREFIX,
  SHORT_LINK_PREFIX,
  validateConsentUrl,
} from "../lib/shortLink";
import { getRedis } from "../lib/redis";

async function isRateLimited(redis, ip) {
  const key = `${RATE_LIMIT_PREFIX}${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count > RATE_LIMIT_MAX_PER_HOUR;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(503).json({ error: "Shortener unavailable" });
  }

  const siteOrigin = getSiteOriginFromRequest(req);
  if (!siteOrigin) {
    return res.status(500).json({ error: "Could not resolve site origin" });
  }

  if (!isAllowedBrowserRequest(req, siteOrigin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = getClientIp(req);
  if (await isRateLimited(redis, ip)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  let targetUrl;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
    targetUrl = body.url;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const validation = validateConsentUrl(targetUrl, siteOrigin);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.reason });
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = createShortId();
    const created = await redis.set(`${SHORT_LINK_PREFIX}${id}`, targetUrl, { nx: true });
    if (created === "OK") {
      return res.status(200).json({ shortUrl: `${siteOrigin}/r/${id}` });
    }
  }

  return res.status(500).json({ error: "Could not allocate short link" });
}
