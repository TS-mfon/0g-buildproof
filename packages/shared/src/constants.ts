export const OG_MAINNET = {
  id: "0g-mainnet",
  chainId: 16661,
  rpcUrl: "https://evmrpc.0g.ai",
  explorerUrl: "https://chainscan.0g.ai",
  storageIndexer: "https://indexer-storage-turbo.0g.ai",
  storageFlow: "0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526"
} as const;

export const OG_TESTNET = {
  id: "0g-testnet",
  chainId: 16602,
  rpcUrl: "https://evmrpc-testnet.0g.ai",
  explorerUrl: "https://chainscan-galileo.0g.ai",
  storageIndexer: "https://indexer-storage-testnet-turbo.0g.ai"
} as const;

export const CLAIMABLE_MODULES = [
  "0G Storage",
  "0G Compute",
  "0G Chain",
  "Agent ID",
  "Privacy"
] as const;

export const SCORE_WEIGHTS = {
  integration: 35,
  implementation: 20,
  documentation: 20,
  demo: 10,
  community: 10,
  security: 5
} as const;
