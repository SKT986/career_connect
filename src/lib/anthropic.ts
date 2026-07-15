import { anthropic } from "@ai-sdk/anthropic";

// Defaults to Claude Opus 4.8. Override with ANTHROPIC_MODEL, e.g.
// "claude-sonnet-5" (near-Opus quality at lower cost) or "claude-haiku-4-5"
// (fastest/cheapest) if Opus-tier latency/cost isn't the right fit here.
export function getChatModel() {
  return anthropic(process.env.ANTHROPIC_MODEL || "claude-opus-4-8");
}
