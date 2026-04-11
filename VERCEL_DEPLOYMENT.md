# Vercel Deployment Guide

This project is a monorepo with:
- `Frontend` (Vite + React)
- `Backend` (Express + MongoDB)

## Important platform note

Vercel backend functions are serverless, so they **do not keep long-running processes**.
That means:
- Socket.IO real-time server is not reliable on Vercel serverless.
- Cron/background jobs (like recurring jobs) do not run continuously.

For this reason, deploy with one of these options:
1. **Recommended:** Frontend on Vercel, Backend on Render/Railway/Fly.
2. **Supported here:** Frontend + Backend on Vercel, with Socket disabled and no persistent cron execution.

---

## Code changes already made

- Backend is split into:
  - `Backend/app.js` (shared Express app)
  - `Backend/index.js` (local Node runtime with Socket.IO)
  - `Backend/api/index.js` (Vercel serverless entry)
- Backend CORS is now env-driven via `CORS_ORIGIN`.
- Frontend API/Socket URLs are env-driven via:
  - `VITE_API_BASE_URL`
  - `VITE_SOCKET_URL`
  - `VITE_ENABLE_SOCKET`
- Added Vercel config files:
  - `Backend/vercel.json`
  - `Frontend/vercel.json`

---

## Step 1: Push repository

1. Commit and push this repo to GitHub.
2. Ensure `Backend/.env` is **not** committed.

---

## Step 2: Deploy Backend on Vercel

1. Open Vercel dashboard.
2. Click **Add New > Project**.
3. Import this GitHub repository.
4. Set **Root Directory** to `Backend`.
5. Framework preset can stay **Other**.
6. Add Environment Variables (Production):
   - `PORT=4000`
   - `MONGODB_URI=...`
   - `DB_NAME=spendwise`
   - `ACCESS_TOKEN_SECRET=...`
   - `ACCESS_TOKEN_SECRET_EXPIRY=1d`
   - `REFRESH_TOKEN_SECRET=...`
   - `REFRESH_TOKEN_SECRET_EXPIRY=7d`
   - `GEMINI_API_KEY=...`
   - `GEMINI_MODEL=gemini-2.0-flash`
   - `CORS_ORIGIN=https://<your-frontend-vercel-domain>`
7. Deploy.
8. Copy backend URL, e.g. `https://expense-tracker-api.vercel.app`.

---

## Step 3: Deploy Frontend on Vercel

1. Add another Vercel project from the same repo.
2. Set **Root Directory** to `Frontend`.
3. Framework preset: **Vite**.
4. Add Environment Variables (Production):
   - `VITE_API_BASE_URL=https://<your-backend-vercel-domain>`
   - `VITE_SOCKET_URL=https://<your-backend-vercel-domain>`
   - `VITE_ENABLE_SOCKET=false`
5. Deploy.
6. Copy frontend URL, e.g. `https://expense-tracker-web.vercel.app`.

---

## Step 4: Final CORS update on Backend

After frontend is deployed, update backend env:

`CORS_ORIGIN=https://expense-tracker-web.vercel.app`

Then redeploy backend.

If you need local + production origins:

`CORS_ORIGIN=http://localhost:5173,https://expense-tracker-web.vercel.app`

---

## Step 5: Verify deployment

Check these endpoints and flows:

1. Backend health: `https://<backend-domain>/api/v1/health`
2. Register user from frontend.
3. Login user from frontend.
4. Add expense.
5. AI category prediction endpoint works.

Real-time comments/presence and Socket features should be considered disabled with `VITE_ENABLE_SOCKET=false`.

---

## Recommended production architecture

For full features (Socket + recurring jobs):

1. Keep **Frontend on Vercel**.
2. Deploy **Backend to Render/Railway/Fly** as a persistent Node server.
3. Set frontend env:
   - `VITE_API_BASE_URL=https://<persistent-backend-domain>`
   - `VITE_SOCKET_URL=https://<persistent-backend-domain>`
   - `VITE_ENABLE_SOCKET=true`
