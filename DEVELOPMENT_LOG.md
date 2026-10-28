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

## Placeholder — next session

- _To be filled after next working session — e.g. feature work, code reviews,
  or refactors pair-programmed with your AI tooling._
