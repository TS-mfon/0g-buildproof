# 0G BuildProof

0G BuildProof is a verifiable quality and reputation layer for 0G ecosystem projects. Builders submit a repository, demo, 0G contract address, and Explorer proof. AI agents review the submission, generate a BuildProof Passport, store the report on 0G Storage, and anchor the report hash on 0G Chain.

## One-Sentence Description

0G BuildProof verifies project integrations, scores technical quality, and stores builder reputation using AI agents, 0G Storage, Compute, and Chain.

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
2. Builder submits project name, wallet, GitHub repo, demo link, 0G contract address, Explorer link, target network, and claimed 0G modules.
3. Render API creates an analysis job.
4. Render worker runs the BuildProof agent pipeline.
5. The report is uploaded to 0G Storage.
6. The report hash is anchored through `BuildProofRegistry` on 0G Chain.
7. The passport page and Judge Mode page display all proof links.

## 0G Components Used

### 0G Chain

`BuildProofRegistry` stores compact verification metadata: project owner, URLs, submitted contract, storage root, report hash, score summary, status, endorsements, and flags. Full reports are not stored on-chain.

### 0G Storage

Full BuildProof reports, agent findings, evidence bundles, and historical passport versions are stored on 0G Storage. The registry stores only the returned storage root and report hash.

### 0G Compute

The agent pipeline is routed through `compute0g.ts`. Production deployments should configure `OG_COMPUTE_ENDPOINT`, `OG_COMPUTE_KEY`, and `OG_COMPUTE_MODEL`. Development fallback is explicitly marked and must not be represented as final 0G Compute proof.

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
  -> 0G Compute
  -> 0G Storage
  -> 0G Chain
```

The current implementation includes an in-memory development store so the product can be exercised locally before wiring Render Postgres. The deployment plan reserves `DATABASE_URL` and `REDIS_URL` for production persistence and job orchestration.

## Monorepo Structure

```text
apps/web       Vercel Next.js frontend
apps/api       Render Fastify API
apps/worker    Render background worker
contracts      Foundry registry contract
packages/shared Shared schemas, scoring, and constants
docs           Deployment and judging notes
scripts        Verification and demo helper placeholders
```

## Smart Contract

The registry contract lives in `contracts/src/BuildProofRegistry.sol`.

Core functions:

- `registerProject`
- `updateReport`
- `setStatus`
- `endorseProject`
- `flagProject`
- `getProject`
- `getProjectCount`
- `getProjectsByOwner`

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

- **IntegrationVerifier:** checks contract address, Explorer link, claimed modules, and proof consistency.
- **RepoAuditor:** checks implementation depth, source files, tests, and placeholder risk.
- **DocsReviewer:** checks README, architecture notes, setup, and reproducibility.
- **DemoReviewer:** checks demo presence and whether final video can show real 0G usage.
- **SecurityReviewer:** checks obvious secret hygiene and deployment risks.
- **CommunityMentor:** creates improvement tasks and ecosystem contribution ideas.
- **JudgeSummarizer:** condenses evidence into a judge-facing verdict.

## Scoring Rubric

Weights:

```text
0G integration depth: 35
technical completeness: 20
documentation/reproducibility: 20
demo clarity: 10
community usefulness: 10
security/reliability hygiene: 5
```

Caps:

```text
No valid 0G contract or Explorer proof: max 45
No 0G Storage upload: max 55
No 0G Compute review: max 75
Empty or placeholder repo: max 35
Missing README: max 60
Missing demo: max 70
Broken setup instructions: max 80
Detected secret leak: max 50
No on-chain anchor: max 65
```

Badges:

```text
Storage Verified
Chain Anchored
Compute Reviewed
Mainnet Proof
Docs Excellent
Judge Ready
Community Useful
Needs Work
High Risk
```

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
NEXT_PUBLIC_BUILDPROOF_REGISTRY_MAINNET=
NEXT_PUBLIC_BUILDPROOF_REGISTRY_TESTNET=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

Private backend values:

```env
DATABASE_URL=
REDIS_URL=
GITHUB_TOKEN=
PRIVATE_KEY=
OG_MAINNET_RPC_URL=https://evmrpc.0g.ai
OG_MAINNET_STORAGE_INDEXER=https://indexer-storage-turbo.0g.ai
OG_TESTNET_RPC_URL=https://evmrpc-testnet.0g.ai
OG_TESTNET_STORAGE_INDEXER=https://indexer-storage-testnet-turbo.0g.ai
OG_COMPUTE_ENDPOINT=
OG_COMPUTE_KEY=
OG_COMPUTE_MODEL=
BUILDPROOF_REGISTRY_MAINNET=
BUILDPROOF_REGISTRY_TESTNET=
```

## Data Needed Before Final Deployment

Do not paste private keys into normal chat. Use `.env.local`, Render env vars, Vercel env vars, or a secure terminal prompt.

Non-secret data:

- Final GitHub repository URL
- Team name
- Primary builder wallet public address
- Target X handle for the public post
- Vercel project name
- Render service names
- Final domain preference

Secrets:

- Fresh 0G deployer private key with limited funds
- 0G Storage signer key if separate from deployer
- GitHub token if API rate limits matter
- 0G Compute endpoint/key/model
- WalletConnect/Reown project ID if wallet modal is enabled
- Render API key if deploying by CLI
- Vercel token if deploying by CLI

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
BUILDPROOF_REGISTRY_MAINNET=
NEXT_PUBLIC_BUILDPROOF_REGISTRY_MAINNET=
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
API_BASE_URL=https://0g-buildproof-api.onrender.com
CORS_ORIGIN=https://0g-buildproof.vercel.app
DATABASE_URL=
REDIS_URL=
GITHUB_TOKEN=
PRIVATE_KEY=
OG_COMPUTE_ENDPOINT=
OG_COMPUTE_KEY=
OG_COMPUTE_MODEL=
BUILDPROOF_REGISTRY_MAINNET=
BUILDPROOF_REGISTRY_TESTNET=
```

## Vercel Deployment

Vercel root:

```text
apps/web
```

Build command:

```bash
npm run build --workspace @buildproof/web
```

Required Vercel env vars:

```env
NEXT_PUBLIC_API_BASE_URL=https://0g-buildproof-api.onrender.com
NEXT_PUBLIC_0G_MAINNET_CHAIN_ID=16661
NEXT_PUBLIC_0G_MAINNET_RPC_URL=https://evmrpc.0g.ai
NEXT_PUBLIC_0G_MAINNET_EXPLORER=https://chainscan.0g.ai
NEXT_PUBLIC_BUILDPROOF_REGISTRY_MAINNET=
NEXT_PUBLIC_BUILDPROOF_REGISTRY_TESTNET=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

## Demo Script

Target length: under three minutes.

```text
0:00-0:15 0G ecosystem needs verifiable builder quality.
0:15-0:35 Submit repo, demo, 0G contract, Explorer link.
0:35-1:05 Agent timeline runs.
1:05-1:30 Passport appears with scores, badges, risks.
1:30-1:55 Open 0G Storage proof.
1:55-2:20 Open 0G Chain Explorer proof.
2:20-2:40 Open Judge Mode.
2:40-2:55 Show leaderboard.
2:55-3:00 BuildProof makes 0G project quality verifiable.
```

## Hackathon Submission Proof

Fill these before HackQuest submission:

```text
0G mainnet registry contract: 0x45119A32ca6C4d67424401dA92Abe4EC6c83f8Ce
0G mainnet Explorer link: https://chainscan.0g.ai/tx/0x35af72b28f166b455781f8fdaa06eb764c5d231fc5c0b165c16db4913be734dd
0G registry project activity: https://chainscan.0g.ai/tx/0x55911abae2e242a0b207f915b5e44d22619ec242745923153be1645816674dbe
0G Storage root:
0G Compute model/provider:
GitHub repository: https://github.com/TS-mfon/0g-buildproof
Live Vercel app:
Render API health endpoint: https://zerog-buildproof-api.onrender.com/health
Demo video:
X post:
```

## Security Notes

- Use a fresh deployer wallet with limited funds.
- Never commit `.env`, `.env.local`, private keys, API keys, or seed phrases.
- Store production secrets only in Render or Vercel dashboards.
- Only expose `NEXT_PUBLIC_*` values to the frontend.
- Prefer user wallet signing where possible.
- Rotate any key that appears in a log, screenshot, repo, or demo recording.
- `npm audit` currently reports transitive axios advisories through the 0G TypeScript SDK dependency chain. There is no npm audit fix available at the time of implementation; review the SDK release notes before final deployment.

## Roadmap

- Render Postgres persistence adapter.
- Real 0G Storage SDK upload implementation with retrieved proof verification.
- Full viem registry write integration.
- Wallet-signed submission ownership.
- Builder reputation pages.
- Public BuildProof API for 0G ecosystem dashboards.
- Grant readiness score.
- OpenClaw-native orchestration.
- Sealed private pre-review mode.
