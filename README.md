# Ethereum Backend

NestJS monorepo with four apps sharing Prisma, Redis, and RabbitMQ:

| App | Role |
|-----|------|
| `api` | REST API (health, wallet auth stub, events, notifications) |
| `event-listener` | Watches `SimpleRegistry` events → publishes to RabbitMQ |
| `indexer` | Consumes events → Postgres + Redis cache invalidation |
| `notification` | Consumes events → stores in-app notifications |

## Prerequisites

- Node 20+
- Docker (Postgres, Redis, RabbitMQ)

## Setup

```bash
cp .env.example .env
npm install
npm run docker:up
npx prisma migrate dev --name init
npx prisma generate
```

Set `CONTRACT_ADDRESS` after deploying from the `contracts` repo.

## Run (four terminals)

```bash
npm run start:api
npm run start:listener
npm run start:indexer
npm run start:notification
```

- API: http://localhost:3001/health
- RabbitMQ UI: http://localhost:15672 (eth / eth)

## Separate git remote

```bash
git remote add origin <your-backend-repo-url>
git push -u origin main
```
