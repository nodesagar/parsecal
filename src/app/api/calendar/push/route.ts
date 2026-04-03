import { createClient } from '@/lib/supabase/server';
import { getGoogleOAuthClient, convertToGoogleEvent } from '@/lib/calendar/google';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const maxDuration = 60;
type PushProvider = 'google';

function isSupportedProvider(value: string): value is PushProvider {
    return value === 'google';
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
        const provider = typeof body?.provider === 'string' ? body.provider : '';

        if (!sessionId || !provider) {
            return NextResponse.json({ error: 'Missing sessionId or provider' }, { status: 400 });
        }

        if (!isSupportedProvider(provider)) {
            return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure the session belongs to the current user.
        const { data: session } = await supabase
            .from('parse_sessions')
            .select('id')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Fetch user profile for timezone
        const { data: profile } = await supabase
            .from('profiles')
            .select('default_timezone')
            .eq('id', user.id)
            .single();

        const userTimezone = profile?.default_timezone || 'UTC';

        // 1. Get the calendar connection
        const { data: connections, error: connectionError } = await supabase
            .from('connected_calendars')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1);

        const connection = connections?.[0];

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

                const { error: tokenUpdateError } = await supabase
                    .from('connected_calendars')
                    .update({
                        access_token: tokens.access_token || connection.access_token,
                        ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
                        token_expires_at: expiresAt.toISOString(),
                    })
                    .eq('id', connection.id);

                if (tokenUpdateError) {
                    console.error('Failed to persist refreshed calendar token:', tokenUpdateError);
                }
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

                const { error: markPushedError } = await supabase
                    .from('parsed_events')
                    .update({
                        pushed_to_provider: 'google',
                        external_event_id: res.data.id,
                        pushed_at: new Date().toISOString(),
                    })
                    .eq('id', event.id);

                if (markPushedError) {
                    console.error(`Failed to mark event ${event.id} as pushed:`, markPushedError);
                    results.failed++;
                    results.errors.push(`Pushed "${event.title}" but failed to update local status.`);
                    continue;
                }

                results.successful++;
            } catch (e: unknown) {
                console.error(`Failed to push event ${event.id}:`, e);
                const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                results.failed++;
                results.errors.push(`Failed to push "${event.title}": ${errorMessage}`);
            }
        }

        // Update session status based on results
        let sessionStatus = 'pushed';
        if (results.failed > 0 && results.successful > 0) sessionStatus = 'partially_pushed';
        if (results.successful === 0) sessionStatus = 'draft'; // Failed all

        const { error: sessionUpdateError } = await supabase
            .from('parse_sessions')
            .update({ status: sessionStatus })
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (sessionUpdateError) {
            console.error('Failed to update session push status:', sessionUpdateError);
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error('Calendar push error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
