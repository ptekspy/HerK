# ContractGuard API (NestJS)

HTTP API + webhook ingress for ContractGuard.

## Responsibilities

- Multi-tenant org/repo/service management
- Policy, waiver, member, notification, and billing endpoints
- GitHub webhook verification + PR analysis enqueue
- Stripe webhook verification + subscription sync

## Run

```bash
pnpm --filter @herk/db prisma:generate
pnpm --filter api dev
```

Default port: `4001`

## Key Routes

- `GET /v1/me`
- `GET/POST /v1/orgs`
- `GET/POST/PATCH/DELETE /v1/orgs/:orgId/repos`
- `GET/POST/PATCH/DELETE /v1/orgs/:orgId/services`
- `GET/PUT /v1/orgs/:orgId/policies/default`
- `GET/PUT /v1/orgs/:orgId/services/:serviceId/policy`
- `GET /v1/orgs/:orgId/checks`
- `GET /v1/orgs/:orgId/checks/:checkId`
- `POST/DELETE /v1/orgs/:orgId/waivers`
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
