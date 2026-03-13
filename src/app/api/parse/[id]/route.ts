import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the session belongs to the user
    const { data: session } = await supabase
      .from("parse_sessions")
      .select("id, user_id, input_file_path")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete uploaded file from storage if exists
    if (session.input_file_path) {
      await supabase.storage.from("uploads").remove([session.input_file_path]);
    }

    // Delete parsed events (cascade should handle this, but be explicit)
    await supabase.from("parsed_events").delete().eq("session_id", sessionId);

    // Delete the session
    const { error } = await supabase
      .from("parse_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Delete session error:", error);
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
