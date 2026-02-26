# API Contract Guard Web (Next.js)

Product UI for onboarding and org-scoped operations:

- Dashboard
- Repositories
- Services
- Policies
- Checks + check detail
- Waivers
- Notifications
- Team
- Billing

## Run

```bash
pnpm --filter web dev
```

Default port: `4000`

Set `NEXT_PUBLIC_API_URL` to point at the API (default `http://localhost:4001`).
For proxied production setups, set:
- `NEXT_PUBLIC_WEB_URL=https://apicontractguard.com`
- `NEXT_PUBLIC_API_URL=https://apicontractguard.com`
- `INTERNAL_API_URL=http://contractguard-api:4001` (server-side fetches inside container network)

For OAuth onboarding, set either:

- `NEXT_PUBLIC_GITHUB_OAUTH_URL` directly, or
- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WEB_URL` so the UI builds `/auth/github/start?returnTo=...` automatically.

For GitHub App install onboarding, set API-side `GITHUB_APP_SLUG` (or `GITHUB_APP_INSTALL_URL`) and GitHub App setup URL to `/auth/github/app/install/callback`.
