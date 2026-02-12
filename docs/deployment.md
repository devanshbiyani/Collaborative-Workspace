# Deployment guide (Render)

This project is a monorepo with:

- frontend (`apps/frontend`) built with Vite
- backend (`apps/backend`) built with Express + Socket.io

## Prerequisites

- GitHub repository with this code
- Render account

## Option A: Deploy with `render.yaml` (recommended)

1. Push this repo to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Select your repository.
4. Render reads `render.yaml` and creates two services.
5. Wait for the first deploy to finish.
6. Open both services and set real environment values:
   - Backend `FRONTEND_ORIGIN`: your frontend URL (for CORS)
   - Frontend `VITE_BACKEND_URL`: your backend URL
7. Trigger a redeploy for both services.

## Option B: Manual setup

### Backend service

- Runtime: Node
- Root directory: repository root
- Build command:

```bash
npm install && npm run build:backend
```

- Start command:

```bash
npm --workspace @workspace/backend run start
```

- Environment variables:
  - `PORT` (Render injects this automatically)
  - `FRONTEND_ORIGIN=https://<your-frontend-domain>`
  - `REDIS_URL` (optional)

### Frontend static site

- Runtime: Static Site
- Root directory: repository root
- Build command:

```bash
npm install && npm run build:frontend
```

- Publish directory:

```text
apps/frontend/dist
```

- Environment variables:
  - `VITE_BACKEND_URL=https://<your-backend-domain>`

## Notes

- `FRONTEND_ORIGIN` accepts a comma-separated allow list (for example staging + production).
- If you use a custom domain, update both URLs and redeploy.
- Verify backend health at `https://<backend-domain>/health`.
