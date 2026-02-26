# syntax=docker/dockerfile:1.6

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---------- PRUNE ----------
FROM base AS pruner

# Turbo needs the repo to compute the pruned workspace
COPY . .

# If turbo is in devDependencies you can use: RUN pnpm turbo prune ...
# This works either way:
RUN pnpm dlx turbo prune web --docker

# ---------- INSTALL + BUILD ----------
FROM base AS builder

# 1) Copy only pruned manifests/lockfile first (stable cache layer)
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# (optional but recommended) cache pnpm store between builds
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# 2) Copy actual source after deps are installed
COPY --from=pruner /app/out/full/ ./

# Build just the target (or let your scripts call turbo internally)
RUN pnpm --filter web build

# ---------- RUN ----------
FROM node:22-alpine AS runner
WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production

# If your app needs runtime deps from the workspace, easiest is copy all pruned workspace + node_modules
COPY --from=builder /app ./

WORKDIR /app/apps/contract-guard/web
EXPOSE 4000
CMD ["pnpm", "start", "-p", "4000", "-H", "0.0.0.0"]