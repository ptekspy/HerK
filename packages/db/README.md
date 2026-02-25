# @herk/db-contract-guard

App-scoped Prisma package for ContractGuard.

## Why app-scoped

This monorepo will host multiple products over time. Each product should own its own Prisma package and migration history so schema evolution stays isolated.

ContractGuard uses:

- Package: `@herk/db-contract-guard`
- Postgres schema: `contract_guard`
- URL shape: `postgresql://.../database?schema=contract_guard`

## Commands

```bash
pnpm --filter @herk/db-contract-guard prisma:generate
pnpm --filter @herk/db-contract-guard prisma:migrate:dev
pnpm --filter @herk/db-contract-guard build
```

## Pattern for new apps

Create a sibling package such as `@herk/db-merge-latency` with its own:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- package scripts and client entrypoint

Then point that app's `DATABASE_URL` to its own Postgres schema (e.g. `?schema=merge_latency`).
