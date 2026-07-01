async function shortenWithTinyUrl(url) {
  const endpoint = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("TinyURL request failed");
  const short = (await res.text()).trim();
  if (!short.startsWith("http")) throw new Error("TinyURL returned an invalid URL");
  return short;
}

async function shortenWithIsGd(url) {
  const endpoint = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("is.gd request failed");
  const data = await res.json();
  if (data.errormessage) throw new Error(data.errormessage);
  if (!data.shorturl) throw new Error("is.gd returned no short URL");
  return data.shorturl;
}

/** Best-effort client-side shortening via public APIs (no API key). */
export async function shortenUrl(url) {
  const providers = [shortenWithTinyUrl, shortenWithIsGd];
  let lastError;

  for (const provider of providers) {
    try {
      return await provider(url);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Could not shorten URL");
}
