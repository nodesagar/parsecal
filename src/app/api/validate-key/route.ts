import { NextRequest, NextResponse } from "next/server";
import type { AIProviderName } from "@/types";

async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: "GET" }
    );
    if (res.ok) return { valid: true };
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || "Invalid API key";
    return { valid: false, error: msg };
  } catch {
    return { valid: false, error: "Network error while validating key" };
  }
}

async function validateOpenAIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) return { valid: true };
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || "Invalid API key";
    return { valid: false, error: msg };
  } catch {
    return { valid: false, error: "Network error while validating key" };
  }
}

async function validateClaudeKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Use the models endpoint — lightweight, no tokens consumed
    const res = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    if (res.ok) return { valid: true };
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || "Invalid API key";
    return { valid: false, error: msg };
  } catch {
    return { valid: false, error: "Network error while validating key" };
  }
}

async function validateMinimaxKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.minimaxi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 1,
      }),
    });
    if (res.ok) return { valid: true };
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || "Invalid API key";
    return { valid: false, error: msg };
  } catch {
    return { valid: false, error: "Network error while validating key" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json() as {
      provider: AIProviderName;
      apiKey: string;
    };

    if (!provider || !apiKey) {
      return NextResponse.json(
        { valid: false, error: "Missing provider or apiKey" },
        { status: 400 }
      );
    }

    if (apiKey.trim().length < 10) {
      return NextResponse.json({ valid: false, error: "Key is too short" });
    }

    let result: { valid: boolean; error?: string };

    switch (provider) {
      case "gemini":
        result = await validateGeminiKey(apiKey.trim());
        break;
      case "openai":
        result = await validateOpenAIKey(apiKey.trim());
        break;
      case "claude":
        result = await validateClaudeKey(apiKey.trim());
        break;
      case "minimax":
        result = await validateMinimaxKey(apiKey.trim());
        break;
      default:
        return NextResponse.json(
          { valid: false, error: "Unknown provider" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
