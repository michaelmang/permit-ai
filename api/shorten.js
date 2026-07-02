const {
  createShortId,
  getClientIp,
  getSiteOriginFromRequest,
  isAllowedBrowserRequest,
  RATE_LIMIT_MAX_PER_HOUR,
  RATE_LIMIT_PREFIX,
  SHORT_LINK_PREFIX,
  validateConsentUrl,
} = require("./lib/shortLinkServer.js");
const { getRedis } = require("./lib/redis.js");

async function isRateLimited(redis, ip) {
  const key = `${RATE_LIMIT_PREFIX}${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count > RATE_LIMIT_MAX_PER_HOUR;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const redis = getRedis();
    if (!redis) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Shortener unavailable" }));
      return;
    }

    const siteOrigin = getSiteOriginFromRequest(req);
    if (!siteOrigin) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Could not resolve site origin" }));
      return;
    }

    if (!isAllowedBrowserRequest(req, siteOrigin)) {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Forbidden" }));
      return;
    }

    const ip = getClientIp(req);
    if (await isRateLimited(redis, ip)) {
      res.statusCode = 429;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Rate limit exceeded" }));
      return;
    }

    let targetUrl;
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
      targetUrl = body.url;
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    const validation = validateConsentUrl(targetUrl, siteOrigin);
    if (!validation.ok) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: validation.reason }));
      return;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const id = createShortId();
      const created = await redis.set(`${SHORT_LINK_PREFIX}${id}`, targetUrl, { nx: true });
      if (created) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ shortUrl: `${siteOrigin}/r/${id}` }));
        return;
      }
    }

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Could not allocate short link" }));
  } catch (error) {
    console.error("shorten handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
