# Scoring Rubric

## Weights

- 0G integration depth: 35
- Technical completeness: 20
- Documentation and reproducibility: 20
- Demo clarity: 10
- Community usefulness: 10
- Security and reliability hygiene: 5

## Caps

- No valid 0G contract or Explorer proof: max 45
- No 0G Storage upload: max 55
- No 0G Compute review: max 75
- Empty or placeholder repo: max 35
- Missing README: max 60
- Missing demo: max 70
- Broken setup instructions: max 80
- Detected secret leak: max 50
- No on-chain anchor: max 65

## Module Verification

The evaluator does not trust checked boxes alone. It verifies claimed modules with these signals:

- `0G Chain`: submitted contract is an EVM address and the Explorer URL points to 0G/ChainScan.
- `0G Storage`: README, repo paths, or generated proof mention 0G Storage, Storage root, Storage indexer, or the 0G TypeScript SDK.
- `0G Compute`: README or repo evidence mentions 0G Compute, inference, serving broker, Compute provider, or configured Compute env vars.
- `Agent ID`: README or repo evidence mentions Agent ID, agent identity, `.0g`, or agent profiles.
- `Privacy`: README or repo evidence mentions TEE, sealed inference, encryption, confidentiality, or secure execution.

After analysis, storage and chain are upgraded from claimed evidence to verified evidence only if the 0G SDK or registry transaction returns a real proof.
