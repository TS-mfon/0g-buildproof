"use client";

import { useState } from "react";
import Link from "next/link";
import { submitProject, startAnalysis } from "../lib/apiClient";

export function SubmitProjectForm() {
  const [status, setStatus] = useState<{ message: string; projectId?: string }>({ message: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(formData: FormData) {
    setBusy(true);
    setStatus({ message: "Submitting project..." });
    const claimedModules = formData.getAll("claimedModules").map(String) as Array<"0G Storage" | "0G Compute" | "0G Chain" | "Agent ID" | "Privacy">;
    try {
      const { project } = await submitProject({
        projectName: String(formData.get("projectName")),
        description: String(formData.get("description")),
        ownerAddress: String(formData.get("ownerAddress")) as `0x${string}`,
        githubUrl: String(formData.get("githubUrl")),
        readmeUrl: String(formData.get("readmeUrl")),
        demoUrl: String(formData.get("demoUrl")),
        submittedContract: String(formData.get("submittedContract")) as `0x${string}`,
        explorerUrl: String(formData.get("explorerUrl")),
        targetNetwork: "0g-mainnet",
        claimedModules
      });
      setStatus({ message: "Starting BuildProof analysis...", projectId: project.id });
      await startAnalysis(project.id);
      setStatus({ message: "Analysis started. Open the live passport or Judge Mode when the report is ready.", projectId: project.id });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Submission failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={onSubmit} className="band grid">
      <p className="badge good">New passport</p>
      <h1 className="title">Verify a 0G project</h1>
      <p className="muted">The agent pipeline turns your repo, demo, storage proof, and mainnet chain activity into a judge-ready BuildProof Passport.</p>
      <div className="grid grid-2">
        <label className="field">Project name<input name="projectName" required /></label>
        <label className="field">Owner wallet<input name="ownerAddress" required placeholder="0x..." /></label>
      </div>
      <label className="field">Description<textarea name="description" required rows={3} /></label>
      <div className="grid grid-2">
        <label className="field">GitHub URL<input name="githubUrl" required type="url" /></label>
        <label className="field">README URL<input name="readmeUrl" type="url" /></label>
        <label className="field">Demo URL<input name="demoUrl" required type="url" /></label>
        <label className="field">0G contract address<input name="submittedContract" required placeholder="0x..." /></label>
        <label className="field">0G Explorer URL<input name="explorerUrl" required type="url" /></label>
        <div className="field readonly-field"><span>Target network</span><strong>0G Mainnet only</strong><small>No testnet submissions are accepted for this build.</small></div>
      </div>
      <fieldset className="band">
        <legend>Claimed 0G modules</legend>
        {["0G Storage", "0G Compute", "0G Chain", "Agent ID", "Privacy"].map((module) => (
          <label className="badge" key={module}>
            <input name="claimedModules" type="checkbox" value={module} defaultChecked={module !== "Privacy"} /> {module}
          </label>
        ))}
      </fieldset>
      <button className="button" type="submit" disabled={busy}>{busy ? "Generating..." : "Generate BuildProof Passport"}</button>
      {status.message && (
        <div className="status-card">
          <p>{status.message}</p>
          {status.projectId && (
            <div className="status-actions">
              <Link href={`/projects/${status.projectId}`}>Open passport</Link>
              <Link href={`/judge/${status.projectId}`}>Open Judge Mode</Link>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
