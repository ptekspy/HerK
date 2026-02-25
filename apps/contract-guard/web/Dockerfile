FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @herk/ui lint || true
RUN pnpm --filter web build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

RUN pnpm install --frozen-lockfile --prod=false

WORKDIR /app/apps/contract-guard/web
CMD ["pnpm", "start", "--", "-p", "4000"]
