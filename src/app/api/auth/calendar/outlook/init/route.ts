import { createClient } from "@/lib/supabase/server";
import { getOutlookAuthUrl } from "@/lib/calendar/outlook";
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

    const state = createCalendarOAuthState(user.id, searchParams.get("next"));
    const url = getOutlookAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Outlook Auth Init Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
