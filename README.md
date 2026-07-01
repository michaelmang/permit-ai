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
  database and nothing is stored server-side; the link *is* the receipt.
- **Receipt ID**: a SHA-256 hash of the `d` payload, truncated to 8 hex characters, computed
  client-side wherever it's shown. Same payload always produces the same ID.
- Clicking **Continue to article** on the receipt view redirects to the `target` URL. Nothing
  is logged.

## Not included yet

- Badge (SVG) generation — deprioritized for MVP.
- Any kind of consent-count dashboard — this would require a backend to record consent
  events, which is a deliberate departure from the zero-backend design of the rest of the
  tool. Worth designing separately when you get there.
