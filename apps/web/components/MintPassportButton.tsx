"use client";

import { useState } from "react";
import { mintPassport } from "../lib/apiClient";

export function MintPassportButton({ projectId, minted }: { projectId: string; minted: boolean }) {
  const [state, setState] = useState({ busy: false, message: minted ? "Minted" : "" });

  async function onMint() {
    setState({ busy: true, message: "Minting passport on 0G Chain..." });
    try {
      await mintPassport(projectId);
      setState({ busy: false, message: "Passport minted. Refresh to view the updated proof." });
    } catch (error) {
      setState({ busy: false, message: error instanceof Error ? error.message : "Mint failed." });
    }
  }

  return (
    <div className="status-card">
      <button className="button" type="button" onClick={onMint} disabled={state.busy || minted}>
        {state.busy ? "Minting..." : minted ? "Passport minted" : "Mint passport"}
      </button>
      {state.message && <p className="muted">{state.message}</p>}
    </div>
  );
}
