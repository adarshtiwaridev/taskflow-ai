# TaskFlow AI — System Architecture

TaskFlow AI is a high-concurrency, real-time collaborative task management platform engineered with TypeScript across the entire stack.

## Architecture Overview

```
                      +-----------------------------+
                      |   React 19 Frontend (SPA)   |
                      |   Vite + Lucide + Context   |
                      +--------------+--------------+
                                     |
                     REST (Fetch)    |   WebSocket (Socket.io)
                                     v
                      +-----------------------------+
                      |  Express.js 5 API Gateway   |
                      |  TypeScript MVC / Services  |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
     +-----------------+    +-----------------+    +-----------------+
     | PostgreSQL 16   |    |    Redis 7      |    |  LLM Provider   |
     |   Prisma ORM    |    | Pub/Sub Adapter |    | Structured JSON |
     +-----------------+    +-----------------+    +-----------------+
```

## Backend Layering (MVC / Service-Repository)

- **Config (`src/config/`)**: Environment schema validation with Zod (`env.ts`), Prisma Client lifecycle (`database.ts`), and Redis client manager (`redis.ts`).
- **Validators (`src/validators/`)**: Strict schemas using Zod for tasks, IDs, batch payloads, and AI decomposition requests.
- **Middleware (`src/middleware/`)**: Schema validation (`validate.ts`), structured request logger (`requestLogger.ts`), global error handler (`errorHandler.ts`), and 404 handler (`notFound.ts`).
- **Controllers (`src/controllers/`)**: HTTP boundary handling request parsing, status codes, and standard envelope responses (`ApiResponse<T>`).
- **Services (`src/services/`)**: Business logic, orchestration between database persistence, AI breakdown heuristics, and real-time Socket.io broadcasts.
- **Repositories (`src/repositories/`)**: Data access layer interfacing with Prisma ORM and providing automatic resilient in-memory caching fallback.
- **Sockets (`src/sockets/`)**: Socket.io event router and Redis adapter (`@socket.io/redis-adapter`) enabling horizontal multi-instance scaling.

## Real-Time Collaboration & Synchronization

- **Socket.io Rooms**: Clients subscribe to boards (`board:default` or `board:<boardId>`).
- **Redis Pub/Sub Adapter**: Inter-process communication ensures that when instance A receives a task change, all connected clients across instance B and C are immediately notified.
- **Offline / Reconnection Resiliency**: The frontend tracks connectivity state (`connected`, `connecting`, `offline`) and automatically resynchronizes board state upon reconnection.

## AI Task Breakdown Workflow

1. User submits a goal (e.g., *"Set up AWS EC2 Docker production pipeline"*).
2. The backend validates the prompt and invokes an OpenAI-compatible endpoint with JSON schema enforcement (`response_format: { type: "json_object" }`).
3. If an LLM API key is not present or upstream encounters timeouts, an internal heuristic decomposition engine generates structured, actionable subtasks.
4. The client previews the subtasks and enables 1-click batch import directly onto the sprint board.

