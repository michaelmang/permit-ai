## Setup checklist

### Vercel auto-deploy (merge to `main`)

Add these GitHub repository secrets (Settings → Secrets and variables → Actions):

| Secret              | Where to find it                                           |
| ------------------- | ---------------------------------------------------------- |
| `VERCEL_TOKEN`      | [Vercel account tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | Vercel project → Settings → General → Team / Personal ID   |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General → Project ID           |

The app is a static export (`out/`). `vercel.json` points Vercel at that output.

Set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://your-app.vercel.app`) in Vercel project environment variables so Open Graph and Twitter preview images resolve correctly when links are shared.

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
