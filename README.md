# HRFlow — Employee Document & Workflow Automation System

A web-based HR platform where employees request official documents online,
managers review, HR verifies, and the system **generates QR-verifiable PDFs
automatically** — with email delivery, dashboards, Excel reports, and a full
audit trail.

**Stack:** Laravel + Sanctum + MySQL 8 · React 18 + TypeScript (Vite) + Tailwind ·
DomPDF · Laravel Excel · Recharts · Docker

---

## The workflow

```
Employee submits request
        ▼
Manager review  (approve / reject + comments)
        ▼
HR verification (final check)
        ▼
PDF generated automatically  (number HRF-YYYY-NNNNNN, QR code, digital signature)
        ▼
Email + in-app notification  (PDF attached)
        ▼
Employee downloads the document
```

Rejection at either stage returns the request to the employee with mandatory
comments. Every transition is written to the audit log.

## Demo accounts (password: `password`)

| Role | Email |
|---|---|
| Employee | `employee@hrflow.test` |
| Manager | `manager@hrflow.test` |
| HR Admin | `hradmin@hrflow.test` |

## Feature highlights

- **RBAC** — role middleware + role-adaptive SPA shell (employee / manager / hr_admin)
- **10 document types** with HR-editable HTML templates (`{{employee_name}}`, `{{salary}}`, …)
- **Two-stage approval** — team-scoped manager queue, company-wide HR verification
- **PDF engine** — auto-numbering, version history, HMAC digital signature,
  private-disk storage, authorized downloads, public QR verification page
- **Notifications** — database + queued email at every stage, PDF attached on
  completion, daily expiration reminders (scheduled command)
- **Analytics** — role-aware dashboards (trends, department analytics, most
  requested, avg approval time) + Excel export
- **Audit log** — append-only, HR viewer with filters

---

## Option A — Run with Docker (recommended)

Requirements: Docker Desktop.

```bash
docker compose up -d --build
docker compose exec backend php artisan key:generate --force
docker compose exec backend php artisan migrate --seed
```

Open **http://localhost:8080** and log in with a demo account.

Services: `nginx` (SPA + API proxy, port 8080) · `backend` (PHP-FPM) ·
`queue` (email/notification worker) · `scheduler` (expiration reminders) ·
`mysql` (data in the `mysql-data` volume).

Environment lives in `backend/.env.docker`. In Docker the SPA and API share
one origin, so no CORS setup is needed.

## Option B — Run locally (WAMP/XAMPP-style dev)

Requirements: PHP 8.3+, Composer, Node 20+, MySQL 8.

```bash
# 1. Backend
cd backend
composer install
cp .env.example .env           # then set DB_DATABASE=hrflow + credentials
php artisan key:generate
php artisan migrate --seed
php artisan serve              # http://localhost:8000

# 2. Queue worker (separate terminal — emails & notifications)
php artisan queue:work

# 3. Scheduler (separate terminal — expiration reminders)
php artisan schedule:work

# 4. Frontend (separate terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Dev emails are written to `backend/storage/logs/laravel.log` by default.
To see real inboxes, point the `MAIL_*` vars in `backend/.env` at
[Mailtrap](https://mailtrap.io): `MAIL_MAILER=smtp`,
`MAIL_HOST=sandbox.smtp.mailtrap.io`, `MAIL_PORT=2525` + your credentials.

## Option C — Deploy to Railway (API) + Vercel (SPA)

The repo ships deploy configs for a split deployment:
`backend/railway.json` + `backend/Dockerfile.railway` (single container that
serves HTTP on `$PORT`, runs migrations on boot) and `frontend/vercel.json`
(SPA rewrites).

**1. Backend on [Railway](https://railway.com):**

1. New project → *Deploy from GitHub repo* → set **Root Directory** to `backend`.
2. Add a **MySQL** database service to the same project — or skip this and use
   SQLite (single-service setup): `DB_CONNECTION=sqlite` +
   `DB_DATABASE=/app/storage/app/database.sqlite` instead of the `DB_*` vars below.
3. Add a **Volume** to the backend service, mounted at `/app/storage`
   (generated PDFs — and the SQLite file, if used — must survive redeploys).
4. Set the service variables:

   ```bash
   APP_NAME=HRFlow
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=                # run locally: php artisan key:generate --show
   APP_URL=https://<your-railway-domain>
   FRONTEND_URL=https://<your-vercel-domain>   # fill in after step 2 below
   COMPANY_NAME="HRFlow Corporation"
   LOG_CHANNEL=stderr
   DB_CONNECTION=mysql
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_DATABASE=${{MySQL.MYSQLDATABASE}}
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=sync   # emails/notifications sent inline — no worker needed
   MAIL_MAILER=log         # or point MAIL_* at a real SMTP provider
   ```

5. Generate a public domain for the service (Settings → Networking), then put
   it in `APP_URL`.
6. To load the demo data once: set `DEPLOY_SEED=1`, redeploy, then remove it.

**2. Frontend on [Vercel](https://vercel.com):**

1. Import the GitHub repo → set **Root Directory** to `frontend`
   (framework preset: Vite).
2. Add one environment variable:
   `VITE_API_URL=https://<your-railway-domain>/api/v1`
3. Deploy, then copy the production domain into `FRONTEND_URL` on Railway and
   redeploy the backend — this fixes CORS, email links, and the QR-code
   verification URLs baked into generated PDFs.

Optional: daily document-expiration reminders need the scheduler — add a
second Railway service from the same repo/root with the custom start command
`php artisan schedule:work` and the same variables.

## API overview

All endpoints live under `/api/v1`. Highlights:

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login` (throttled) · `POST /auth/logout` · `GET /auth/me` |
| Profile | `GET/PUT /profile` |
| Requests | `GET/POST /requests` · `GET /requests/{id}` |
| Manager | `GET /manager/queue` · `GET /manager/history` · `POST /manager/requests/{id}/decision` |
| HR review | `GET /hr/verifications` · `GET /hr/requests` · `POST /hr/requests/{id}/decision` · `…/regenerate` |
| Documents | `GET /documents/{id}/download` (owner/HR) · `GET /verify/{token}` (public, behind the QR) |
| HR admin | CRUD for `departments`, `positions`, `employees`; `GET/PUT /document-templates` |
| Analytics | `GET /dashboard` (role-aware) · `GET /hr/reports/requests.xlsx` |
| Misc | `GET /notifications` (+ mark read) · `GET /hr/audit-logs` · `GET /health` |

## Security notes

- Bearer-token auth (Sanctum), tokens expire after 7 days
- Role middleware on every privileged route; ownership checks on documents/requests
- Mass assignment locked down via explicit fillable lists on every model
- Generated PDFs on a **private disk** — only reachable through the authorized endpoint
- Login throttled (5/min), public QR verification throttled (30/min)
- CORS restricted to the SPA origin; identical error for wrong email vs password
- Append-only audit trail of every sensitive action

## Repository layout

```
backend/    Laravel API (app, database, routes/api.php, resources/views/pdf)
frontend/   React SPA (src/pages, src/services = typed API layer, src/components)
docker/     nginx image (SPA build + API proxy)
```
