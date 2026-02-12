# Collaborative Workspace (Notion + Google Docs style)

A starter monorepo for building a real-time collaborative workspace using:

- **Frontend**: React + TypeScript + Zustand + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Advanced path**: Redis pub/sub + CRDT/OT engine

## Project structure

- `apps/frontend` – React editor client
- `apps/backend` – Express + Socket.io collaboration server
- `docs/architecture.md` – scaling + CRDT/OT roadmap
- `docs/deployment.md` – step-by-step online hosting guide
- `render.yaml` – Render blueprint for one-click deploy of frontend + backend

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

## Online hosting

You can deploy both apps online using Render.

1. Fork/push this repository to GitHub.
2. In Render, create a new **Blueprint** service from your repository.
3. Render will detect `render.yaml` and provision:
   - `collaborative-workspace-backend` (Node web service)
   - `collaborative-workspace-frontend` (static site)
4. Update environment variables after the first deploy:
   - Backend `FRONTEND_ORIGIN` => your frontend URL
   - Frontend `VITE_BACKEND_URL` => your backend URL

Detailed instructions are in `docs/deployment.md`.

## How it works (MVP)

1. Client joins a document room through Socket.io (`document:join`).
2. Client sends text operations (`document:op`).
3. Backend validates operation with `zod`, applies it, and broadcasts `document:updated`.
4. If Redis is enabled, operations are published/subscribed through `workspace:ops`.

## Next steps for production

- Persist documents + operation logs in PostgreSQL or MongoDB.
- Replace naive text replacement with proper CRDT or OT transformations.
- Add authentication, permissions, and presence/cursor sync.
