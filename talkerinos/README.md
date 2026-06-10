# Talkerinos

A tiny place on the internet for me to yap, rant, and brain-dump.
Frontend is a separate app – this repo is the Go backend that powers it.

---

## What is this?

Talkerinos is a minimal blog engine, I write posts (probably overshare).

---

## Features

- Create, read, update, delete blog posts
- Draft system (publish when ready)
- Get posts by ID or slug

---

## Tech Stack

- **Go** – 1.22+
- **Gin** – web framework
- **PostgreSQL** – database (hosted on Supabase)
- **sqlc** – type-safe SQL
- **golang-migrate** – database migrations
- **Docker** – containerized deployment

---

## Quick Start

```bash
# Install dependencies
go mod download

# Run locally
go run ./cmd/api

# Run migrations
make migrate-up
```

---

## Environment Variables

Create a `.env` file:

```
PORT=8080
DB_URL=postgres://user:pass@host:5432/dbname
ALLOWED_ORIGINS=http://localhost:3000,https://yourfrontend.com
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/v1/blog` | List published posts |
| GET | `/v1/blog/drafts` | List draft posts |
| GET | `/v1/blog/:id` | Get post by ID |
| GET | `/v1/blog/slug/:slug` | Get post by slug |
| POST | `/v1/blog` | Create post |
| PUT | `/v1/blog/:id` | Update post |
| DELETE | `/v1/blog/:id` | Delete post |

---

## Project Structure

```
talkerinos/
├── cmd/api/
│   └── main.go              # Entry point
├── internal/
│   ├── database/            # sqlc generated
│   ├── handler/             # HTTP handlers
│   └── router/              # Route setup
├── sql/
│   ├── schema/              # Migrations
│   └── queries/             # SQL queries
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── sqlc.yaml
```

---

## Development

```bash
# Run locally
go run ./cmd/api

# Run with Docker
docker compose up

# Rebuild after changes
docker compose up --build
```

---

## Why this exists

I talk a lot.
Now my Go backend can listen.
