import { createClient } from '@/lib/supabase/server';
import { getGoogleOAuthClient } from '@/lib/calendar/google';
import { refreshOutlookAccessToken } from '@/lib/calendar/outlook';
import { GOOGLE_CALENDAR_INTEGRATION_ENABLED } from '@/lib/features';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const MICROSOFT_GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

export type CalendarEvent = {
    id: string;
    title: string;
    start: string;      // ISO string
    end: string;         // ISO string
    isAllDay: boolean;
    location?: string;
    provider: 'google' | 'outlook';
};

/**
 * GET /api/calendar/events?provider=google|outlook&month=2026-04
 * Fetches real events from the user's connected calendar.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const provider = searchParams.get('provider');
        const monthParam = searchParams.get('month'); // e.g. "2026-04"

        if (!provider || (provider !== 'google' && provider !== 'outlook')) {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
        }

        if (provider === 'google' && !GOOGLE_CALENDAR_INTEGRATION_ENABLED) {
            return NextResponse.json({ error: 'Google Calendar integration is disabled' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get connection
        const { data: connections } = await supabase
            .from('connected_calendars')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1);

        const connection = connections?.[0];
        if (!connection) {
            return NextResponse.json({ error: `No active ${provider} connection found` }, { status: 404 });
        }

        // Calculate time range
        let startDate: Date;
        let endDate: Date;
        if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
            const [year, month] = monthParam.split('-').map(Number);
            startDate = new Date(Date.UTC(year, month - 1, 1));
            endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        } else {
            const now = new Date();
            startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));
        }

        let events: CalendarEvent[] = [];

        if (provider === 'google') {
            events = await fetchGoogleEvents(connection, startDate, endDate, request.url, supabase);
        } else {
            events = await fetchOutlookEvents(connection, startDate, endDate, supabase);
        }

        return NextResponse.json({ events, provider });
    } catch (error) {
        console.error('Calendar events fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchGoogleEvents(connection: any, startDate: Date, endDate: Date, requestUrl: string, supabase: any): Promise<CalendarEvent[]> {
    const oauth2Client = getGoogleOAuthClient(requestUrl);
    oauth2Client.setCredentials({
        access_token: connection.access_token,
        refresh_token: connection.refresh_token,
        expiry_date: new Date(connection.token_expires_at).getTime(),
    });

    // Auto-persist refreshed tokens
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            const expiresAt = new Date();
            if (tokens.expiry_date) expiresAt.setTime(tokens.expiry_date);
            else expiresAt.setHours(expiresAt.getHours() + 1);

            await supabase
                .from('connected_calendars')
                .update({
                    access_token: tokens.access_token,
                    ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
                    token_expires_at: expiresAt.toISOString(),
                })
                .eq('id', connection.id);
        }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const res = await calendar.events.list({
        calendarId: connection.calendar_id || 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
    });

    const items = res.data.items || [];

    return items.map(item => ({
        id: item.id || crypto.randomUUID(),
        title: item.summary || '(No title)',
        start: item.start?.dateTime || item.start?.date || startDate.toISOString(),
        end: item.end?.dateTime || item.end?.date || startDate.toISOString(),
        isAllDay: Boolean(item.start?.date),
        location: item.location || undefined,
        provider: 'google' as const,
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchOutlookEvents(connection: any, startDate: Date, endDate: Date, supabase: any): Promise<CalendarEvent[]> {
    let accessToken = connection.access_token;

    // Refresh if expired
    const needsRefresh = new Date(connection.token_expires_at).getTime() <= Date.now() + 60_000;
    if (needsRefresh) {
        try {
            const refreshed = await refreshOutlookAccessToken(connection.refresh_token);
            accessToken = refreshed.access_token;

            const expiresAt = new Date(Date.now() + (refreshed.expires_in || 3600) * 1000);
            await supabase
                .from('connected_calendars')
                .update({
                    access_token: accessToken,
                    refresh_token: refreshed.refresh_token || connection.refresh_token,
                    token_expires_at: expiresAt.toISOString(),
                })
                .eq('id', connection.id);
        } catch (err) {
            console.error('Failed to refresh Outlook token:', err);
            throw new Error('Outlook token expired. Please reconnect.');
        }
    }

    const params = new URLSearchParams({
        startdatetime: startDate.toISOString(),
        enddatetime: endDate.toISOString(),
        $orderby: 'start/dateTime asc',
        $top: '250',
        $select: 'id,subject,start,end,isAllDay,location',
    });

    const calendarId = connection.calendar_id;
    const path = calendarId === 'primary'
        ? `/me/calendar/calendarView?${params.toString()}`
        : `/me/calendars/${encodeURIComponent(calendarId)}/calendarView?${params.toString()}`;

    const res = await fetch(`${MICROSOFT_GRAPH_BASE_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Prefer: 'outlook.timezone="UTC"',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `Outlook API error: ${res.status}`);
    }

    const data = await res.json();
    const items = data.value || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        title: item.subject || '(No title)',
        start: item.start?.dateTime ? `${item.start.dateTime}Z` : startDate.toISOString(),
        end: item.end?.dateTime ? `${item.end.dateTime}Z` : startDate.toISOString(),
        isAllDay: Boolean(item.isAllDay),
        location: item.location?.displayName || undefined,
        provider: 'outlook' as const,
    }));
}
