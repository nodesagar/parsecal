import { createClient } from '@/lib/supabase/server';
import { getGoogleOAuthClient, convertToGoogleEvent } from '@/lib/calendar/google';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, provider } = body;

        if (!sessionId || !provider) {
            return NextResponse.json({ error: 'Missing sessionId or provider' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user profile for timezone
        const { data: profile } = await supabase
            .from('profiles')
            .select('default_timezone')
            .eq('id', user.id)
            .single();

        const userTimezone = profile?.default_timezone || 'UTC';

        // 1. Get the calendar connection
        const { data: connection, error: connectionError } = await supabase
            .from('connected_calendars')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .eq('is_active', true)
            .single();

        if (connectionError || !connection) {
            return NextResponse.json({ error: `No active ${provider} calendar connection found.` }, { status: 400 });
        }

        // 2. Fetch selected, un-pushed events for this session
        const { data: events, error: eventsError } = await supabase
            .from('parsed_events')
            .select('*')
            .eq('session_id', sessionId)
            .eq('is_selected', true)
            .is('pushed_at', null);

        if (eventsError || !events || events.length === 0) {
            return NextResponse.json({ error: 'No valid events to push.' }, { status: 400 });
        }

        const results = {
            successful: 0,
            failed: 0,
            errors: [] as string[]
        };

        if (provider === 'google') {
            const oauth2Client = getGoogleOAuthClient();
            oauth2Client.setCredentials({
                access_token: connection.access_token,
                refresh_token: connection.refresh_token,
                expiry_date: new Date(connection.token_expires_at).getTime(),
            });

            // Handle automatic token refresh if needed
            oauth2Client.on('tokens', async (tokens) => {
                if (tokens.refresh_token || tokens.access_token) {
                    const expiresAt = new Date();
                    if (tokens.expiry_date) {
                        expiresAt.setTime(tokens.expiry_date);
                    } else {
                        expiresAt.setHours(expiresAt.getHours() + 1);
                    }

                    await supabase
                        .from('connected_calendars')
                        .update({
                            access_token: tokens.access_token || connection.access_token,
                            ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
                            token_expires_at: expiresAt.toISOString(),
                        })
                        .eq('id', connection.id);
                }
            });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            for (const event of events) {
                try {
                    const gEvent = convertToGoogleEvent(event, userTimezone);
                    const res = await calendar.events.insert({
                        calendarId: connection.calendar_id,
                        requestBody: gEvent,
                    });

                    // Mark as pushed in DB
                    await supabase
                        .from('parsed_events')
                        .update({
                            pushed_to_provider: 'google',
                            external_event_id: res.data.id,
                            pushed_at: new Date().toISOString(),
                        })
                        .eq('id', event.id);

                    results.successful++;
                } catch (e: unknown) {
                    console.error(`Failed to push event ${event.id}:`, e);
                    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                    results.failed++;
                    results.errors.push(`Failed to push "${event.title}": ${errorMessage}`);
                }
            }
        } else {
            return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
        }

        // Update session status based on results
        let sessionStatus = 'pushed';
        if (results.failed > 0 && results.successful > 0) sessionStatus = 'partially_pushed';
        if (results.successful === 0) sessionStatus = 'draft'; // Failed all

        await supabase
            .from('parse_sessions')
            .update({ status: sessionStatus })
            .eq('id', sessionId);

        return NextResponse.json(results);

    } catch (error) {
        console.error('Calendar push error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
