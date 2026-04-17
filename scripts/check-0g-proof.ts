const [contractAddress, explorerUrl, storageRoot] = process.argv.slice(2);

if (!contractAddress || !explorerUrl || !storageRoot) {
  console.error("Usage: tsx scripts/check-0g-proof.ts <contract> <explorer-url> <storage-root>");
  process.exit(1);
}

const looksLikeAddress = /^0x[a-fA-F0-9]{40}$/.test(contractAddress);
const looksLike0gExplorer = explorerUrl.includes("0g") || explorerUrl.includes("chainscan");
const looksLikeRoot = storageRoot.startsWith("0x");

console.log(JSON.stringify({
  contractAddress,
  explorerUrl,
  storageRoot,
  checks: {
    looksLikeAddress,
    looksLike0gExplorer,
    looksLikeRoot
  },
  ok: looksLikeAddress && looksLike0gExplorer && looksLikeRoot
}, null, 2));
