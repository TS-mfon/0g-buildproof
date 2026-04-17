import Link from "next/link";
import { listProjects } from "../lib/apiClient";

export default async function HomePage() {
  const projects = await listProjects();
  const complete = projects.filter((project) => project.status === "complete").length;

  return (
    <div className="grid">
      <section className="hero-console">
        <div className="band">
          <p className="badge good">Live proof console</p>
          <h1 className="title">0G ecosystem quality, verified in one judge-ready passport.</h1>
          <p>
            Submit a project, run evidence-bound AI review agents, store the full report on 0G Storage,
            and anchor the passport hash on 0G Chain.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link className="button" href="/submit">Verify project</Link>
            <Link className="button secondary" href="/judge/demo">Open Judge Mode</Link>
          </div>
        </div>
        <aside className="visual-panel" aria-label="0G BuildProof operations visual">
          <img
            alt="Close-up of resilient compute hardware"
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
          />
          <div className="visual-copy">
            <div className="mini-ledger status-row"><span>Agent quorum</span><strong>7 reviewers</strong></div>
            <div className="mini-ledger status-row"><span>Storage proof</span><span className="pulse" /></div>
            <div className="mini-ledger status-row"><span>Chain anchor</span><strong>0G ready</strong></div>
          </div>
        </aside>
      </section>
      <div className="grid grid-3">
        <div className="metric"><span className="muted">Submitted projects</span><strong>{projects.length}</strong><p>Queued for evidence review.</p></div>
        <div className="metric"><span className="muted">Verified passports</span><strong>{complete}</strong><p>Published with stored reports.</p></div>
        <div className="metric"><span className="muted">Judge mode</span><strong>Ready</strong><p>All proof links on one screen.</p></div>
      </div>
      <section className="band">
        <h2 className="section-title">Proof pipeline</h2>
        <div className="grid grid-3 timeline">
          <div className="proof-step"><strong>Agent analysis</strong><span className="muted">Repo, docs, demo, security, and integration evidence.</span></div>
          <div className="proof-step"><strong>0G Storage report</strong><span className="muted">Canonical JSON passport and agent findings.</span></div>
          <div className="proof-step"><strong>0G Chain anchor</strong><span className="muted">Registry metadata, score summary, and report hash.</span></div>
        </div>
      </section>
    </div>
  );
}
