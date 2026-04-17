import type { BuildProofReport } from "@buildproof/shared";
import { ScoreBreakdown } from "./ScoreBreakdown";

export function BuildProofPassport({ report }: { report: BuildProofReport }) {
  return (
    <div className="grid">
      <section className="band">
        <p className="badge good">BuildProof Passport</p>
        <h1 className="title">{report.projectName}</h1>
        <p>{report.description}</p>
        <div>
          {report.badges.map((badge) => <span className={`badge ${badge.includes("Risk") || badge.includes("Needs") ? "risk" : "good"}`} key={badge}>{badge}</span>)}
        </div>
      </section>

      <ScoreBreakdown scores={report.scores} />

      <section className="band">
        <h2 className="section-title">Proof Chain</h2>
        <div className="grid timeline">
          <div className="proof-step"><strong>GitHub evidence</strong><a href={report.githubUrl}>{report.githubUrl}</a></div>
          <div className="proof-step"><strong>0G Storage</strong><span>{report.evidence.storageRoot || "pending"}</span></div>
          <div className="proof-step"><strong>Report hash</strong><span>{report.evidence.reportHash || "pending"}</span></div>
          <div className="proof-step"><strong>0G Chain</strong><span>{report.evidence.registryTxHash || "pending deployment"}</span></div>
        </div>
      </section>

      <section className="band">
        <h2 className="section-title">Judge Summary</h2>
        <p>{report.judgeSummary}</p>
        <p className="muted">{report.ecosystemValue}</p>
      </section>

      <section className="band">
        <h2 className="section-title">Risks and Fixes</h2>
        {report.criticalIssues.length ? report.criticalIssues.map((issue) => <p className="risk" key={issue}>{issue}</p>) : <p className="ok">No critical issues in the current report.</p>}
        {report.recommendedFixes.map((fix) => <p key={fix}>- {fix}</p>)}
      </section>
    </div>
  );
}
