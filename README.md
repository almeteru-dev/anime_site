# LycorisLib

LycorisLib is a full-stack web app with a Go (Gin) backend and a Next.js frontend.

## Prerequisites

- Go (1.21+ recommended)
- Node.js (18+ recommended)
- npm
- make
- PostgreSQL

## Project Structure

- `backend/` — Go API server
- `frontend/` — Next.js app

## Quick Start (Local)

### 1) Configure the backend environment

The backend loads environment variables from `backend/.env` (if present).

1. Copy the example file:

```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` as needed (Postgres credentials, `JWT_SECRET`, etc.).

### 2) Install dependencies

This downloads Go modules, creates `backend/vendor/`, and installs frontend packages.

```bash
make install
```

### 3) Run in development (backend + frontend)

```bash
make dev
```

Or run them separately:

```bash
make dev-back
make dev-front
```

Default URLs:

- Backend: `http://localhost:8080` (API under `/api`)
- Frontend: `http://localhost:3000`

The frontend uses `NEXT_PUBLIC_API_URL` if set; otherwise it defaults to `http://localhost:8080/api`.

## Production Build

Builds the Go binary using vendored modules (`-mod=vendor`) and builds the Next.js app.

```bash
make build
```

Outputs:

- Backend binary: `./lycoris_server`
- Frontend build artifacts: `frontend/.next/`

## Clean

Removes build artifacts and the backend binary.

```bash
make clean
```

