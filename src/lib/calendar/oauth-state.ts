export const DEFAULT_CALENDAR_RETURN_PATH = "/settings";

type CalendarOAuthState = {
  userId: string;
  nextPath?: string;
};

function sanitizeNextPath(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (!path.startsWith("/") || path.startsWith("//")) return undefined;
  return path;
}

/**
 * Encodes user identity and optional return path into OAuth state.
 * Falls back to plain userId parsing for backward compatibility.
 */
export function createCalendarOAuthState(userId: string, nextPath?: string | null) {
  const state: CalendarOAuthState = { userId };
  const safeNextPath = sanitizeNextPath(nextPath);
  if (safeNextPath) {
    state.nextPath = safeNextPath;
  }

  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function parseCalendarOAuthState(rawState: string | null) {
  if (!rawState) return null;

  try {
    const decoded = Buffer.from(rawState, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<CalendarOAuthState>;
    if (!parsed || typeof parsed.userId !== "string") {
      return null;
    }

    return {
      userId: parsed.userId,
      nextPath:
        typeof parsed.nextPath === "string"
          ? sanitizeNextPath(parsed.nextPath)
          : undefined,
    };
  } catch {
    // Backward compatibility: previous state format was plain userId.
    return { userId: rawState, nextPath: undefined };
  }
}

export function resolveCalendarReturnPath(nextPath?: string | null) {
  return sanitizeNextPath(nextPath) || DEFAULT_CALENDAR_RETURN_PATH;
}
