# Permit AI

A voluntary, self-attested disclosure tool for how AI was involved in a piece of writing —
modeled on the visual and interaction pattern of an OAuth/MCP permission screen.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — that's the generator.

## Build a static site

This app has no backend: `output: 'export'` in `next.config.js` produces a fully static
site you can host anywhere (Netlify, GitHub Pages, S3, etc.).

```bash
npm run build
```

Static files land in `out/`.

## How it works

- **Generator** (`/`): walk through scope selection, an optional note, and a target article
  URL, then generate a link.
- **Consent link** (`/?d=<encoded>`): the entire disclosure payload — scopes, note, target,
  timestamp — is base64url-encoded directly into the `d` query parameter. There is no
  database and nothing is stored server-side; the link _is_ the receipt. After generation,
  a shorter share link is created automatically via a public URL-shortening service (the
  full link remains available in the wizard).
- **View mode** (`/?d=<encoded>&m=view`): same receipt, presented for readers who are
  already on the article — no forced redirect, with an optional link back to the article.
- **Article artifacts**: Step 4 also generates a disclosure link (view mode) and a
  downloadable SVG badge for placing on the article page (e.g. upload to Substack and link
  to the disclosure URL).
- **Receipt ID**: a SHA-256 hash of the `d` payload, truncated to 8 hex characters, computed
  client-side wherever it's shown. Same payload always produces the same ID.
- Clicking **Continue to article** on the receipt view redirects to the `target` URL. Nothing
  is logged.

## Not included yet

- Any kind of consent-count dashboard — this would require a backend to record consent
  events, which is a deliberate departure from the zero-backend design of the rest of the
  tool. Worth designing separately when you get there.
