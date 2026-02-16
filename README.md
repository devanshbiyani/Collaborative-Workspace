# Collaborative Workspace (Notion + Google Docs style)

A monorepo for a real-time collaborative editor with dynamic document rooms, URL-shareable workspaces, debounced client operations, and MongoDB-backed persistence.

## Tech Stack

- **Frontend**: React + TypeScript + Zustand + TailwindCSS + React Router
- **Backend**: Node.js + Express + Socket.io + Zod + Mongoose
- **Scaling path**: Redis pub/sub + CRDT/OT engine

## Project Structure

- `apps/frontend` – React editor client
- `apps/backend` – Express + Socket.io collaboration server
- `docs/architecture.md` – scaling + CRDT/OT roadmap
- `docs/deployment.md` – online hosting guide
- `render.yaml` – Render blueprint for frontend + backend deployment

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Environment Variables

Create a `.env` file in the repository root.

```bash
cp .env.example .env
```

### Required

- `MONGO_URI` – MongoDB connection string (Atlas/local)

### Optional

- `REDIS_URL` – enables pub/sub broadcast across multiple backend instances
- `FRONTEND_ORIGIN` – allowed CORS origins for backend (comma-separated)
- `VITE_BACKEND_URL` – backend URL used by frontend

## Routes and Document Rooms

The frontend now supports URL-based document routing:

- `/` → auto-generates a UUID and redirects to `/documents/:id`
- `/documents/:id` → opens a dedicated collaborative room for that document ID

This allows direct sharing/bookmarking of collaborative documents.

For static deployments (e.g. Render), SPA rewrites are configured so refreshing `/documents/:id` always serves the frontend app instead of returning a `Not Found` page.

## How Collaboration Works

1. User opens `/documents/:id`.
2. Client emits `document:join` with that document ID.
3. User edits update local UI immediately.
4. Socket operation emits are **debounced by 500ms** to reduce network chatter while keeping the editor responsive.
5. Backend validates operation payloads using Zod.
6. Backend applies updates and persists document state in MongoDB.
7. Updated snapshots are broadcast via `document:updated`.
8. If Redis is enabled, operations fan out through `workspace:ops`.

## Recent Upgrades (Implemented)

### 1) Debounced Socket Operations (Frontend)

- Local editor state updates immediately on input.
- `socket.emit("document:op", ...)` is debounced by 500ms.
- Timeout ID is stored in a `useRef` to avoid re-renders.
- Effect cleanup clears pending timeout for React 18 Strict Mode safety.

### 2) Stable Connection + Auto-Rejoin (Frontend)

- Room status now reflects the true Socket.IO state on load (`Connected` when already connected).
- On initial connect/reconnect, the client automatically rejoins the active document room.
- Switching rooms leaves the previous Socket.IO room and joins the new one cleanly.

### 3) Persistent Storage with MongoDB (Backend)

- Added `mongoose` integration.
- Added typed schema/model for documents:
  - `_id: String`
  - `content: String`
  - `version: Number`
- Refactored collaboration engine APIs to async:
  - `getDocument(...)`
  - `applyOperation(...)`
- Backend server now connects with `await mongoose.connect(process.env.MONGO_URI)` during startup.

### 4) Dynamic Room Routing (Frontend)

- Added React Router v6 setup in `main.tsx` with `BrowserRouter` + `Routes`.
- Added root redirect route that generates a UUID (`uuid` package).
- Added `/documents/:id` route and `useParams` integration in app logic.

## Build and Validation

```bash
npm run build
```

Build runs:

- backend TypeScript compile
- frontend TypeScript compile + Vite production build

## Deployment Notes

You can deploy both apps online using Render:

1. Push repository to GitHub.
2. In Render, create a new **Blueprint** from the repo.
3. Render provisions backend + frontend from `render.yaml`.
4. Set environment variables:
   - Backend: `MONGO_URI`, `FRONTEND_ORIGIN`, optional `REDIS_URL`
   - Frontend: `VITE_BACKEND_URL`

For complete instructions, see `docs/deployment.md`.
