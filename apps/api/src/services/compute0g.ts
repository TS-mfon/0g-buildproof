import { env } from "../env.js";

export type ComputeResult = {
  provider: "0g-compute" | "development-fallback";
  model?: string;
  text: string;
};

export async function runComputePrompt(system: string, prompt: string): Promise<ComputeResult> {
  if (env.OG_COMPUTE_ENDPOINT && env.OG_COMPUTE_KEY) {
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
  }

  return {
    provider: "development-fallback",
    model: "deterministic-local-reviewer",
    text: `Fallback review generated because OG_COMPUTE_ENDPOINT/OG_COMPUTE_KEY are not configured.\n\n${prompt.slice(0, 1200)}`
  };
}
