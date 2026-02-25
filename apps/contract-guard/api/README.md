# ContractGuard API (NestJS)

HTTP API + webhook ingress for ContractGuard.

## Responsibilities

- Multi-tenant org/repo/service management
- Policy, waiver, member, notification, and billing endpoints
- GitHub webhook verification + PR analysis enqueue
- Stripe webhook verification + subscription sync

## Run

```bash
pnpm --filter @herk/db-contract-guard prisma:generate
pnpm --filter api dev
```

Default port: `4001`

## Auth Config

- OAuth mode: set `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, and (optionally) `GITHUB_OAUTH_REDIRECT_URI`.
- GitHub App install flow: set `GITHUB_APP_SLUG` (or `GITHUB_APP_INSTALL_URL`) and configure the app setup URL to `.../auth/github/app/install/callback`.
- Session cookies: configure `SESSION_COOKIE_NAME`, `SESSION_TTL_DAYS`, `FRONTEND_URL`, and `AUTH_ALLOWED_REDIRECT_ORIGINS`.
- Demo header mode: set `ALLOW_HEADER_AUTH=true` and send `x-user-email` (plus optional `x-user-name`).

## Key Routes

- `GET /auth/github/start`
- `GET /auth/github/callback`
- `GET /auth/github/app/install/start`
- `GET /auth/github/app/install/callback`
- `GET /auth/session`
- `POST /auth/logout`
- `GET /v1/me`
- `GET/POST /v1/orgs`
- `GET/POST/PATCH/DELETE /v1/orgs/:orgId/repos`
- `GET /v1/orgs/:orgId/github/installations`
- `POST /v1/orgs/:orgId/github/installations/sync`
- `GET/POST/PATCH/DELETE /v1/orgs/:orgId/services`
- `GET/PUT /v1/orgs/:orgId/policies/default`
- `GET/PUT /v1/orgs/:orgId/services/:serviceId/policy`
- `GET /v1/orgs/:orgId/checks`
- `GET /v1/orgs/:orgId/checks/:checkId`
- `GET/POST/PATCH/DELETE /v1/orgs/:orgId/waivers`
- `GET/PATCH /v1/orgs/:orgId/notifications`
- `GET/POST/PATCH/DELETE /v1/orgs/:orgId/members`
- `GET /v1/orgs/:orgId/billing`
- `POST /v1/orgs/:orgId/billing/checkout-session`
- `POST /v1/orgs/:orgId/billing/portal-session`
- `POST /webhooks/github`
- `POST /webhooks/stripe`

## Testing

```bash
pnpm --filter api test -- --runInBand
```
