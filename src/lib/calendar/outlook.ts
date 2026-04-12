import type { ParsedEventFromAI } from "@/types";

const MICROSOFT_OAUTH_BASE_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0";
const MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
const MICROSOFT_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "User.Read",
  "Calendars.Read",
  "Calendars.ReadWrite",
];

type MicrosoftOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

type GraphDayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type GraphRecurrenceType =
  | "daily"
  | "weekly"
  | "absoluteMonthly"
  | "absoluteYearly";

type OutlookGraphError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type MicrosoftTokenResponse = {
  access_token: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  ext_expires_in?: number;
  refresh_token?: string;
  id_token?: string;
};

type OutlookRecurrence = {
  pattern: {
    type: GraphRecurrenceType;
    interval: number;
    daysOfWeek?: GraphDayOfWeek[];
    firstDayOfWeek?: GraphDayOfWeek;
    dayOfMonth?: number;
    month?: number;
  };
  range:
    | {
        type: "noEnd";
        startDate: string;
      }
    | {
        type: "endDate";
        startDate: string;
        endDate: string;
      }
    | {
        type: "numbered";
        startDate: string;
        numberOfOccurrences: number;
      };
};

export type OutlookEventPayload = {
  subject: string;
  body: {
    contentType: "text";
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isAllDay?: boolean;
  location?: {
    displayName: string;
  };
  recurrence?: OutlookRecurrence;
};

type OutlookCalendarResponse = {
  id?: string;
  name?: string;
};

type OutlookMeResponse = {
  mail?: string;
  userPrincipalName?: string;
};

type OutlookEventResponse = {
  id?: string;
};

const RRULE_DAY_MAP: Record<string, GraphDayOfWeek> = {
  SU: "sunday",
  MO: "monday",
  TU: "tuesday",
  WE: "wednesday",
  TH: "thursday",
  FR: "friday",
  SA: "saturday",
};

function getMicrosoftOAuthConfig(): MicrosoftOAuthConfig {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri =
    process.env.MICROSOFT_REDIRECT_URI ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/outlook/callback`
      : undefined);

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Microsoft OAuth environment variables are not configured.",
    );
  }

  return { clientId, clientSecret, redirectUri };
}

function getMicrosoftScopeString() {
  return MICROSOFT_SCOPES.join(" ");
}

export function getOutlookAuthUrl(state: string) {
  const { clientId, redirectUri } = getMicrosoftOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: getMicrosoftScopeString(),
    state,
    prompt: "consent",
  });

  return `${MICROSOFT_OAUTH_BASE_URL}/authorize?${params.toString()}`;
}

async function fetchMicrosoftTokens(
  params: URLSearchParams,
): Promise<MicrosoftTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getMicrosoftOAuthConfig();
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("redirect_uri", redirectUri);

  const response = await fetch(`${MICROSOFT_OAUTH_BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details =
      typeof payload?.error_description === "string"
        ? payload.error_description
        : typeof payload?.error === "string"
          ? payload.error
          : `HTTP ${response.status}`;
    throw new Error(`Microsoft token request failed: ${details}`);
  }

  if (!payload?.access_token || typeof payload.access_token !== "string") {
    throw new Error("Microsoft token response missing access_token.");
  }

  return payload as MicrosoftTokenResponse;
}

export async function exchangeOutlookCodeForTokens(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    scope: getMicrosoftScopeString(),
  });

  return fetchMicrosoftTokens(params);
}

export async function refreshOutlookAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: getMicrosoftScopeString(),
  });

  return fetchMicrosoftTokens(params);
}

async function callMicrosoftGraph<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${MICROSOFT_GRAPH_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as T &
    OutlookGraphError;

  if (!response.ok) {
    const message = payload?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Outlook Graph API error (${response.status}): ${message}`);
  }

  return payload as T;
}

export async function getOutlookPrimaryCalendar(accessToken: string) {
  const calendar = await callMicrosoftGraph<OutlookCalendarResponse>(
    "/me/calendar",
    accessToken,
  );

  return {
    calendarId: calendar.id || "primary",
    calendarName: calendar.name || "Outlook Calendar",
  };
}

export async function getOutlookAccountIdentifier(accessToken: string) {
  const profile = await callMicrosoftGraph<OutlookMeResponse>(
    "/me",
    accessToken,
  );

  return profile.mail || profile.userPrincipalName || null;
}

function formatDateOnly(date: Date, timezone: string = 'UTC') {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

function formatGraphDateTime(dateInput: string) {
  return new Date(dateInput).toISOString().replace(/\.\d{3}Z$/, "");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function parseRRule(rule: string) {
  return rule
    .replace(/^RRULE:/i, "")
    .split(";")
    .reduce(
      (acc, entry) => {
        const [rawKey, rawValue] = entry.split("=");
        if (rawKey && rawValue) {
          acc[rawKey.toUpperCase()] = rawValue.toUpperCase();
        }
        return acc;
      },
      {} as Record<string, string>,
    );
}

function parseRRuleUntil(value: string): string | null {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  if (/^\d{8}T\d{6}Z?$/.test(value)) {
    const normalized = value.endsWith("Z") ? value : `${value}Z`;
    const isoDateTime = `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}T${normalized.slice(9, 11)}:${normalized.slice(11, 13)}:${normalized.slice(13, 15)}Z`;
    const parsed = new Date(isoDateTime);
    return Number.isNaN(parsed.getTime()) ? null : formatDateOnly(parsed);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : formatDateOnly(parsed);
}

function buildOutlookRecurrence(
  event: ParsedEventFromAI,
): OutlookRecurrence | undefined {
  if (!event.is_recurring || !event.recurrence_rule) return undefined;

  const rrule = parseRRule(event.recurrence_rule);
  const frequency = rrule.FREQ;
  if (!frequency) return undefined;

  const startDateObj = new Date(event.start_datetime);
  if (Number.isNaN(startDateObj.getTime())) return undefined;

  const intervalRaw = Number.parseInt(rrule.INTERVAL || "1", 10);
  const interval =
    Number.isFinite(intervalRaw) && intervalRaw > 0 ? intervalRaw : 1;
  const startDate = formatDateOnly(startDateObj, 'UTC'); // Internal RRULE logic often assumes UTC or handles conversion
  const startDay = startDateObj.getUTCDate();
  const startMonth = startDateObj.getUTCMonth() + 1;
  const startWeekday =
    RRULE_DAY_MAP[
      ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][startDateObj.getUTCDay()]
    ];
  const byDay = (rrule.BYDAY || "")
    .split(",")
    .map((token) => RRULE_DAY_MAP[token])
    .filter((day): day is GraphDayOfWeek => Boolean(day));

  let pattern: OutlookRecurrence["pattern"] | null = null;

  if (frequency === "DAILY") {
    pattern = { type: "daily", interval };
  } else if (frequency === "WEEKLY") {
    pattern = {
      type: "weekly",
      interval,
      daysOfWeek: byDay.length > 0 ? byDay : [startWeekday],
      firstDayOfWeek: "sunday",
    };
  } else if (frequency === "MONTHLY") {
    pattern = {
      type: "absoluteMonthly",
      interval,
      dayOfMonth: startDay,
    };
  } else if (frequency === "YEARLY") {
    pattern = {
      type: "absoluteYearly",
      interval,
      dayOfMonth: startDay,
      month: startMonth,
    };
  } else {
    return undefined;
  }

  let range: OutlookRecurrence["range"] = {
    type: "noEnd",
    startDate,
  };

  if (rrule.COUNT) {
    const occurrences = Number.parseInt(rrule.COUNT, 10);
    if (Number.isFinite(occurrences) && occurrences > 0) {
      range = {
        type: "numbered",
        startDate,
        numberOfOccurrences: occurrences,
      };
    }
  } else if (rrule.UNTIL) {
    const endDate = parseRRuleUntil(rrule.UNTIL);
    if (endDate) {
      range = {
        type: "endDate",
        startDate,
        endDate,
      };
    }
  }

  return { pattern, range };
}

export function convertToOutlookEvent(
  event: ParsedEventFromAI,
  userTimezone: string = "UTC"
): OutlookEventPayload {
  const outlookEvent: OutlookEventPayload = {
    subject: event.title,
    body: {
      contentType: "text",
      content: event.description || "",
    },
    start: {
      dateTime: "",
      timeZone: "UTC",
    },
    end: {
      dateTime: "",
      timeZone: "UTC",
    },
    isAllDay: event.is_all_day,
  };

  if (event.location) {
    outlookEvent.location = {
      displayName: event.location,
    };
  }

  if (event.is_all_day) {
    const startDate = new Date(event.start_datetime);
    const endDateBase = new Date(event.end_datetime || event.start_datetime);
    const endDateExclusive = addDays(endDateBase, 1);

    outlookEvent.start = {
      dateTime: `${formatDateOnly(startDate, userTimezone)}T00:00:00`,
      timeZone: userTimezone,
    };
    outlookEvent.end = {
      dateTime: `${formatDateOnly(endDateExclusive, userTimezone)}T00:00:00`,
      timeZone: userTimezone,
    };
  } else {
    const startDate = new Date(event.start_datetime);
    const endDate = event.end_datetime
      ? new Date(event.end_datetime)
      : addDays(startDate, 0);

    if (!event.end_datetime) {
      endDate.setUTCHours(endDate.getUTCHours() + 1);
    }

    outlookEvent.start = {
      dateTime: formatGraphDateTime(event.start_datetime),
      timeZone: userTimezone,
    };
    outlookEvent.end = {
      dateTime: formatGraphDateTime(endDate.toISOString()),
      timeZone: userTimezone,
    };
  }

  const recurrence = buildOutlookRecurrence(event);
  if (recurrence) {
    outlookEvent.recurrence = recurrence;
  }

  return outlookEvent;
}

export async function createOutlookEvent(
  accessToken: string,
  calendarId: string,
  eventPayload: OutlookEventPayload,
) {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const path =
    calendarId === "primary"
      ? "/me/calendar/events"
      : `/me/calendars/${encodedCalendarId}/events`;

  return callMicrosoftGraph<OutlookEventResponse>(path, accessToken, {
    method: "POST",
    body: JSON.stringify(eventPayload),
  });
}
