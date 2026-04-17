const agents = [
  ["IntegrationVerifier", "Checks contract, Explorer, 0G module claims, and proof consistency."],
  ["RepoAuditor", "Reviews implementation depth, repo structure, tests, and placeholder risk."],
  ["DocsReviewer", "Checks README, architecture notes, local setup, and reproducibility."],
  ["DemoReviewer", "Checks whether the demo is public, clear, and shows real 0G usage."],
  ["SecurityReviewer", "Looks for obvious secret hygiene and deployment risks."],
  ["CommunityMentor", "Turns findings into builder tasks and ecosystem contribution ideas."],
  ["JudgeSummarizer", "Condenses the evidence into a judge-facing verdict."]
];

export default function AgentsPage() {
  return (
    <div className="grid">
      <section className="band">
        <h1 className="title">BuildProof Agents</h1>
        <p>Each agent produces evidence-bound JSON. No finding should appear without a linked source, file path, Explorer URL, storage root, or submitted field.</p>
      </section>
      <div className="grid grid-2">
        {agents.map(([name, description]) => (
          <article className="metric" key={name}>
            <h2>{name}</h2>
            <p className="muted">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
