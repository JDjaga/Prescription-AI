# Development Log

A running record of how this project was built and maintained. Each entry is
backed by git history — commit hashes/references are included where available.

## 2026-10-28 — Repository hardening & deployment infrastructure

**Work done** (assisted with OpenCode + GLM agent):

- Removed dead legacy code: `App.jsx`, `AnalysisReport.jsx`, `PrescriptionList.jsx`
  (an old iteration of the app that imported components that no longer exist)
- Removed the root `index.html` and root `public/` — empirically verified (via a
  live dev-server probe + production build) that Vite has served
  `frontend/index.html` all along; the root copies were dead weight
- Moved `favicon.ico` / `robots.txt` into `frontend/public/` (they now actually
  ship in the production build) and added favicon + meta description to the
  served `index.html`
- Fixed `server/Dockerfile`: removed a broken hard-coded `COPY vision-key.json`,
  documented the standard `GOOGLE_APPLICATION_CREDENTIALS` / ADC flow instead
- Added `frontend/Dockerfile` build args so Supabase keys + API URL are properly
  baked into the production bundle
- Added `/api/health` endpoint + configurable CORS (`ALLOWED_ORIGIN` whitelist)
- Added `frontend/default.conf` nginx `/api` proxy → frontend and backend run
  same-origin in production
- Added root `docker-compose.yml`: one-command full-stack deploy with
  healthchecks and auto-restart
- Added GitHub Actions CI (frontend build + backend syntax check + health smoke test)
- Verified: `npm run build` in `frontend/` compiles successfully (4012 modules)

## 2026-10-28 (session 3) — Multi-provider AI failover + crash resilience + live run

- **Built `server/ai.js`**: automatic AI failover layer. OpenRouter free-tier
  (`nvidia/nemotron-3.5-super-vl:free` → `google/gemma-4-31b-it:free`) as
  primary, Gemini as fallback. Verified live: chat + prescription OCR +
  analysis all returned correct results through the fallback when Gemini's
  free-tier quota (20 req/day) was exhausted
- **Switched prescription OCR from Google Vision to Gemini/OpenRouter
  multimodal** — removed `@google-cloud/vision` (-84 npm packages), no GCP
  service-account key needed to deploy
- **Fixed 3 crash-class bugs**: (1) unhandled rejections no longer kill the
  process, (2) MongoDB connects with retry + endless background reconnect
  instead of `process.exit`, (3) all AI calls are bounded by timeouts
- **Fixed remedy search**: Atlas `$search` silently returning empty now falls
  through to native Mongo text/regex search; capped and parallelized the AI
  enrichment (3 in parallel instead of 15 serial calls)
- **Generated a 56-entry remedies dataset** with Gemini (8 health categories,
  honest evidence grading), added legacy fields to the Remedy schema, created
  a weighted Mongo text index (`scripts/ensure_search_index.js`)
- **End-to-end verified live**: 3/3 medicines OCR'd correctly from a synthetic
  prescription image (summary + risk level), chat OK, remedy search OK

## Placeholder — next session

- _To be filled after next working session — e.g. feature work, code reviews,
  or refactors pair-programmed with your AI tooling._
