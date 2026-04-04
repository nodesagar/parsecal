function parseBooleanEnv(value: string | undefined): boolean | undefined {
    if (!value) return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    return undefined;
}

const explicitGoogleCalendarToggle = parseBooleanEnv(
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR_INTEGRATION
);

/**
 * Auto-detect: enabled when Google OAuth credentials are configured,
 * or when explicitly toggled via env var.
 *
 * Override: NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR_INTEGRATION=true|false
 */
const hasGoogleCredentials = Boolean(
    (process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) &&
    (process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET)
);

export const GOOGLE_CALENDAR_INTEGRATION_ENABLED =
    explicitGoogleCalendarToggle ?? hasGoogleCredentials;
