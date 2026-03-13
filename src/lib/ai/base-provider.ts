import type { ParseInput, ParsedEventFromAI } from "@/types";
import { ParseResponseSchema } from "@/types";
import { buildPrompt } from "./prompt";

export abstract class BaseAIProvider {
  protected apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  abstract callModel(prompt: string, input: ParseInput): Promise<string>;

  async parse(input: ParseInput): Promise<ParsedEventFromAI[]> {
    const prompt = buildPrompt(input.timezone);
    const fullPrompt =
      input.type === "text" ? `${prompt}\n${input.content}` : prompt;

    const rawResponse = await this.callModel(fullPrompt, input);

    // Clean the response — strip markdown code blocks if present
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    // Parse and validate
    const parsed = JSON.parse(cleaned);
    const validated = ParseResponseSchema.parse(parsed);
    return validated.events;
  }
}
