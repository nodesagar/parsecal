import { createClient } from "@/lib/supabase/server";
import { GeminiProvider } from "@/lib/ai/gemini";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const errors: string[] = [];

  // 1. Check Supabase connection
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) errors.push(`Auth error: ${authError.message}`);
    if (!user) errors.push("No authenticated user");
    else errors.push(`✅ Auth OK: ${user.email}`);

    // 2. Check profile exists
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileError) errors.push(`Profile error: ${profileError.message}`);
      if (!profile) errors.push("No profile found");
      else errors.push(`✅ Profile OK: ${profile.display_name}`);
    }

    // 3. Test session insert
    if (user) {
      const { data: session, error: sessionError } = await supabase
        .from("parse_sessions")
        .insert({
          user_id: user.id,
          input_type: "text",
          raw_text_input: "debug test",
          ai_provider_used: "gemini",
          status: "processing",
        })
        .select()
        .single();

      if (sessionError)
        errors.push(
          `Session insert error: ${sessionError.message} (code: ${sessionError.code})`,
        );
      else {
        errors.push(`✅ Session insert OK: ${session.id}`);
        // Clean up
        await supabase.from("parse_sessions").delete().eq("id", session.id);
      }
    }
  } catch (e) {
    errors.push(`Supabase exception: ${(e as Error).message}`);
  }

  // 4. Check Gemini API key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === "your_gemini_key") {
    errors.push("❌ No Gemini API key");
  } else {
    errors.push(`✅ Gemini key present: ${geminiKey.slice(0, 10)}...`);

    // 5. Test Gemini call
    try {
      const provider = new GeminiProvider(geminiKey);
      const result = await provider.callModel(
        'Return exactly this JSON: {"events": []}. No other text.',
        { type: "text", content: "", timezone: "UTC" },
      );
      errors.push(`✅ Gemini response: ${result.slice(0, 100)}`);
    } catch (e) {
      errors.push(`❌ Gemini error: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({ checks: errors }, { status: 200 });
}
