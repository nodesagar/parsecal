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
 * Default behavior:
 * - local dev: enabled
 * - deployed environments: disabled
 *
 * Optional override:
 * - NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR_INTEGRATION=true|false
 */
export const GOOGLE_CALENDAR_INTEGRATION_ENABLED =
    explicitGoogleCalendarToggle ?? process.env.NODE_ENV === 'development';
