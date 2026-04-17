import type { ScoreSet } from "@buildproof/shared";
import type { CSSProperties } from "react";

export function ScoreBreakdown({ scores }: { scores: ScoreSet }) {
  const items = [
    ["Overall", scores.overall],
    ["Integration", scores.integration],
    ["Implementation", scores.implementation],
    ["Docs", scores.documentation],
    ["Demo", scores.demo],
    ["Community", scores.community],
    ["Security", scores.security]
  ] as const;

  return (
    <div className="split">
      <section className="band" style={{ textAlign: "center" }}>
        <p className="muted">Overall BuildProof Score</p>
        <div className="score-ring" style={{ "--score": scores.overall } as CSSProperties}>{scores.overall}</div>
        <p>{scores.overall >= 85 ? "Judge ready" : scores.overall >= 70 ? "Strong with cleanup" : "Needs focused improvements"}</p>
      </section>
      <div className="grid grid-3">
      {items.map(([label, value]) => (
        <div className="metric" key={label}>
          <span className="muted">{label}</span>
          <strong className={value >= 80 ? "ok" : value >= 60 ? "warn" : "risk"}>{value}</strong>
        </div>
      ))}
      </div>
    </div>
  );
}
