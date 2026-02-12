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
