import { keccak256, toBytes } from "viem";

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortObject(value));
}

export function reportHash(value: unknown): `0x${string}` {
  return keccak256(toBytes(canonicalJson(value)));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, sortObject(nested)])
    );
  }
  return value;
}
