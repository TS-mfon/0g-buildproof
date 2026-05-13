# 0G BuildProof

0G BuildProof is a verifiable quality and reputation layer for 0G ecosystem projects. Builders submit a repository, demo, 0G mainnet contract address, and Explorer proof. AI agents review the submission, generate a BuildProof Passport, upload the report bundle to 0G Storage, and anchor the report hash through a 0G mainnet registry.


0G BuildProof verifies project integrations, scores technical quality, and stores builder reputation using AI agents, 0G Storage, 0G Compute, and 0G Chain.

## Problem

Hackathons and ecosystem programs need a faster way to distinguish serious projects from shallow submissions. Judges need proof of real integration. Builders need actionable feedback before final submission. Ecosystem teams need a durable reputation trail for promising teams.

## Solution

0G BuildProof creates a public BuildProof Passport for every submitted project. The passport summarizes integration evidence, repository quality, documentation quality, demo readiness, security risks, and suggested improvements. The full report is stored on 0G Storage and anchored on 0G Chain.

## Why This Helps 0G

- Helps judges review submissions faster.
- Helps builders improve before final submission.
- Helps ecosystem teams find serious projects.
- Helps community contributors discover projects that need support.
- Creates public reputation history for builders.
- Rewards real 0G integration instead of superficial claims.

## Product Demo Flow

1. Builder opens the Vercel app.
2. Builder submits project name, wallet, GitHub repo, demo link, 0G mainnet contract address, Explorer link, and claimed 0G modules.
3. Render API creates an analysis job.
4. Render worker runs the BuildProof agent pipeline.
5. The report is uploaded to 0G Storage.
6. The report hash is anchored through `BuildProofRegistry` on 0G Chain.
7. The passport page and Judge Mode page display all proof links.

## 0G Components Used

### 0G Chain

`BuildProofRegistry` stores compact verification metadata: project owner, URLs, submitted contract, storage root, report hash, score summary, status, endorsements, and flags. Full reports are not stored on-chain. This build is mainnet-only.

### 0G Storage

Full BuildProof reports, agent findings, evidence bundles, and historical passport versions are uploaded through `@0gfoundation/0g-ts-sdk`. A project is marked `Storage Verified` only when the SDK returns a real root hash.

### 0G Compute

The agent pipeline is routed through `compute0g.ts`. Deployments must configure `OG_COMPUTE_ENDPOINT`, `OG_COMPUTE_KEY`, and `OG_COMPUTE_MODEL` to mark Compute as verified. If these values are absent or the endpoint fails, the report is still generated, but `0G Compute` is not included in `verifiedModules`.

### Agent Identity

The project models persistent review agents:

- `agent.integration-verifier.buildproof.0g`
- `agent.repo-auditor.buildproof.0g`
- `agent.docs-reviewer.buildproof.0g`
- `agent.demo-reviewer.buildproof.0g`
- `agent.security-reviewer.buildproof.0g`
- `agent.community-mentor.buildproof.0g`
- `agent.judge-summarizer.buildproof.0g`

## Architecture

```text
Browser
  -> Vercel Next.js app
  -> Render API service
  -> Render worker service
  -> GitHub API
  -> 0G Storage
  -> 0G Chain
  -> optional 0G Compute endpoint when configured
```

The Render API persists submitted projects, jobs, and reports to `DATA_DIR/buildproof-state.json`. On Render this should be backed by the mounted disk at `/var/data`. Reports are also uploaded to 0G Storage when the SDK returns a real root hash, and the passport can be minted through the 0G registry.

## Monorepo Structure

```text
apps/web       Vercel Next.js frontend
apps/api       Render Fastify API
apps/worker    Render background worker
contracts      Foundry registry contract
packages/shared Shared schemas, scoring, and constants
docs           Deployment and judging notes
scripts        Verification helpers
```

## Smart Contract

The registry contract lives in `contracts/src/BuildProofRegistry.sol`.

Core functions:

- `registerProject`
- `updateReport`
- `setStatus`
- `endorseProject`
- `flagProject`
- `ownerOf`
- `balanceOf`
- `tokenURI`
- `getProject`
- `getProjectCount`
- `getProjectsByOwner`

`registerProject` also mints a non-transferable passport token. The token ID equals the registry project ID and `tokenURI(tokenId)` returns the 0G Storage root for the passport report.

Compile settings:

```toml
evm_version = "cancun"
optimizer = true
optimizer_runs = 200
```

## Backend Services

Render API endpoints:

```text
GET  /health
POST /projects
GET  /projects
GET  /projects/:projectId
POST /projects/:projectId/analyze
GET  /projects/:projectId/jobs/:jobId
GET  /projects/:projectId/report
GET  /projects/:projectId/judge
POST /projects/:projectId/mint
GET  /storage/:projectId
POST /internal/jobs/:jobId/run
```

Render worker queue:

```text
project-analysis
```

Job steps:

```text
validate-submission
inspect-github
verify-0g-evidence
run-agents
calculate-score
canonicalize-report
hash-report
upload-0g-storage
anchor-0g-chain
publish-passport
```

## Agent Pipeline

Every agent produces evidence-bound JSON. No finding should appear without a linked source, submitted field, GitHub path, Explorer URL, or storage proof.

- **IntegrationVerifier:** checks contract address, Explorer link, claimed modules, README/code evidence, and proof consistency. Claimed modules only count when matching evidence is found.
- **RepoAuditor:** checks implementation depth, source files, tests, and placeholder risk.
- **DocsReviewer:** checks README, architecture notes, setup, and reproducibility.
- **DemoReviewer:** checks demo presence and whether final video can show real 0G usage.
- **SecurityReviewer:** checks obvious secret hygiene and deployment risks.
- **CommunityMentor:** creates improvement tasks and ecosystem contribution ideas. When 0G Compute is configured, this review is backed by the Compute endpoint.



## Local Development

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env.local
```

Run the API:

```bash
npm run dev --workspace @buildproof/api
```

Run the worker:

```bash
npm run dev --workspace @buildproof/worker
```

Run the web app:

```bash
npm run dev --workspace @buildproof/web
```

Run contract tests:

```bash
forge test --root contracts
```

## Environment Variables

Public frontend values:

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_0G_MAINNET_CHAIN_ID=16661
NEXT_PUBLIC_0G_MAINNET_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_0G_MAINNET_EXPLORER=https://chainscan.0g.ai
NEXT_PUBLIC_BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

Private backend values:

```env
DATABASE_URL=
DATA_DIR=/var/data
REDIS_URL=
ANALYSIS_QUEUE_MODE=sync
GITHUB_TOKEN=
PRIVATE_KEY=
OG_MAINNET_RPC_URL=https://evmrpc.0g.ai
OG_MAINNET_STORAGE_INDEXER=https://indexer-storage-turbo.0g.ai
OG_COMPUTE_ENDPOINT=
OG_COMPUTE_KEY=
OG_COMPUTE_MODEL=
BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
```


## 0G Deployment

Deploy registry:

```bash
export BUILDPROOF_OWNER=0xYourOwnerAddress
export PRIVATE_KEY=0xYourFreshLimitedFundsPrivateKey
forge create \
  --root contracts \
  --rpc-url https://evmrpc.0g.ai \
  --private-key $PRIVATE_KEY \
  --evm-version cancun \
  src/BuildProofRegistry.sol:BuildProofRegistry \
  --constructor-args $BUILDPROOF_OWNER
```

After deployment, update:

```env
BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
NEXT_PUBLIC_BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
```

Current deployed passport registry:

```text
BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
Deployment transaction: https://chainscan.0g.ai/tx/0x0e685a0b54fd00fb64bd8698cf0b1b5c99a16dea495fcf7fdce1399026c2ef73
```

## Render Deployment

Create two services:

- `0g-buildproof-api`
- `0g-buildproof-worker`

API start command:

```bash
npm run start --workspace @buildproof/api
```

Worker start command:

```bash
npm run start --workspace @buildproof/worker
```

Health check:

```text
/health
```

Required Render env vars:

```env
NODE_ENV=production
PORT=10000
API_BASE_URL=https://zerog-buildproof-api-sytg.onrender.com
CORS_ORIGIN=https://0g-buildproof.vercel.app
DATABASE_URL=
REDIS_URL=
ANALYSIS_QUEUE_MODE=sync
GITHUB_TOKEN=
PRIVATE_KEY=
OG_COMPUTE_ENDPOINT=
OG_COMPUTE_KEY=
OG_COMPUTE_MODEL=
BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
```

## Vercel Deployment

Vercel root:

```text
apps/web
```

Build command:

```bash
npm run build --workspace @buildproof/shared && npm run build --workspace @buildproof/web
```

Required Vercel env vars:

```env
NEXT_PUBLIC_API_BASE_URL=https://zerog-buildproof-api-sytg.onrender.com
NEXT_PUBLIC_0G_MAINNET_CHAIN_ID=16661
NEXT_PUBLIC_0G_MAINNET_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_0G_MAINNET_EXPLORER=https://chainscan.0g.ai
NEXT_PUBLIC_BUILDPROOF_REGISTRY_MAINNET=0x6C7Bd982991Cb2dedfcCF48Ee08445b74E0e50A8
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```


## Roadmap

- Render Postgres persistence adapter.
- Durable database persistence.
- Retrieved 0G Storage proof verification.
- Wallet-signed submission ownership.
- Builder reputation pages.
- Public BuildProof API for 0G ecosystem dashboards.
- Grant readiness score.
- OpenClaw-native orchestration.
- Sealed private pre-review mode.


I used render free tier so please be patient cause the service goes to sleep every 15 mins
