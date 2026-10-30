# TaskFlow AI — Real-Time Collaborative Team Board

[![CI Pipeline](https://github.com/adarshtiwaridev/taskflow-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/adarshtiwaridev/taskflow-ai/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

**TaskFlow AI** is a production-engineered real-time collaborative task management platform. It features instant multi-user board synchronization powered by Redis Pub/Sub, robust TypeScript MVC architecture, PostgreSQL persistence with Prisma ORM, and AI-powered task decomposition that automatically converts high-level project goals into actionable, prioritized subtasks.

---

## Live Links for Portfolio & Resume

* **Frontend Application (Vercel):** [https://taskflow-ai-murex.vercel.app](https://taskflow-ai-murex.vercel.app)
* **Backend API & Health Probe (Render / EC2):** [https://taskflow-api.onrender.com/api/health](https://taskflow-api.onrender.com/api/health)
* **GitHub Repository:** [https://github.com/adarshtiwaridev/Taskflow-Ai](https://github.com/adarshtiwaridev/Taskflow-Ai)

---

## Key Features

1. **Real-Time Multi-User Collaboration:** Task boards synchronize instantly across all connected clients via Socket.io rooms (`board:default`, `board:<id>`).
2. **Cross-Instance Scaling with Redis Adapter:** Socket.io instances share pub/sub events through Redis, enabling seamless horizontal autoscaling across multi-node AWS EC2 clusters.
3. **AI-Powered Task Decomposition:** Transforms high-level goals into structured, prioritized subtasks using OpenAI-compatible structured JSON output (`response_format: { type: "json_object" }`) with fallback heuristic support.
4. **Resilient Data Architecture:** PostgreSQL database managed with Prisma ORM and built-in memory fallback caching ensuring uninterrupted local testing and graceful degradation.
5. **Strict TypeScript & Zod Validation:** End-to-end type safety spanning backend routes, input validators, API response envelopes, and frontend state.
6. **Production Security:** Helmet security headers, configurable CORS whitelisting, non-root Docker execution, and server-side secret management.
7. **Comprehensive Automated Testing:** High-coverage integration tests using Jest and Supertest covering health probes, task CRUD, and AI validation.
8. **Automated CI/CD:** GitHub Actions pipeline enforcing linting, type safety, test execution, and production build verification on every commit.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Socket.io Client, Lucide Icons, CSS Variables |
| **Backend** | Node.js 22, Express.js 5, TypeScript, Socket.io, `@socket.io/redis-adapter` |
| **Data & ORM** | PostgreSQL 16, Prisma ORM 6 |
| **Cache & Real-Time** | Redis 7 (Pub/Sub message broker) |
| **Validation & Schema** | Zod 4, TypeScript DTOs |
| **AI Integration** | OpenAI Chat Completions API with structured JSON output |
| **DevOps & Containers** | Docker, Docker Compose, Nginx, AWS EC2, Vercel |
| **Testing & CI** | Jest 30, Supertest 7, ts-jest, GitHub Actions |

---

## Monorepo Directory Structure

```text
taskflow-ai/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline (lint, test, build)
├── apps/
│   ├── web/                     # React 19 + Vite Frontend SPA
│   │   ├── src/
│   │   │   ├── components/      # UI components (Navbar, TaskCard, TaskColumn, AIBreakdownModal)
│   │   │   ├── services/        # REST API & Socket.io client handlers
│   │   │   ├── config/          # Client environment constants
│   │   │   ├── App.tsx          # Board state management & socket event bindings
│   │   │   └── main.tsx         # Application entry point
│   │   ├── public/              # Static assets & favicon
│   │   ├── vercel.json          # SPA routing rewrite configuration for Vercel
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                     # Express.js 5 TypeScript Backend
│       ├── src/
│       │   ├── config/          # Environment & Database / Redis lifecycle
│       │   ├── controllers/     # HTTP controllers (Task, AI, Health)
│       │   ├── services/        # Business logic & AI decomposition engine
│       │   ├── repositories/    # Data access layer (Prisma & in-memory fallback)
│       │   ├── routes/          # Express route definitions
│       │   ├── middleware/      # Error handler, request logger, Zod validators
│       │   ├── sockets/         # Socket.io room management & Redis adapter
│       │   ├── validators/      # Zod request validation schemas
│       │   ├── utils/           # Structured logger, AppError classes, ApiResponse
│       │   ├── app.ts           # Express application factory
│       │   └── server.ts        # HTTP server & Socket.io entry point
│       ├── tests/               # Automated integration tests (Jest + Supertest)
│       │   └── integration/     # Health, Tasks CRUD, AI breakdown test suites
│       ├── prisma/              # Prisma schema definition
│       └── package.json
├── packages/
│   └── shared/                  # Monorepo shared library
│       ├── src/
│       │   └── index.ts         # Shared TypeScript interfaces, DTOs & socket events
│       └── package.json
├── infrastructure/
│   └── docker/
│       ├── Dockerfile.api       # Multi-stage production container for API
│       ├── Dockerfile.web       # Multi-stage production container for Web
│       └── nginx.conf           # Production Nginx reverse proxy with WebSocket support
├── prisma/
│   └── schema.prisma            # Root Prisma schema
├── docs/
│   ├── architecture.md          # Architectural deep dive
│   └── deployment.md            # Cloud deployment guide (AWS EC2 + Vercel)
├── docker-compose.yml           # Unified local & production compose services
├── package.json                 # Monorepo workspace orchestration
├── package-lock.json
├── .env.example                 # Environment variable template
├── .gitignore
└── README.md
```

---

## Local Development Quickstart

### Prerequisites
* **Node.js:** v20.x or v22.x LTS
* **npm:** v10.x+
* **Docker & Docker Compose** (for PostgreSQL and Redis)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/adarshtiwaridev/taskflow-ai.git
cd taskflow-ai

npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
*(The defaults in `.env.example` work out of the box for local development).*

### 3. Start Database & Redis Services
```bash
docker compose up -d postgres redis
```

### 4. Initialize Prisma ORM
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Servers
```bash
npm run dev
```
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
* **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Available Monorepo Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts frontend (Vite) and backend (API) concurrently |
| `npm run build` | Compiles `@taskflow/shared`, `@taskflow/api`, and `@taskflow/web` |
| `npm run test` | Executes backend integration test suites with coverage report |
| `npm run typecheck` | Validates TypeScript types across all workspace packages |
| `npm run prisma:generate` | Generates Prisma Client from `schema.prisma` |
| `npm run prisma:migrate` | Runs database migrations against PostgreSQL |

---

## Automated Testing & CI

Backend endpoints and validation boundaries are rigorously tested with **Jest** and **Supertest**:

```bash
npm test
```

### Test Coverage Highlights
* **Health Probes:** Tests `/api/health` and `/api/health/ready` status payloads.
* **Task CRUD Lifecycle:** Verifies creation, retrieval, status transitions, batch creation, and deletion.
* **Payload Validation:** Enforces strict 400 responses on invalid schemas, empty titles, and unpermitted enum values.
* **AI Task Breakdown:** Validates structured JSON schema conformance and heuristic fallback behaviors.

---

## Production Deployment Architecture

```
                                  +-----------------------------+
                                  |     Vercel Edge Network     |
                                  |   https://taskflow.vercel   |
                                  +--------------+--------------+
                                                 |
                                     HTTPS / WSS |
                                                 v
                                  +-----------------------------+
                                  |     AWS EC2 (Ubuntu 24)     |
                                  |    Nginx Reverse Proxy      |
                                  |    (SSL / Let's Encrypt)    |
                                  +--------------+--------------+
                                                 |
                                         +-------+-------+
                                         |               |
                                         v               v
                             +-------------------+ +-------------+
                             | Docker: API Node  | | Redis 7     |
                             | Express 5 + Socket| | (Pub/Sub)   |
                             +---------+---------+ +-------------+
                                       |
                                       v
                             +-------------------+
                             | PostgreSQL 16 DB  |
                             | (Managed RDS / DB)|
                             +-------------------+
```

### Frontend Deployment (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set Framework Preset to **Vite** with Output Directory `apps/web/dist`.
3. Set environment variables:
   * `VITE_API_URL`: `https://api.yourdomain.com`
   * `VITE_WS_URL`: `https://api.yourdomain.com`
4. Deploy! Rewrites are handled automatically by `vercel.json`.

### Backend Deployment (AWS EC2 with Docker)
1. Provision an Ubuntu EC2 instance (`t3.small` or `t3.medium`).
2. Clone repository and run `docker compose up -d --build`.
3. Configure Nginx reverse proxy with SSL termination via Let's Encrypt Certbot.
4. Full step-by-step instructions are documented in [docs/deployment.md](docs/deployment.md).

---

## API Documentation

### REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and dependency checks |
| `GET` | `/api/health/ready` | Kubernetes / container readiness probe |
| `GET` | `/api/tasks` | Retrieve all board tasks |
| `GET` | `/api/tasks/:id` | Retrieve a single task by ID |
| `POST` | `/api/tasks` | Create a new task (`title`, `description`, `priority`, `status`) |
| `PATCH` | `/api/tasks/:id` | Update an existing task |
| `DELETE` | `/api/tasks/:id` | Delete a task by ID |
| `POST` | `/api/tasks/bulk` | Bulk create multiple tasks |
| `POST` | `/api/ai/breakdown` | Decompose project goal into structured subtasks |

### WebSocket Events (Socket.io)

| Event Name | Direction | Payload |
| :--- | :--- | :--- |
| `board:join` | Client -> Server | `{ boardId: string }` |
| `board:sync` | Server -> Client | `{ tasks: Task[], activeUsers: number }` |
| `task:created` | Server -> Client | `Task` |
| `task:updated` | Server -> Client | `Task` |
| `task:deleted` | Server -> Client | `taskId: string` |
| `tasks:batch-created` | Server -> Client | `Task[]` |
| `user:joined` | Server -> Client | `{ userId: string, activeUsers: number }` |
| `user:left` | Server -> Client | `{ userId: string, activeUsers: number }` |

---

## Security & Architecture Highlights

* **No Hardcoded Credentials:** All credentials are dynamically resolved via Zod-validated environment configurations.
* **CORS Origin Whitelisting:** Multi-origin and credential support with dynamic origin matching.
* **Non-Root Docker Execution:** Production containers run under an isolated unprivileged `taskflow` system user.
* **Resilient In-Memory Fallback:** Database queries feature automatic fallback handling during development or database outages.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
