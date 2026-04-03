import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';

function isIgnorableStorageDeleteError(message: string | undefined): boolean {
    if (!message) return false;
    return /not found/i.test(message);
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the session belongs to the user
        const { data: session, error: sessionError } = await supabase
            .from('parse_sessions')
            .select('id, user_id, input_file_path')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (sessionError) {
            console.error('Session lookup error:', sessionError);
        }

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Delete uploaded file from storage if exists
        if (session.input_file_path) {
            const adminClient = createAdminClient();
            const storageClient = adminClient ?? supabase;
            const { error: storageDeleteError } = await storageClient.storage
                .from(UPLOADS_BUCKET)
                .remove([session.input_file_path]);

            if (storageDeleteError && !isIgnorableStorageDeleteError(storageDeleteError.message)) {
                console.error('Storage delete error:', storageDeleteError);
                return NextResponse.json({ error: 'Failed to delete uploaded file' }, { status: 500 });
            }
        }

        // Delete parsed events (cascade should handle this, but be explicit)
        const { error: eventsDeleteError } = await supabase
            .from('parsed_events')
            .delete()
            .eq('session_id', sessionId);

        if (eventsDeleteError) {
            console.error('Parsed events delete error:', eventsDeleteError);
            return NextResponse.json({ error: 'Failed to delete session events' }, { status: 500 });
        }

        // Delete the session
        const { error } = await supabase
            .from('parse_sessions')
            .delete()
            .eq('id', sessionId);

        if (error) {
            console.error('Delete session error:', error);
            return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
