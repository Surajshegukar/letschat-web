# AGENTS.md — Primary Instructions for All AI Agents

This is the single source of truth for any AI agent (Amazon Q, Copilot, Cursor, Claude, etc.) working on the **Let's Chat** monorepo. Read this file first, then read the referenced `.ai/` docs before making any changes.

---

## Quick Project Summary

**Let's Chat** is a full-stack real-time chat application built as a Turborepo monorepo.

| App | Tech | Port |
|-----|------|------|
| `apps/web` | Next.js 16, React 19, TypeScript, TailwindCSS, Zustand, React Query | 3000 |
| `apps/api` | Express.js, Socket.IO, MongoDB/Mongoose, Redis, JWT | 5000 |

Shared packages: `@repo/eslint-config`, `@repo/typescript-config`, `@repo/ui`

---

## Mandatory Reading Order

Before writing any code, read these files in order:

1. `.ai/project.md` — current state, priorities, what's done vs. in-progress
2. `.ai/architecture.md` — system design, data flow, layer responsibilities
3. `.ai/tech-stack.md` — every library used and why
4. `.ai/coding-standards.md` — naming, patterns, file structure rules
5. `.ai/folder-structure.md` — exact directory layout for both apps
6. `.ai/ui-rules.md` — frontend-specific rules (components, state, hooks)
7. `.ai/api-rules.md` — backend-specific rules (routes, services, sockets)
8. `.ai/database.md` — MongoDB schemas, indexes, query patterns

---

## Non-Negotiable Rules

1. **TypeScript strict mode** — no `any`, no `@ts-ignore` without a comment explaining why
2. **Never touch mock data** in `constants/mock-data.ts` or `data/*.ts` unless explicitly asked — the frontend still uses these while the API is being built
3. **Never remove existing UI components** — the frontend is fully built; only extend it
4. **Follow the layered architecture** on the backend: `routes → validators → controllers → services → repositories → models`
5. **No direct Mongoose calls in controllers** — always go through the repository layer
6. **No business logic in controllers** — controllers only parse HTTP and call services
7. **All new API routes must be authenticated** with `authenticateJWT` middleware unless explicitly a public endpoint
8. **Zod schemas are required** for all request body validation — use `validate(schema)` middleware
9. **Socket.IO events must be typed** — add event types to `apps/api/src/types/index.ts`
10. **Run `npm run check-types` before finishing** any task — zero TypeScript errors required

---

## Current Implementation Phase

See `TASKS.md` for the active task list and `CHANGELOG.md` for what has been completed.

**Current phase**: Phase 2 — User Profile & Settings API (see `.ai/project.md` for details)

---

## How to Run the Project

```sh
# Install all dependencies (run from repo root)
npm install

# Start all apps in dev mode
npm run dev

# Type check all packages
npm run check-types

# Lint all packages
npm run lint
```

---

## Key File Locations

| What | Where |
|------|-------|
| API entry point | `apps/api/src/server.ts` |
| Express app setup | `apps/api/src/app.ts` |
| Environment config | `apps/api/src/config/env.ts` |
| Token utilities | `apps/api/src/utils/token.ts` |
| Auth service | `apps/api/src/services/auth.service.ts` |
| User repository | `apps/api/src/repositories/user.repository.ts` |
| Frontend root layout | `apps/web/src/app/layout.tsx` |
| Auth provider | `apps/web/src/providers/auth-provider.tsx` |
| Axios instance (with refresh interceptor) | `apps/web/src/lib/axios.ts` |
| Auth store | `apps/web/src/store/auth-store.ts` |
| Auth service (frontend) | `apps/web/src/services/auth-service.ts` |
| Socket provider (connection commented out) | `apps/web/src/providers/socket-provider.tsx` |
| OAuth callback page | `apps/web/src/app/auth/callback/page.tsx` |
| Email verify page | `apps/web/src/app/verify-email/page.tsx` |

---

## References

- Full architecture: `docs/architecture_and_workflow.md`
- Implementation plan: `docs/implementation_plan.md`
- Production blueprint: `docs/production_architecture_blueprint.md`
- ADR log: `docs/adr/`
