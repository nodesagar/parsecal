import { createClient } from '@/lib/supabase/server';
import { getGoogleOAuthClient } from '@/lib/calendar/google';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type OAuthStatePayload = {
    uid: string;
    next: string;
};

function sanitizeNextPath(value: string | null | undefined): string {
    if (!value || !value.startsWith('/')) return '/settings?tab=calendars';
    return value;
}

function parseOAuthState(rawState: string | null): OAuthStatePayload | null {
    if (!rawState) return null;

    try {
        const decoded = Buffer.from(rawState, 'base64url').toString('utf8');
        const payload = JSON.parse(decoded) as { uid?: string; next?: string };
        if (!payload.uid) return null;
        return {
            uid: payload.uid,
            next: sanitizeNextPath(payload.next),
        };
    } catch {
        // Backward compatibility: old state was plain user ID.
        return {
            uid: rawState,
            next: '/settings?tab=calendars',
        };
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const parsedState = parseOAuthState(state);
        const redirectPath = parsedState?.next || '/settings?tab=calendars';

        // Target URL for redirection after processing
        const nextUrl = new URL(redirectPath, request.url);

        if (error) {
            console.error('Google Auth Error:', error);
            nextUrl.searchParams.set('error', 'Google authentication failed');
            return NextResponse.redirect(nextUrl);
        }

        if (!code || !parsedState?.uid) {
            nextUrl.searchParams.set('error', 'Missing auth parameters');
            return NextResponse.redirect(nextUrl);
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            nextUrl.searchParams.set('error', 'You must be logged in to connect a calendar');
            return NextResponse.redirect(nextUrl);
        }

        // Optional: Ensure the state matches the logged-in user to prevent CSRF spoofing
        if (user.id !== parsedState.uid) {
            nextUrl.searchParams.set('error', 'User mismatch during authentication');
            return NextResponse.redirect(nextUrl);
        }

        // Exchange code for tokens
        const oauth2Client = getGoogleOAuthClient(request.url);
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        if (!tokens.access_token) {
            throw new Error('No access token returned from Google');
        }

        // Determine expiration timestamp
        const expiresAt = new Date();
        if (tokens.expiry_date) {
            expiresAt.setTime(tokens.expiry_date);
        } else {
            // Default to 1 hour if not specified
            expiresAt.setHours(expiresAt.getHours() + 1);
        }

        // Fetch the user's primary calendar to get its real ID/email
        // (Just to verify the connection works and get an identifier)
        const calendarAPI = (await import('googleapis')).google.calendar({ version: 'v3', auth: oauth2Client });
        let calendarId = 'primary';
        let calendarName = 'Google Calendar';

        try {
            const calendarInfo = await calendarAPI.calendars.get({ calendarId: 'primary' });
            if (calendarInfo.data.id) calendarId = calendarInfo.data.id;
            if (calendarInfo.data.summary) calendarName = calendarInfo.data.summary;
        } catch (e) {
            console.warn('Could not fetch primary calendar info, defaulting to primary', e);
        }

        // Reuse existing refresh_token when Google does not return a new one.
        const { data: existingConnection } = await supabase
            .from('connected_calendars')
            .select('id, refresh_token')
            .eq('user_id', user.id)
            .eq('provider', 'google')
            .eq('calendar_id', calendarId)
            .maybeSingle();

        const refreshToken = tokens.refresh_token || existingConnection?.refresh_token;
        if (!refreshToken) {
            throw new Error('No refresh token returned from Google');
        }

        // Upsert into connected_calendars
        // Note: For MVP we use raw tokens in the DB. In production, we'd encrypt these via pgcrypto or at app level.
        const { data: savedConnection, error: dbError } = await supabase
            .from('connected_calendars')
            .upsert({
                user_id: user.id,
                provider: 'google',
                access_token: tokens.access_token,
                refresh_token: refreshToken,
                token_expires_at: expiresAt.toISOString(),
                calendar_id: calendarId,
                calendar_name: calendarName,
                is_active: true
            }, {
                onConflict: 'user_id,provider,calendar_id'
            })
            .select('id')
            .single();

        if (dbError || !savedConnection) {
            console.error('Failed to save calendar connection:', dbError);
            throw dbError || new Error('Failed to save calendar connection');
        }

        // Keep one active calendar per provider for deterministic push behavior.
        await supabase
            .from('connected_calendars')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('provider', 'google')
            .neq('id', savedConnection.id);

        // Make Google the preferred provider if it's their first
        const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ preferred_calendar_provider: 'google' })
            .eq('id', user.id);
        if (profileUpdateError) {
            console.error('Failed to update preferred calendar provider:', profileUpdateError);
        }

        nextUrl.searchParams.set('success', 'Google Calendar connected successfully!');
        return NextResponse.redirect(nextUrl);

    } catch (error) {
        console.error('Google callback error:', error);
        const nextUrl = new URL('/settings?tab=calendars', request.url);
        nextUrl.searchParams.set('error', 'Failed to complete Calendar connection');
        return NextResponse.redirect(nextUrl);
    }
}
