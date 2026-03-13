import { createClient } from "@/lib/supabase/server";
import {
  exchangeOutlookCodeForTokens,
  getOutlookPrimaryCalendar,
} from "@/lib/calendar/outlook";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const nextUrl = new URL("/settings", request.url);

    if (error) {
      console.error("Outlook Auth Error:", error);
      nextUrl.searchParams.set("error", "Outlook authentication failed");
      return NextResponse.redirect(nextUrl);
    }

    if (!code || !state) {
      nextUrl.searchParams.set("error", "Missing auth parameters");
      return NextResponse.redirect(nextUrl);
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      nextUrl.searchParams.set(
        "error",
        "You must be logged in to connect a calendar",
      );
      return NextResponse.redirect(nextUrl);
    }

    if (user.id !== state) {
      nextUrl.searchParams.set("error", "User mismatch during authentication");
      return NextResponse.redirect(nextUrl);
    }

    const tokens = await exchangeOutlookCodeForTokens(code);
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    let calendarId = "primary";
    let calendarName = "Outlook Calendar";

    try {
      const calendar = await getOutlookPrimaryCalendar(tokens.access_token);
      calendarId = calendar.calendarId;
      calendarName = calendar.calendarName;
    } catch (calendarError) {
      console.warn(
        "Could not fetch Outlook primary calendar info, defaulting to primary:",
        calendarError,
      );
    }

    let refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      const { data: existingCalendar } = await supabase
        .from("connected_calendars")
        .select("refresh_token")
        .eq("user_id", user.id)
        .eq("provider", "outlook")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      refreshToken = existingCalendar?.refresh_token || undefined;
    }

    if (!refreshToken) {
      throw new Error(
        "No refresh token returned from Microsoft. Please reconnect with consent.",
      );
    }

    const { error: dbError } = await supabase
      .from("connected_calendars")
      .upsert(
        {
          user_id: user.id,
          provider: "outlook",
          access_token: tokens.access_token,
          refresh_token: refreshToken,
          token_expires_at: expiresAt.toISOString(),
          calendar_id: calendarId,
          calendar_name: calendarName,
          is_active: true,
        },
        {
          onConflict: "user_id,provider,calendar_id",
        },
      );

    if (dbError) {
      console.error("Failed to save Outlook calendar connection:", dbError);
      throw dbError;
    }

    await supabase
      .from("profiles")
      .update({ preferred_calendar_provider: "outlook" })
      .eq("id", user.id);

    nextUrl.searchParams.set(
      "success",
      "Outlook Calendar connected successfully!",
    );
    return NextResponse.redirect(nextUrl);
  } catch (error) {
    console.error("Outlook callback error:", error);
    const nextUrl = new URL("/settings", request.url);
    nextUrl.searchParams.set(
      "error",
      "Failed to complete Outlook Calendar connection",
    );
    return NextResponse.redirect(nextUrl);
  }
}
