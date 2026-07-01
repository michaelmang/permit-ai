# AGENTS.md

## Cursor Cloud specific instructions

Permit AI is a single **Next.js 14 (App Router)** front-end app with **no backend**. It generates a self-attested AI-disclosure consent link entirely client-side (the payload is base64url-encoded into the `?d=` query param; the receipt id is a client-side SHA-256 hash). See `README.md` for the product overview and architecture.

- **Package manager:** npm (`package-lock.json`). Dependencies are refreshed by the startup update script (`npm install`).
- **Run (dev):** `npm run dev` serves the app at http://localhost:3000. This is the only service.
- **Build (static export):** `npm run build` — `next.config.js` sets `output: 'export'`, so a full static site is emitted to `out/`.
- **Lint / format:** `npm run lint`, `npm run format:check`. CI runs both on every push and PR.
- **Wizard screenshots:** `npm run screenshots` captures each wizard step with Playwright. PRs also get inline screenshots via `.github/workflows/pr-screenshots.yml`.
- **Deploy:** Merges to `main` trigger `.github/workflows/deploy-vercel.yml` (requires Vercel secrets — see `.github/SETUP.md`).
- **Gotcha — do not run `next build` while `next dev` is running.** Both share the `.next` directory, and building underneath a live dev server corrupts its chunk cache (e.g. `Error: Cannot find module './819.js'`, unstyled UI). If this happens, stop the dev server, `rm -rf .next`, and restart `npm run dev`.
