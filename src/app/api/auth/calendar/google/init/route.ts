import { createClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/calendar/google';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate the Google OAuth URL targeting this user ID
        const url = getGoogleAuthUrl(user.id);

        // Redirect the user to Google
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Google Auth Init Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
