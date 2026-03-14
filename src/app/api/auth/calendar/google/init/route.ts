import { createClient } from "@/lib/supabase/server";
import { getGoogleAuthUrl } from "@/lib/calendar/google";
import { createCalendarOAuthState } from "@/lib/calendar/oauth-state";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate an OAuth state payload with user identity + optional return path.
    const state = createCalendarOAuthState(user.id, searchParams.get("next"));
    const url = getGoogleAuthUrl(state);

    // Redirect the user to Google
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google Auth Init Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
