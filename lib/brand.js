export const SITE_NAME = "Permit AI";
export const SITE_DESCRIPTION =
  "A voluntary, self-attested disclosure tool for how AI was involved in a piece of writing.";
export const SITE_TAGLINE = "Here's how I used AI";

/** Gradient border colors for all scopes — used on favicon and social card. */
export const BRAND_GRADIENT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#0d9488",
  "#d97706",
  "#4f46e5",
  "#db2777",
];

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
