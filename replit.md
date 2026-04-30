# Garden TVET School

Full-stack school management application for Garden TVET School (Rwanda).

## Architecture

- **Frontend** (`frontend/`): React 19 + Vite 7 + Tailwind CSS, with i18n (RW/EN/FR), Zustand state management, React Router v7
- **Backend** (`backend/`): Node.js (Express 5) REST API with JWT auth, MySQL/MariaDB persistence, file uploads (multer), SMS (Africa's Talking), email (nodemailer), PDFs (pdfkit), and cron jobs

## Replit Setup

### Workflows

- **Backend**: `cd backend && npm start` on port 8080 (console output)
- **Start application**: `cd frontend && npm run dev` on port 5000 (webview)

The Vite dev server proxies `/api` and `/uploads` requests from the frontend (port 5000) to the backend (port 8080).

### Database

The app uses MySQL/MariaDB. The backend is designed to start gracefully even when no database is available — static endpoints and the `/api/health` check still work, but data-driven API routes will return errors until a database is connected.

To enable the full API:

1. Provision an external MySQL/MariaDB database (e.g., Aiven, Render, PlanetScale).
2. Set `DATABASE_URL` as a Replit Secret (e.g., `mysql://user:pass@host:port/garden_tvet`). The backend will pick this up automatically over the individual `DB_*` variables.
3. Optionally, import the seed schema from `backend/garden_tvet.sql`.
4. Restart the **Backend** workflow.

### Deployment

Configured for VM deployment (always-running) so both the backend and frontend stay live:

- **Build**: installs frontend dependencies and builds the production bundle (`vite build`).
- **Run**: starts the backend on port 8080 and serves the built frontend on port 5000 (with API proxy to the backend).

## Environment Variables

Backend (`backend/.env` or Replit Secrets):

- `DATABASE_URL` — full MySQL connection string (preferred) **or** `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`
- `JWT_SECRET` — JWT signing secret
- `PORT` — backend port (defaults to 8080)
- `AFRICASTALKING_USERNAME` / `AFRICASTALKING_API_KEY` — SMS provider
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` — email provider

Frontend (`frontend/.env`):

- `VITE_API_URL` — leave empty for local dev (uses Vite's proxy); set to the backend URL when serving prebuilt assets externally.

## Project Structure

```
backend/
  server.js              # Express entry point; mounts all /api/* routes
  db.js                  # mysql2 pool (supports DATABASE_URL or individual params)
  routes/, controllers/  # API routes and handlers
  middleware/, utils/    # Auth, validation, cron scheduler
  public/uploads/        # User-uploaded media
  garden_tvet.sql        # Schema + seed dump

frontend/
  src/
    pages/, layouts/, components/  # React UI
    store/                          # Zustand stores
    utils/api.js                    # axios client
    locales/, i18n.js               # i18next translations
  vite.config.js         # Dev server on 0.0.0.0:5000 with /api proxy
  server.js              # Production Express server (static + API proxy)
```
