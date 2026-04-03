import { calendar_v3, google } from 'googleapis';
import type { ParsedEventFromAI } from '@/types';

/**
 * Get an initialized Google OAuth2 client
 */
export function getGoogleOAuthClient() {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        (process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/google/callback`
            : undefined);

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing Google OAuth environment variables');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate the authorization URL for user consent
 */
export function getGoogleAuthUrl(stateValue: string) {
    const oauth2Client = getGoogleOAuthClient();

    // Define the scopes we need
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events', // Read & write to calendars
        'https://www.googleapis.com/auth/calendar.readonly' // Read calendar list to show user
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Get a refresh token
        prompt: 'consent', // Force consent so we always get a refresh token
        scope: scopes,
        state: stateValue,
    });
}

export function extractIsoDate(dateValue: string): string {
    const match = dateValue.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Invalid date value: ${dateValue}`);
    }

    return parsed.toISOString().split('T')[0];
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
    const date = new Date(`${isoDate}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid ISO date: ${isoDate}`);
    }
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Convert our ParsedEvent format to Google Calendar Event format.
 * @param event  The parsed event data
 * @param userTimezone  IANA timezone (e.g. "Asia/Kolkata") — required for recurring events
 */
export function convertToGoogleEvent(
    event: ParsedEventFromAI,
    userTimezone?: string
): calendar_v3.Schema$Event {
    const tz = userTimezone || 'UTC';
    const gEvent: calendar_v3.Schema$Event = {
        summary: event.title,
        description: event.description || '',
    };

    if (event.location) {
        gEvent.location = event.location;
    }

    if (event.is_all_day) {
        const startDate = extractIsoDate(event.start_datetime);
        const endDate = addDaysToIsoDate(
            event.end_datetime ? extractIsoDate(event.end_datetime) : startDate,
            1
        );

        gEvent.start = { date: startDate, timeZone: tz };
        // End date in Google for all day is exclusive
        gEvent.end = { date: endDate, timeZone: tz };
    } else {
        const startDt = new Date(event.start_datetime).toISOString();
        // If no end time, default to 1 hour after start
        let endDt: string;
        if (event.end_datetime) {
            endDt = new Date(event.end_datetime).toISOString();
        } else {
            const fallbackEnd = new Date(new Date(event.start_datetime).getTime() + 60 * 60 * 1000);
            endDt = fallbackEnd.toISOString();
        }

        gEvent.start = { dateTime: startDt, timeZone: tz };
        gEvent.end = { dateTime: endDt, timeZone: tz };
    }

    // Recurrence rule — Google requires timeZone on start/end (handled above)
    if (event.is_recurring && event.recurrence_rule) {
        // Ensure the RRULE doesn't already have the prefix
        const rule = event.recurrence_rule.startsWith('RRULE:')
            ? event.recurrence_rule
            : `RRULE:${event.recurrence_rule}`;
        gEvent.recurrence = [rule];
    }

    return gEvent;
}
