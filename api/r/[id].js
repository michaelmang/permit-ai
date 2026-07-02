import { SHORT_LINK_PREFIX } from "../lib/shortLink";
import { getRedis } from "../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const id = req.query.id;
  if (!id || !/^[a-z0-9]{6,12}$/.test(id)) {
    return res.status(404).send("Not found");
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(503).send("Service unavailable");
  }

  const target = await redis.get(`${SHORT_LINK_PREFIX}${id}`);
  if (!target || typeof target !== "string") {
    return res.status(404).send("Not found");
  }

  res.setHeader("Location", target);
  return res.status(302).end();
}
