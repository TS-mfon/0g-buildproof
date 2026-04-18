import { env } from "../env.js";

export type ComputeResult = {
  provider: "0g-compute" | "not-configured" | "failed";
  model?: string;
  text: string;
};

export async function runComputePrompt(system: string, prompt: string): Promise<ComputeResult> {
  if (env.OG_COMPUTE_ENDPOINT && env.OG_COMPUTE_KEY) {
    try {
      const response = await fetch(env.OG_COMPUTE_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OG_COMPUTE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OG_COMPUTE_MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt }
          ]
        })
      });
      if (!response.ok) throw new Error(`0G Compute request failed: ${response.status}`);
      const json = await response.json() as { choices?: Array<{ message?: { content?: string } }>; output?: string };
      return {
        provider: "0g-compute",
        model: env.OG_COMPUTE_MODEL,
        text: json.choices?.[0]?.message?.content ?? json.output ?? ""
      };
    } catch (error) {
      return {
        provider: "failed",
        model: env.OG_COMPUTE_MODEL,
        text: error instanceof Error ? error.message : String(error)
      };
    }
  }

  return { provider: "not-configured", text: "0G Compute is not configured for this deployment." };
}
