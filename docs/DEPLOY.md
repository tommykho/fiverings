# Deploy — Cloudflare Pages (free, commercial use allowed)

## Why Cloudflare rather than Vercel Hobby

| | Cloudflare free | Vercel Hobby |
|---|---|---|
| Commercial use (ads, donations, paid tier) | ✅ allowed | ❌ non-commercial only |
| Static bandwidth | unlimited | 100 GB/month |
| Server functions | 100k requests/day | 1M invocations/month; usage over the limit is blocked for 30 days |
| Git integration and previews | ✅ preview URL for every branch and pull request | ✅ |
| Database for phase 2 | D1 (5 GB, never pauses) | external (for example Supabase, which pauses after 7 idle days on free) |
| Tunnel to your NAS | built in (Cloudflare Tunnel) | separate |

The relay is plain Web-standard code (`server/relay-core.js`), so it also runs on Vercel, Netlify, Deno or Node
without a rewrite.

## One-time setup (about 10 minutes)

1. Push this repository to GitHub (already at `tommykho/fiverings`).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → choose `tommykho/fiverings`. Name the project **fiverings**, which gives https://fiverings.pages.dev.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION = 22`
4. Deploy. The `functions/` folder is picked up automatically, so `/api/relay` goes live with the site.
5. Optional: **Custom domains** → add your domain. Then update `url` in `src/site.config.js` and the sitemap line in `public/robots.txt`.
6. Optional: under **Settings → Variables**, set `ALLOWED_ORIGINS` (comma-separated) if other origins such as a staging domain must use the relay.

`wrangler.toml` sets `name = "fiverings"` for the same project. Every push to `main` deploys to production. Every pull request or branch gets its own preview URL.

## Protect the free quota (recommended)

Security → WAF → **Rate limiting rules** (1 rule is free): match path `/api/relay`, 30 requests per 1 minute per IP, action Block.
The relay already rejects other origins and destinations that are not on the allowlist.

## GitHub Pages (test site)

- **Site:** https://tommykho.github.io/fiverings/, built and deployed by `.github/workflows/pages.yml` on every push to `main`
  (built with `BASE_PATH=/fiverings`, `SITE_URL=https://tommykho.github.io`).
- **One-time settings:** Settings → General → Default branch → `main`; Settings → Pages → Build and deployment →
  **Source: GitHub Actions**. Do not use "Deploy from a branch": it runs Jekyll on the raw source and the site 404s.
- **Relay:** reuses the sister project's Vercel relay (`PUBLIC_RELAY_URL=https://suntze-relay.vercel.app/api/relay`),
  whose `ALLOWED_ORIGINS=https://tommykho.github.io` already covers this site. Never point it at a Vercel project you do not own.
- Any other static host works the same way: serve `dist/`, set `BASE_PATH` for a sub-path and `PUBLIC_RELAY_URL` when the host has no functions.

## Local Cloudflare emulation (optional)

```bash
npm run build
npx wrangler pages dev dist     # serves the site and /api/relay together
```

## Hybrid with your NAS (optional)

- **Self-hosted model:** run Ollama on the NAS with `OLLAMA_ORIGINS=https://your-domain`, expose it with
  `cloudflared tunnel` (for example `llm.your-domain`), and protect it with Cloudflare Access or a long random path.
  Visitors choose **Custom / self-hosted** and enter `https://llm.your-domain/v1`. Note that this uses your NAS's power and bandwidth.
- **Self-hosted relay:** `PORT=8787 ALLOWED_ORIGINS=https://your-domain node server/node-relay.mjs` behind the tunnel.
- **Backups (phase 2):** a nightly NAS cron job runs `wrangler d1 export` to keep a copy of the community database.
