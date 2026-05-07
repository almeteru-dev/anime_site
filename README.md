# LycorisLib

LycorisLib is a full-stack web app with a Go (Gin) backend and a Next.js frontend.

## Important Note

You must create the PostgreSQL database specified by `DB_NAME` (for example, `animevista`) in your DBMS before starting the backend. The application runs migrations automatically, but it will not create the database itself.

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

If you prefer, `make install` will create `backend/.env` automatically (it copies from `backend/.env.example` if the file does not exist).

### 2) Create the PostgreSQL database

Create the database that matches `DB_NAME` in `backend/.env` (default example is `animevista`).

```bash
createdb animevista
```

### 3) Install dependencies

This downloads Go modules, creates `backend/vendor/`, and installs frontend packages.

```bash
make install
```

### 4) Run in development (backend + frontend)

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


## Production

To run the application in production mode, you need to build the project first and then start the optimized services. This mode is faster and hides development tools (like the Next.js Dev Overlay).

### 1) Build the project
This command builds the Go binary using vendored modules (`-mod=vendor`) and creates an optimized Next.js production build.

```bash
make build
```

Outputs:
- Backend binary: `./lycoris_server`
- Frontend build artifacts: `frontend/.next/`

### 2) Run in production
After a successful build, you can start both services simultaneously or separately.

**Run both (Backend + Frontend):**
```bash
make prod
```

**Run separately:**
```bash
make server   # Starts the compiled Go binary
make client   # Starts the Next.js production server (npm run start)
```

## Clean

Removes build artifacts and the backend binary.

```bash
make clean
```
