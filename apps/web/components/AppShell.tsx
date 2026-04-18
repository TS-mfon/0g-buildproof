import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="brand">0G BuildProof</Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/submit">Submit</Link>
          <Link href="/projects">Leaderboard</Link>
          <Link href="/agents">Agents</Link>
          <Link href={"/judge" as never}>Judge Mode</Link>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
