# Versatify (Azure Functions + Static Web Apps)

This project provides a set of serverless tools for image/file utilities with a static frontend.

- Backend: Azure Functions (Node.js)
- Frontend: Vite static site
- Storage: Cloudflare R2 (production), Data URL (local dev fallback)

## Quickstart (Local)

1) Install dependencies
```
# Backend (Functions)
cd api && npm install

# Frontend
cd ../frontend && npm install
```

2) Configure local settings
```
cd ../api
cp local.settings.json.example local.settings.json
# Edit values: R2_* (optional for local), ADMIN_* for AdminAuth
```

3) Run locally
```
# Start only the API (Azure Functions runtime required)
npx func start

# Start only the frontend
cd ../frontend && npm run dev

# Or from repo root, run both concurrently
cd .. && npm run dev
```
- API default: http://localhost:7071
- Frontend default: http://localhost:5173

## Core Endpoints (HTTP)
- POST `/api/convert` (multipart: file, targetFormat?, width?, height?)
- POST `/api/upscale` (multipart: file, scale=2|4)
- POST `/api/zoom` (multipart: file, x,y,width,height, scale=2|4)
- POST `/api/watermark` (multipart: file, text, position, opacity)
- POST `/api/generate` (QR; JSON: { text, format }) → binary image
- POST `/api/admin-auth` (JSON: { password })
- POST `/api/downloadsas`, `/api/issuesas`
- POST `/api/cleanupstorage`

Most functions also support:
- `OPTIONS` for CORS preflight
- `GET` for health/status (where applicable)

## Admin Password Hash (one-off)
```
node generate-admin-hash.js <NEW_PASSWORD>
# Set ADMIN_PASSWORD_HASH and ADMIN_SALT in Azure App Settings or local.settings.json
```

## Production Notes
- R2 credentials required in production (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)
- Azure Static Web Apps routes `/api/*` to Functions; see `staticwebapp.config.json`

## Docs
- `docs/PRD.md` product overview
- `docs/PROGRESS.md` current status
