## Setup checklist

### Vercel auto-deploy (merge to `main`)

Add these GitHub repository secrets (Settings → Secrets and variables → Actions):

| Secret              | Where to find it                                           |
| ------------------- | ---------------------------------------------------------- |
| `VERCEL_TOKEN`      | [Vercel account tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | Vercel project → Settings → General → Team / Personal ID   |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General → Project ID           |

The app is a static export (`out/`). `vercel.json` points Vercel at that output and adds two serverless API routes for custom short links (`/api/shorten`, `/r/:id`).

`NEXT_PUBLIC_SITE_URL` is optional. Open Graph images use it when set; short links derive the host from each request so preview deployments work without a separate env var.

### Custom short links (Upstash Redis)

Install **Upstash for Redis** from the [Vercel Marketplace](https://vercel.com/marketplace/upstash) and connect it to the project. Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.

**Important:** In the Upstash integration settings, enable the Redis env vars for **Preview** as well as Production — otherwise preprod/PR deployments return `503 Shortener unavailable` and fall back to TinyURL.

- Production / preview: `POST /api/shorten` stores the full consent URL and returns `https://<current-host>/r/<id>`
- Redirect: `/r/<id>` → full `/?d=...` URL (302)
- Local dev (`localhost` / `127.0.0.1`): falls back to TinyURL so no Redis is required

**Cost (Upstash free tier, as of 2026):** 500K Redis commands/month and 256 MB storage. This app uses ~3 commands per shorten and 1 per redirect, so roughly:

| Monthly usage           | Redis commands | Cost                            |
| ----------------------- | -------------- | ------------------------------- |
| 1K links + 10K clicks   | ~13K           | $0                              |
| 10K links + 100K clicks | ~130K          | $0                              |
| 50K links + 500K clicks | ~650K          | ~$0.30 overage on pay-as-you-go |

Vercel serverless function invocations for `/api/shorten` and `/r/:id` are negligible on Hobby/Pro included limits.

**Abuse controls on `/api/shorten`:** same-origin check (Origin/Referer), target URL must be on your site with a `?d=` payload, 20 requests/hour per IP via Redis rate limiting.

You can also connect the repo in the Vercel dashboard instead of using the GitHub Action; if you do, disable `.github/workflows/deploy-vercel.yml` to avoid double deploys.

### PR wizard screenshots

Every pull request that changes the React app (`app/`, `components/`, or `lib/`) triggers `.github/workflows/pr-screenshots.yml`, which:

1. Builds the static site
2. Walks the wizard with Playwright
3. Uploads screenshots as a workflow artifact
4. Posts inline screenshots in a PR comment (via CML `cml comment create --publish`)

No extra secrets are required beyond the default `GITHUB_TOKEN`.

### Local commands

```bash
npm run lint          # ESLint (Next.js + Prettier)
npm run format:check  # Prettier check
npm run screenshots   # Capture wizard screenshots locally
```
