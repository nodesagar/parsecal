import { createClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/calendar/google';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function sanitizeNextPath(value: string | null): string {
    if (!value || !value.startsWith('/')) return '/settings?tab=calendars';
    return value;
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const urlObj = new URL(request.url);
        const next = sanitizeNextPath(urlObj.searchParams.get('next'));
        const state = Buffer.from(
            JSON.stringify({ uid: user.id, next })
        ).toString('base64url');

        // Generate the Google OAuth URL targeting this user and return path
        const url = getGoogleAuthUrl(state);

        // Redirect the user to Google
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Google Auth Init Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
