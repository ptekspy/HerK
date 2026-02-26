# API Contract Guard Worker (NestJS + BullMQ)

Asynchronous processor for PR contract analysis jobs.

## Responsibilities

- Fetch baseline/candidate contracts (GitHub file or public URL)
- Compute OpenAPI breaking-change issues
- Apply policy + waiver decisions
- Persist check results/issues
- Publish GitHub check run + PR comment
- Emit in-app and email notifications

## Run

```bash
pnpm --filter worker dev
```

Queue: `pr-analysis`
