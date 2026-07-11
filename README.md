# HRFlow — Employee Document & Workflow Automation System

A web-based HR platform: employees request official documents online, managers
approve, HR verifies, and the system generates signed, QR-verifiable PDFs
automatically.

## Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Backend  | Laravel (REST API, `/api/v1`), Sanctum, MySQL 8         |
| Frontend | React 18 + TypeScript (Vite), Tailwind CSS, React Router, Axios |
| PDF / QR | DomPDF, simple-qrcode                                   |
| Infra    | Laravel Queues (database), Docker (Feature 13)          |

## Monorepo layout

```
hrflow/
├── backend/    # Laravel API
└── frontend/   # React SPA
```

## Local development

Prerequisites: PHP 8.3+, Composer, Node 20+, MySQL 8 running on 127.0.0.1:3306.

```bash
# Backend — http://localhost:8000
cd backend
composer install
cp .env.example .env        # then set your DB credentials
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend — http://localhost:5173
cd frontend
npm install
npm run dev
```

Health check: http://localhost:8000/api/v1/health

## Development method

Built feature-by-feature as vertical slices, one branch + PR per feature.
See the Git history for the feature sequence.
