# Algorithm Learning Platform — Backend

Backend API for my algorithm learning platform (LeetCode clone). Built with NestJS, Prisma, PostgreSQL, and JWT. Handles problem management, user authentication, and sandboxed code execution via Docker.

## ✨ Features

- **Authentication** — JWT-based auth with access/refresh tokens.
- **Problem management** — CRUD for problems, test cases, and solutions.
- **Sandboxed code execution** — user code runs inside isolated Docker containers.
- **Multi-language runners** — pluggable runners for Node.js and Go.
- **Submission tracking** — queue and evaluate submissions, store verdicts and runtime stats.
- **Type-safe database access** — Prisma ORM on top of PostgreSQL.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [NestJS](https://nestjs.com/) |
| Language | TypeScript |
| ORM | [Prisma](https://www.prisma.io/) |
| Database | PostgreSQL |
| Auth | JWT (access + refresh) |
| Code Execution | Docker (container isolation) |
| Runners | Node.js, Go |

## ⚙️ Architecture

The project follows a modular NestJS structure, with each domain as a separate module.

```
src/
├── auth/          # JWT strategy, guards, login/register
├── users/         # User management
├── problems/      # Problems, test cases
├── submissions/   # Submission lifecycle, verdicts
├── executor/      # Code execution orchestration
│   ├── runners/   # Language-specific runners (node, go)
│   └── sandbox/   # Docker container management
├── prisma/        # Prisma service & module
└── common/        # Guards, interceptors, filters, DTOs
```

**Key principles:**
- Each module owns its domain logic and exposes a clear service API.
- Cross-cutting concerns (auth, validation, error handling) live in `common` and global guards/interceptors.
- Code execution is fully decoupled from business logic via the `executor` module.

## 🐳 Code Execution & Sandboxing

User code is never executed on the host. Each submission runs inside a fresh, isolated Docker container with:

- **Resource limits** — CPU, memory, and execution time limits to prevent abuse.
- **No network access** — containers run with networking disabled.
- **Read-only filesystem** — only a temp working directory is writable.
- **Non-root user** — code runs as an unprivileged user inside the container.

**Execution flow:**

```
Submission → Executor → Pick runner (Node / Go)
          → Spin up container → Mount code + test cases
          → Run & capture stdout/stderr
          → Collect verdict + metrics → Tear down container
```

**Runners** are responsible for compiling (if needed), executing, and reporting results in a unified format, so adding a new language means adding a new runner without touching the core logic.

## 🔐 Authentication

- **Access token** — short-lived JWT for API requests.
- **Refresh token** — long-lived, used to obtain new access tokens.
- Protected routes use a JWT guard; roles and ownership checks are enforced per endpoint.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- Docker

### Setup

```bash
# install dependencies
npm install

# configure environment
cp .env.example .env
# set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, etc.

# run database migrations
npx prisma migrate dev

# start dev server
npm run start:dev
```

The API will be available at [http://localhost:3000](http://localhost:3000) (or your configured `PORT`).

### Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_EXPIRES_IN` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL |
| `DOCKER_HOST` | (optional) Docker daemon socket/host |

## 🗄 Database

Schema is managed with Prisma. Useful commands:

```bash
npx prisma migrate dev     # create & apply a migration
npx prisma migrate deploy  # apply migrations (production)
npx prisma studio          # open Prisma Studio
npx prisma generate        # regenerate Prisma Client
```

## 🧩 Adding a new language runner

1. Create a new runner in `src/executor/runners/<language>`.
2. Implement the shared `Runner` interface (compile, execute, parse result).
3. Register it in the runner registry.
4. Add a matching Docker image with the required runtime/toolchain.

No changes to the core execution flow are needed.