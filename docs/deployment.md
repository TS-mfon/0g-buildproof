# Deployment

## Targets

- Vercel: `apps/web`
- Render Web Service: `apps/api`
- Render Background Worker: `apps/worker`
- 0G Chain: `contracts/src/BuildProofRegistry.sol`

## Order

1. Deploy `BuildProofRegistry` to 0G testnet.
2. Deploy `BuildProofRegistry` to 0G mainnet.
3. Add registry addresses to Render and Vercel env vars.
4. Deploy Render API.
5. Deploy Render worker.
6. Deploy Vercel frontend.
7. Submit a demo project and capture proof links.

## Render API

Start command:

```bash
npm run start --workspace @buildproof/api
```

Health check:

```text
/health
```

## Render Worker

Start command:

```bash
npm run start --workspace @buildproof/worker
```

The worker consumes `project-analysis` jobs and calls the API internal execution endpoint.

## Vercel

Root directory:

```text
apps/web
```

Build command:

```bash
npm run build --workspace @buildproof/web
```
