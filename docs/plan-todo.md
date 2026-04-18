# BuildProof Execution TODO

This checklist tracks the aggressive hackathon plan against the actual implementation.

## Product Surface

- [x] Landing page states the ecosystem vision.
- [x] Walkthrough explains Submit, Agents, Leaderboard, and Judge Mode.
- [x] Submit page accepts only real project data.
- [x] Leaderboard reads live API submissions only.
- [x] Agents page explains the active review agents and verification policy.
- [x] Judge Mode opens real project reports only.
- [x] Demo placeholder routes removed.
- [x] Browser icon added.
- [x] Responsive UI updated for desktop and mobile.

## 0G Integration

- [x] 0G mainnet registry contract deployed.
- [x] App configured as mainnet-only.
- [x] Testnet submission path removed.
- [x] 0G Storage SDK upload implemented in the API.
- [x] 0G Chain registry write implemented in the API.
- [x] Verified modules are only added after real backend results.
- [x] 0G Compute adapter implemented.
- [ ] Configure real `OG_COMPUTE_ENDPOINT`, `OG_COMPUTE_KEY`, and `OG_COMPUTE_MODEL` in Render.
- [ ] Submit a final project after Compute credentials are configured so Judge Mode can show Compute verified.

## Judge Readiness

- [x] GitHub repository link included.
- [x] 0G registry contract and deployment tx documented.
- [x] Storage root field shown only from backend evidence.
- [x] Registry transaction field shown only from backend evidence.
- [x] Score caps penalize missing Storage, Compute, Chain, docs, demos, or repo substance.
- [x] README documents architecture, reproduction, deployment, and submission proof.
- [ ] Add final Vercel URL after deployment succeeds.
- [ ] Add final demo video link.
- [ ] Add final X post link.

## Deployment

- [x] GitHub repository created and populated.
- [x] Render API service deployed.
- [x] Render worker attempted; blocked by Render billing requirement.
- [ ] Push latest implementation.
- [ ] Deploy frontend to Vercel with the current valid token.
- [ ] Run end-to-end submission against deployed API and frontend.
