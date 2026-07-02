import { SHORT_LINK_PREFIX } from "../lib/shortLink.js";
import { getRedis } from "../lib/redis.js";

export const config = {
  runtime: "edge",
};

function extractShortId(pathname) {
  const match = pathname.match(/\/(?:api\/)?r\/([a-z0-9]{6,12})$/);
  return match?.[1] ?? null;
}

export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const id = extractShortId(new URL(request.url).pathname);
  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const redis = getRedis();
  if (!redis) {
    return new Response("Service unavailable", { status: 503 });
  }

  const target = await redis.get(`${SHORT_LINK_PREFIX}${id}`);
  if (!target || typeof target !== "string") {
    return new Response("Not found", { status: 404 });
  }

  return Response.redirect(target, 302);
}
