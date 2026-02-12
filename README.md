# Collaborative Workspace (Notion + Google Docs style)

A starter monorepo for building a real-time collaborative workspace using:

- **Frontend**: React + TypeScript + Zustand + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Advanced path**: Redis pub/sub + CRDT/OT engine

## Project structure

- `apps/frontend` – React editor client
- `apps/backend` – Express + Socket.io collaboration server
- `docs/architecture.md` – scaling + CRDT/OT roadmap

## Quick start

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Environment

Copy `.env.example` into `.env` and edit values if needed.

```bash
cp .env.example .env
```

### Redis (optional)
Set `REDIS_URL` to broadcast operations between multiple backend instances.

## How it works (MVP)

1. Client joins a document room through Socket.io (`document:join`).
2. Client sends text operations (`document:op`).
3. Backend validates operation with `zod`, applies it, and broadcasts `document:updated`.
4. If Redis is enabled, operations are published/subscribed through `workspace:ops`.

## Next steps for production

- Persist documents + operation logs in PostgreSQL or MongoDB.
- Replace naive text replacement with proper CRDT or OT transformations.
- Add authentication, permissions, and presence/cursor sync.

## Host this project online (Render)

This repo already includes a `render.yaml` blueprint, so you can deploy both the backend and frontend in one flow.

### 1) Push this repo to GitHub

Render deploys from a Git provider. Make sure your latest code is in a GitHub repo.

### 2) Create a new Blueprint in Render

1. Go to Render Dashboard → **New** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect `render.yaml` and propose 3 services:
   - `workspace-backend` (Node web service)
   - `workspace-frontend` (static site)
   - `workspace-redis` (Redis)
4. Click **Apply** to create all services.

### 3) Set production environment values

`render.yaml` already wires the important values:

- `VITE_BACKEND_URL` is taken from backend service URL.
- `REDIS_URL` is taken from the Redis service connection string.

After first deploy, set these in the backend service environment settings:

- `NODE_ENV=production`
- `FRONTEND_ORIGIN=https://<your-frontend-domain>`

> Tip: Keep `FRONTEND_ORIGIN` strict (your actual frontend URL) instead of `*` in production.

### 4) Redeploy backend and frontend

Trigger a manual deploy (or push a new commit) so both services rebuild with your final environment values.

### 5) Open your hosted app

- Frontend URL: shown in `workspace-frontend`
- Backend URL: shown in `workspace-backend`

If the editor loads and socket status says connected, your deployment is live.

## Other hosting options

- **Railway**: deploy backend + Redis together, and host frontend on Vercel/Netlify.
- **Fly.io**: deploy backend as a container and use Upstash Redis.
- **Single VM (Docker Compose)**: lowest cost if you are comfortable managing infra.
