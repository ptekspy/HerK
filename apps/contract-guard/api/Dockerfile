FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @herk/api build
RUN pnpm --filter @herk/db-contract-guard prisma:generate
RUN pnpm --filter @herk/db-contract-guard build
RUN pnpm --filter api build

FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

RUN pnpm install --frozen-lockfile --prod=false

WORKDIR /app/apps/contract-guard/api
CMD ["pnpm", "start:prod"]
