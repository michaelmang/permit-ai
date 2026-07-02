import {
  createShortId,
  getClientIp,
  getSiteOriginFromRequest,
  isAllowedBrowserRequest,
  RATE_LIMIT_MAX_PER_HOUR,
  RATE_LIMIT_PREFIX,
  SHORT_LINK_PREFIX,
  validateConsentUrl,
} from "../lib/shortLink.js";
import { getRedis } from "../lib/redis.js";

export const config = {
  runtime: "edge",
};

async function isRateLimited(redis, ip) {
  const key = `${RATE_LIMIT_PREFIX}${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count > RATE_LIMIT_MAX_PER_HOUR;
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const redis = getRedis();
  if (!redis) {
    return Response.json({ error: "Shortener unavailable" }, { status: 503 });
  }

  const siteOrigin = getSiteOriginFromRequest(request);
  if (!siteOrigin) {
    return Response.json({ error: "Could not resolve site origin" }, { status: 500 });
  }

  if (!isAllowedBrowserRequest(request, siteOrigin)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  if (await isRateLimited(redis, ip)) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateConsentUrl(body?.url, siteOrigin);
  if (!validation.ok) {
    return Response.json({ error: validation.reason }, { status: 400 });
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = createShortId();
    const created = await redis.set(`${SHORT_LINK_PREFIX}${id}`, body.url, { nx: true });
    if (created === "OK") {
      return Response.json({ shortUrl: `${siteOrigin}/r/${id}` });
    }
  }

  return Response.json({ error: "Could not allocate short link" }, { status: 500 });
}
