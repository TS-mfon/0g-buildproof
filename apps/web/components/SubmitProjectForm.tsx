"use client";

import { useState } from "react";
import { submitProject, startAnalysis } from "../lib/apiClient";

export function SubmitProjectForm() {
  const [status, setStatus] = useState<string>("");

  async function onSubmit(formData: FormData) {
    setStatus("Submitting project...");
    const claimedModules = formData.getAll("claimedModules").map(String) as Array<"0G Storage" | "0G Compute" | "0G Chain" | "Agent ID" | "Privacy">;
    const { project } = await submitProject({
      projectName: String(formData.get("projectName")),
      description: String(formData.get("description")),
      ownerAddress: String(formData.get("ownerAddress")) as `0x${string}`,
      githubUrl: String(formData.get("githubUrl")),
      readmeUrl: String(formData.get("readmeUrl")),
      demoUrl: String(formData.get("demoUrl")),
      submittedContract: String(formData.get("submittedContract")) as `0x${string}`,
      explorerUrl: String(formData.get("explorerUrl")),
      targetNetwork: String(formData.get("targetNetwork")) as "0g-mainnet" | "0g-testnet",
      claimedModules
    });
    setStatus("Starting BuildProof analysis...");
    await startAnalysis(project.id);
    setStatus(`Analysis queued. Open /projects/${project.id} after the worker completes.`);
  }

  return (
    <form action={onSubmit} className="band grid">
      <p className="badge good">New passport</p>
      <h1 className="title">Verify a 0G project</h1>
      <p className="muted">The agent pipeline turns your repo, demo, storage proof, and chain activity into a judge-ready BuildProof Passport.</p>
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
        <label className="field">Target network
          <select name="targetNetwork" defaultValue="0g-mainnet">
            <option value="0g-mainnet">0G Mainnet</option>
            <option value="0g-testnet">0G Testnet</option>
          </select>
        </label>
      </div>
      <fieldset className="band">
        <legend>Claimed 0G modules</legend>
        {["0G Storage", "0G Compute", "0G Chain", "Agent ID", "Privacy"].map((module) => (
          <label className="badge" key={module}>
            <input name="claimedModules" type="checkbox" value={module} defaultChecked={module !== "Privacy"} /> {module}
          </label>
        ))}
      </fieldset>
      <button className="button" type="submit">Generate BuildProof Passport</button>
      {status && <p className="muted">{status}</p>}
    </form>
  );
}
