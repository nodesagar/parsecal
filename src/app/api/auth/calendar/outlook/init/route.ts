import { createClient } from "@/lib/supabase/server";
import { getOutlookAuthUrl } from "@/lib/calendar/outlook";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = getOutlookAuthUrl(user.id);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Outlook Auth Init Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
