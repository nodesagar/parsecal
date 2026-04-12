import { calendar_v3, google } from 'googleapis';
import type { ParsedEventFromAI } from '@/types';

function trimTrailingSlash(value: string) {
    return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveGoogleRedirectUri(requestUrl?: string) {
    // Prefer calendar-specific redirect URI, fall back to generic
    const explicitRedirectUri = (
        process.env.GOOGLE_CALENDAR_REDIRECT_URI?.trim() ||
        process.env.GOOGLE_REDIRECT_URI?.trim()
    );
    if (explicitRedirectUri) {
        return explicitRedirectUri;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (appUrl) {
        return `${trimTrailingSlash(appUrl)}/api/auth/calendar/google/callback`;
    }

    if (requestUrl) {
        const origin = new URL(requestUrl).origin;
        return `${origin}/api/auth/calendar/google/callback`;
    }

    return undefined;
}

/**
 * Get an initialized Google OAuth2 client
 */
export function getGoogleOAuthClient(requestUrl?: string) {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = resolveGoogleRedirectUri(requestUrl);

    if (!clientId || !clientSecret || !redirectUri) {
        const missingVars: string[] = [];
        if (!clientId) {
            missingVars.push('GOOGLE_CLIENT_ID (or GOOGLE_CALENDAR_CLIENT_ID)');
        }
        if (!clientSecret) {
            missingVars.push('GOOGLE_CLIENT_SECRET (or GOOGLE_CALENDAR_CLIENT_SECRET)');
        }
        if (!redirectUri) {
            missingVars.push('GOOGLE_REDIRECT_URI or NEXT_PUBLIC_APP_URL');
        }
        throw new Error(`Missing Google OAuth configuration: ${missingVars.join(', ')}`);
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate the authorization URL for user consent
 */
export function getGoogleAuthUrl(stateValue: string, requestUrl?: string) {
    const oauth2Client = getGoogleOAuthClient(requestUrl);

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

export function extractLocalIsoDate(dateValue: string, timezone: string = 'UTC'): string {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date value: ${dateValue}`);
    }

    // Use Intl.DateTimeFormat to get the date in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    
    return formatter.format(date);
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
        const startDate = extractLocalIsoDate(event.start_datetime, tz);
        const endDate = addDaysToIsoDate(
            event.end_datetime ? extractLocalIsoDate(event.end_datetime, tz) : startDate,
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
