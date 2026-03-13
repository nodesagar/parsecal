import type { AIProviderName } from "@/types";
import { BaseAIProvider } from "./base-provider";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";
import { ClaudeProvider } from "./claude";

const DEFAULT_KEYS: Record<AIProviderName, string | undefined> = {
  gemini: process.env.GEMINI_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  claude: process.env.ANTHROPIC_API_KEY,
};

// Only Gemini has a free tier — never auto-fallback to paid providers
const FREE_FALLBACK_ORDER: AIProviderName[] = ["gemini"];

export function getProvider(
  name: AIProviderName,
  customKey?: string | null,
): BaseAIProvider {
  const apiKey = customKey || DEFAULT_KEYS[name];
  if (!apiKey) {
    throw new Error(`No API key available for provider: ${name}`);
  }

  switch (name) {
    case "gemini":
      return new GeminiProvider(apiKey);
    case "openai":
      return new OpenAIProvider(apiKey);
    case "claude":
      return new ClaudeProvider(apiKey);
    default:
      throw new Error(`Unknown AI provider: ${name}`);
  }
}

/**
 * Returns providers to try in order.
 * - If user provides their own API key: only use their chosen provider (no fallback).
 * - If using app-default keys: only Gemini (free tier). Never fall back to OpenAI/Claude
 *   with app keys, as those cost money.
 */
export function getFallbackProviders(
  primary: AIProviderName,
  customKey?: string | null,
): BaseAIProvider[] {
  const providers: BaseAIProvider[] = [];

  if (customKey) {
    // User has their own key — use their chosen provider only
    try {
      providers.push(getProvider(primary, customKey));
    } catch {
      // Invalid key or provider
    }
    return providers;
  }

  // No custom key — only use free providers (Gemini) with app default keys
  // If user selected a paid provider but has no custom key, fall back to Gemini
  if (primary === "gemini" && DEFAULT_KEYS.gemini) {
    try {
      providers.push(getProvider("gemini"));
    } catch {
      // No Gemini key
    }
  } else {
    // User picked openai/claude but has no key — use Gemini instead
    for (const name of FREE_FALLBACK_ORDER) {
      if (DEFAULT_KEYS[name]) {
        try {
          providers.push(getProvider(name));
        } catch {
          // Skip
        }
      }
    }
  }

  return providers;
}
