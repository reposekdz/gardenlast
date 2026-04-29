# Garden TVET School

Fullstack school management web application.

## Stack
- **Frontend**: React 19 + Vite 7 + TailwindCSS + React Router + Zustand + i18next
- **Backend**: Node.js (Express 5) + MySQL (mysql2)
- **Other**: JWT auth, Africa's Talking SMS, Nodemailer, PDFKit, node-cron

## Project Layout
- `frontend/` — Vite React SPA. Dev server on port 5000 (host 0.0.0.0). In dev, Vite proxies `/api` and `/uploads` to `http://localhost:8080`. In production, `frontend/server.js` serves `dist/` and proxies API/uploads.
- `backend/` — Express API on port 8080 (localhost). Mounts many `/api/...` routes. Initializes DB schema lazily and continues running even if the database is unreachable.

## Replit Workflows
- `Start application` — runs `cd frontend && npm run dev` (port 5000, webview).
- `Backend` — runs `cd backend && PORT=8080 node server.js` (port 8080, console).

## Database Notes
The backend is built for **MySQL**. Replit's built-in database is PostgreSQL, so the backend's data layer expects an external MySQL instance. To wire one up, set either:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`, or
- `DATABASE_URL=mysql://user:password@host:port/dbname` for hosted providers (Aiven, PlanetScale, etc.).

A SQL dump is included at `backend/garden_tvet.sql`. Without a reachable MySQL server the API endpoints that need data return errors, but the server itself, the static uploads, and the frontend all run normally.

## Deployment
Configured for the `vm` deployment target so the backend stays warm:
- **Build**: installs both packages and builds the frontend (`vite build`).
- **Run**: starts the backend on port 8080 in the background and the production frontend server on port 5000, which proxies `/api` and `/uploads` to the backend.
