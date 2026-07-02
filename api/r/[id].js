const { SHORT_LINK_PREFIX, normalizeQueryId } = require("../lib/shortLinkServer.js");
const { getRedis } = require("../lib/redis.js");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method not allowed");
      return;
    }

    const id = normalizeQueryId(req.query.id);
    if (!id || !/^[a-z0-9]{6,12}$/.test(id)) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const redis = getRedis();
    if (!redis) {
      res.statusCode = 503;
      res.end("Service unavailable");
      return;
    }

    const target = await redis.get(`${SHORT_LINK_PREFIX}${id}`);
    if (!target || typeof target !== "string") {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    res.statusCode = 302;
    res.setHeader("Location", target);
    res.end();
  } catch (error) {
    console.error("redirect handler error:", error);
    res.statusCode = 500;
    res.end("Internal server error");
  }
};
