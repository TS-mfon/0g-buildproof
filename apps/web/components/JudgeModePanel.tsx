import type { BuildProofReport } from "@buildproof/shared";

export function JudgeModePanel({ report }: { report: BuildProofReport }) {
  const checklist = [
    ["GitHub repository", report.githubUrl],
    ["Demo", report.demoUrl],
    ["0G contract", report.submittedContract],
    ["0G Explorer", report.explorerUrl],
    ["0G Storage root", report.evidence.storageRoot],
    ["Report hash", report.evidence.reportHash],
    ["Registry transaction", report.evidence.registryTxHash ?? "pending"]
  ];

  return (
    <section className="band">
      <p className="badge good">Judge Mode</p>
      <h1 className="title">{report.projectName}</h1>
      <p>{report.judgeSummary}</p>
      <table className="table">
        <tbody>
          {checklist.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
