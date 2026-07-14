# Ethereum-backed workspace

Local workspace holding three **independent** git repositories (no root `.git`):

| Directory | Stack | Remote |
|-----------|--------|--------|
| [`contracts/`](contracts/) | Hardhat + SimpleRegistry | push to your contracts repo |
| [`backend/`](backend/) | NestJS API + listener + indexer + notification | push to your backend repo |
| [`frontend/`](frontend/) | React + Vite + MUI + wagmi | push to your frontend repo |

Architecture: see [`block-chain-plan.md`](block-chain-plan.md).

## Local run order

1. **Contracts** — start local chain and deploy:

```bash
cd contracts && npm install && npm run node
# other terminal:
cd contracts && npm run deploy:local
# copy address from exports/SimpleRegistry.json
```

2. **Backend** — infra + four processes:

```bash
cd backend && cp .env.example .env
# set CONTRACT_ADDRESS from step 1
npm install && npm run docker:up
npx prisma migrate deploy && npx prisma generate
npm run start:api
npm run start:listener
npm run start:indexer
npm run start:notification
```

3. **Frontend**:

```bash
cd frontend && cp .env.example .env
# set VITE_CONTRACT_ADDRESS + VITE_API_URL
npm install && npm run dev
```

## Attach remotes (when ready)

```bash
cd contracts && git remote add origin <contracts-repo-url> && git push -u origin master
cd ../backend  && git remote add origin <backend-repo-url>  && git push -u origin master
cd ../frontend && git remote add origin <frontend-repo-url> && git push -u origin master
```
