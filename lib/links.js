export function buildConsentUrl(origin, pathname, d, { mode } = {}) {
  const params = new URLSearchParams({ d });
  if (mode === "view") params.set("m", "view");
  return `${origin}${pathname}?${params.toString()}`;
}
