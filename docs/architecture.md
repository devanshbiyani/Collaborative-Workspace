# Real-Time Collaborative Workspace Architecture

## Stack
- **Frontend**: React + TypeScript + Zustand + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Data**: In-memory store for MVP (swap with MongoDB/PostgreSQL)
- **Scale**: Redis pub/sub for cross-instance socket fanout

## Collaboration model
Current implementation uses a lightweight operation model (full document replacement per edit).

For production-grade multi-cursor editing, replace `collaboration-engine.ts` with:
1. **CRDT** (e.g., Yjs / Automerge) for peer-friendly merge semantics, or
2. **Operational Transform (OT)** with a transformation pipeline and history log.

## Suggested next milestones
1. Persist snapshots + ops into PostgreSQL (or MongoDB).
2. Add auth + per-document ACL.
3. Add presence (cursor + selection broadcast).
4. Introduce rich text schema (blocks like Notion).
5. Add shadcn/ui component primitives and slash-command palette.
