# ContractGuard Monorepo

ContractGuard prevents breaking API changes from reaching production by diffing OpenAPI contracts on pull requests and enforcing policy-driven outcomes.

## Workspace Layout

- `apps/contract-guard/web`: Next.js product UI (dashboard + onboarding + settings)
- `apps/contract-guard/api`: NestJS HTTP API + webhook ingress
- `apps/contract-guard/worker`: NestJS BullMQ worker for contract analysis
- `packages/api`: shared domain contracts/types
- `packages/db`: ContractGuard-scoped Prisma package (`@herk/db-contract-guard`)

## Requirements

- Node.js 22+
- pnpm 9+
- Postgres 16+
- Redis 7+

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Generate Prisma client:

```bash
pnpm --filter @herk/db-contract-guard prisma:generate
```

3. Create env files:

- `cp apps/contract-guard/api/.env.example apps/contract-guard/api/.env`
- `cp apps/contract-guard/worker/.env.example apps/contract-guard/worker/.env`
- `cp apps/contract-guard/web/.env.example apps/contract-guard/web/.env.local`

4. Start infrastructure (Postgres + Redis):

```bash
docker compose up -d postgres redis
```

5. Apply Prisma migrations:

```bash
pnpm --filter @herk/db-contract-guard prisma:migrate:dev
```

6. Run apps:

```bash
pnpm --filter api dev
pnpm --filter worker dev
pnpm --filter web dev
```

## Authentication Modes

- Production/default mode: GitHub OAuth (`/auth/github/start` -> `/auth/github/callback`) with an HTTP-only session cookie.
- GitHub App install flow: `/auth/github/app/install/start?orgId=...` -> GitHub -> `/auth/github/app/install/callback`.
- Local demo mode: set `ALLOW_HEADER_AUTH=true` in API env and `NEXT_PUBLIC_DEMO_USER_EMAIL` + `NEXT_PUBLIC_DEMO_USER_NAME` in web env.

## DB Schema Isolation

Use a schema-scoped Postgres URL for each app package. ContractGuard defaults to:

- `postgresql://.../contractguard?schema=contract_guard`

## Full Docker Compose

A full single-VM runtime (web, api, worker, postgres, redis, caddy) is included:

```bash
cp .env.compose.example .env.compose
docker compose up --build
```

- Web/UI: `http://localhost`
- API: `http://localhost/v1/...`
- Webhooks: `http://localhost/webhooks/...`

## Build and Test

```bash
pnpm --filter @herk/api build
pnpm --filter @herk/db-contract-guard build
pnpm --filter api build
pnpm --filter worker build
pnpm --filter web build
pnpm --filter api test -- --runInBand
```
