import { createClient } from '@/lib/supabase/server';
import { getGoogleOAuthClient } from '@/lib/calendar/google';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // In our case, state = user.id
        const error = searchParams.get('error');

        // Target URL for redirection after processing
        const nextUrl = new URL('/settings', request.url);

        if (error) {
            console.error('Google Auth Error:', error);
            nextUrl.searchParams.set('error', 'Google authentication failed');
            return NextResponse.redirect(nextUrl);
        }

        if (!code || !state) {
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
        if (user.id !== state) {
            nextUrl.searchParams.set('error', 'User mismatch during authentication');
            return NextResponse.redirect(nextUrl);
        }

        // Exchange code for tokens
        const oauth2Client = getGoogleOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        if (!tokens.access_token) {
            throw new Error('No access token returned from Google');
        }

        // Typically, refresh token is only returned on the *first* consent. 
        // If we don't get one, and the user hasn't connected before, it's a problem. 
        // But let's assume we get one because we used prompt='consent'.

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

        // Upsert into connected_calendars
        // Note: For MVP we use raw tokens in the DB. In production, we'd encrypt these via pgcrypto or at app level.
        const { error: dbError } = await supabase
            .from('connected_calendars')
            .upsert({
                user_id: user.id,
                provider: 'google',
                access_token: tokens.access_token,
                // Only overwrite refresh_token if a new one is provided
                ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
                token_expires_at: expiresAt.toISOString(),
                calendar_id: calendarId,
                calendar_name: calendarName,
                is_active: true
            }, {
                onConflict: 'user_id,provider,calendar_id'
            });

        if (dbError) {
            console.error('Failed to save calendar connection:', dbError);
            throw dbError;
        }

        // Make Google the preferred provider if it's their first
        await supabase
            .from('profiles')
            .update({ preferred_calendar_provider: 'google' })
            .eq('id', user.id)
        // Can check if preferred_calendar_provider is 'manual' first if we want to be safe,
        // but setting it to google is a good default after connecting.

        nextUrl.searchParams.set('success', 'Google Calendar connected successfully!');
        return NextResponse.redirect(nextUrl);

    } catch (error) {
        console.error('Google callback error:', error);
        const nextUrl = new URL('/settings', request.url);
        nextUrl.searchParams.set('error', 'Failed to complete Calendar connection');
        return NextResponse.redirect(nextUrl);
    }
}
