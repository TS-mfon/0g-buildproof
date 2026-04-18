import Link from "next/link";
import { listProjects } from "../lib/apiClient";

export default async function HomePage() {
  const projects = await listProjects();
  const complete = projects.filter((project) => project.status === "complete").length;
  const latest = projects[0];

  return (
    <div className="grid">
      <section className="landing-hero">
        <img
          alt="Dense compute racks powering autonomous infrastructure"
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
        />
        <div className="hero-overlay">
          <p className="badge good">0G APAC Hackathon build</p>
          <h1 className="title">Excellence passports for serious 0G builders.</h1>
          <p>
            BuildProof turns submissions into judge-ready evidence: repo inspection, agent review,
            0G Storage roots, 0G Chain anchors, and a public leaderboard the ecosystem can trust.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/submit">Submit a project</Link>
            <Link className="button secondary" href={latest ? `/judge/${latest.id}` : "/projects"}>Open Judge Mode</Link>
          </div>
        </div>
      </section>

      <div className="grid grid-3">
        <div className="metric"><span className="muted">Live submissions</span><strong>{projects.length}</strong><p>Real API records only.</p></div>
        <div className="metric"><span className="muted">Completed passports</span><strong>{complete}</strong><p>Published after analysis.</p></div>
        <div className="metric"><span className="muted">Network policy</span><strong>Mainnet</strong><p>0G mainnet proof only.</p></div>
      </div>

      <section className="band intro-band">
        <p className="badge good">Vision</p>
        <h2 className="section-title">A public quality layer for the 0G ecosystem</h2>
        <p>
          Hackathons reward speed, but ecosystems need proof. BuildProof gives judges, mentors,
          grant reviewers, and contributors a shared surface for verifying which projects actually
          integrated 0G, documented their work, shipped a demo, and created value for future builders.
        </p>
      </section>

      <section className="band">
        <h2 className="section-title">Walkthrough</h2>
        <div className="grid grid-4 timeline">
          <div className="proof-step"><strong>Submit</strong><span className="muted">Add repo, demo, owner wallet, 0G contract, and Explorer link.</span></div>
          <div className="proof-step"><strong>Agents</strong><span className="muted">Reviewers inspect integration, docs, demo quality, security, and community value.</span></div>
          <div className="proof-step"><strong>Leaderboard</strong><span className="muted">Completed projects surface with real status and proof navigation.</span></div>
          <div className="proof-step"><strong>Judge Mode</strong><span className="muted">Every required proof item is condensed into one review page.</span></div>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="band">
          <h2 className="section-title">What gets verified</h2>
          <p className="muted">0G Storage and 0G Chain are marked verified only after the backend receives a real result. 0G Compute is marked verified only when a configured Compute endpoint completes the review.</p>
        </div>
        <div className="band">
          <h2 className="section-title">Start here</h2>
          <p className="muted">Submit a project, wait for analysis, then open its Passport and Judge Mode links from the leaderboard.</p>
          <Link className="button" href="/submit">Generate a passport</Link>
        </div>
      </section>
    </div>
  );
}
