import { readFileSync } from "node:fs";
import { reportHash } from "../apps/api/src/services/hashing.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx scripts/verify-report-hash.ts report.json");
  process.exit(1);
}

const report = JSON.parse(readFileSync(file, "utf8"));
console.log(reportHash(report));
