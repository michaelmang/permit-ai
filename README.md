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
site you can host anywhere (Netlify, GitHub Pages, S3, etc.). On Vercel, two optional edge
API routes (`/api/shorten`, `/r/:id`) add branded short links via Upstash Redis — see
`.github/SETUP.md`.

```bash
npm run build
```

Static files land in `out/`.

## How it works

- **Generator** (`/`): walk through scope selection, an optional note, and a target article
  URL, then generate a link.
- **Consent link** (`/?d=<encoded>`): the entire disclosure payload — scopes, note, target,
  timestamp — is base64url-encoded directly into the `d` query parameter. The link _is_ the
  receipt. After generation, a shorter share link is created automatically — custom
  `yoursite.com/r/<id>` links on Vercel (Upstash Redis), or TinyURL locally during dev
  (the full link remains available in the wizard).
- **View mode** (`/?d=<encoded>&m=view`): same receipt, presented for readers who are
  already on the article — no forced redirect, with an optional link back to the article.
- **Article artifacts**: Step 4 also generates a disclosure link (view mode) and a
  downloadable SVG badge for placing on the article page (e.g. upload to Substack and link
  to the disclosure URL).
- Clicking **Continue to article** on the receipt view redirects to the `target` URL.

## Not included yet

- Any kind of consent-count dashboard — this would require a backend to record consent
  events, which is a deliberate departure from the zero-backend design of the rest of the
  tool. Worth designing separately when you get there.
