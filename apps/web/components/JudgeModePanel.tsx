import type { BuildProofReport } from "@buildproof/shared";

export function JudgeModePanel({ report }: { report: BuildProofReport }) {
  const checklist = [
    ["GitHub repository", report.githubUrl],
    ["Demo", report.demoUrl],
    ["0G contract", report.submittedContract],
    ["0G Explorer", report.explorerUrl],
    ["0G Storage root", report.evidence.storageRoot || "not verified"],
    ["0G Storage tx", report.evidence.storageTxHash ?? "not emitted"],
    ["Report hash", report.evidence.reportHash],
    ["Registry address", report.evidence.registryAddress ?? "not configured"],
    ["Registry transaction", report.evidence.registryTxHash ?? "not verified"]
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
              <td className="proof-value">{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatValue(value: string) {
  if (value.startsWith("http")) return <a href={value}>{value}</a>;
  if (value.startsWith("0x") && value.length > 42) return <span title={value}>{value}</span>;
  return value;
}
