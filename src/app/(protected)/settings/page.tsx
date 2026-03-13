"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ConnectedCalendar } from "@/types";
import {
  User,
  Globe,
  Cpu,
  Key,
  Calendar,
  Loader2,
  CheckCircle2,
  Save,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type Tab = "profile" | "ai" | "calendars";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [calendars, setCalendars] = useState<ConnectedCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: calData } = await supabase
        .from("connected_calendars")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);
      setCalendars(calData || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Check for oauth redirect messages
    const error = searchParams.get("error");
    const successParam = searchParams.get("success");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (error) setErrorMsg(error);

    if (successParam) setSuccessMsg(successParam);

    loadData();
  }, [searchParams, loadData]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setSuccess(false);

    await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        default_timezone: profile.default_timezone,
        preferred_ai_provider: profile.preferred_ai_provider,
        custom_ai_api_key: profile.custom_ai_api_key,
        preferred_calendar_provider: profile.preferred_calendar_provider,
      })
      .eq("id", profile.id);

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function disconnectCalendar(id: string) {
    if (!confirm("Are you sure you want to disconnect this calendar?")) return;

    await supabase
      .from("connected_calendars")
      .update({ is_active: false })
      .eq("id", id);

    setCalendars(calendars.filter((c) => c.id !== id));
    setSuccessMsg("Calendar disconnected successfully.");
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function handleConnectGoogle() {
    window.location.href = "/api/auth/calendar/google/init";
  }

  function handleConnectOutlook() {
    window.location.href = "/api/auth/calendar/outlook/init";
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const googleConnected = calendars.find((c) => c.provider === "google");
  const outlookConnected = calendars.find((c) => c.provider === "outlook");

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">Settings</h1>

      {errorMsg && (
        <div className="bg-error/10 text-error px-4 py-3 rounded-[10px] mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-success/10 text-success px-4 py-3 rounded-[10px] mb-6 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-bg border border-border rounded-[10px] p-1 mb-6">
        {[
          { key: "profile" as Tab, label: "Profile", icon: User },
          { key: "ai" as Tab, label: "AI Provider", icon: Cpu },
          { key: "calendars" as Tab, label: "Calendars", icon: Calendar },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-sm font-medium cursor-pointer ${
              tab === t.key
                ? "bg-bg-card text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-bg-card border border-border rounded-[16px] p-6">
        {tab === "profile" && profile && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-text mb-1.5"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={profile.display_name}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
                className="w-full bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-medium text-text mb-1.5"
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Default Timezone
              </label>
              <select
                id="timezone"
                value={profile.default_timezone}
                onChange={(e) =>
                  setProfile({ ...profile, default_timezone: e.target.value })
                }
                className="w-full bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer"
              >
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {tab === "ai" && profile && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="aiProvider"
                className="block text-sm font-medium text-text mb-1.5"
              >
                Preferred AI Provider
              </label>
              <select
                id="aiProvider"
                value={profile.preferred_ai_provider}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferred_ai_provider: e.target
                      .value as Profile["preferred_ai_provider"],
                  })
                }
                className="w-full bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer"
              >
                <option value="gemini">Google Gemini (Free)</option>
                <option value="openai">
                  OpenAI GPT-4o (Requires your API key)
                </option>
                <option value="claude">
                  Anthropic Claude (Requires your API key)
                </option>
              </select>
            </div>
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-text mb-1.5"
              >
                <Key className="w-4 h-4 inline mr-1" />
                Your API Key (Optional)
              </label>
              <input
                id="apiKey"
                type="password"
                value={profile.custom_ai_api_key || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    custom_ai_api_key: e.target.value || null,
                  })
                }
                placeholder="Enter your API key for unlimited parses"
                className="w-full bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text placeholder:text-text-light focus:border-border-focus focus:outline-none"
              />
              <p className="text-xs text-text-muted mt-1.5">
                Add your own key for unlimited parsing. Without it, you get{" "}
                {process.env.NEXT_PUBLIC_MONTHLY_PARSE_LIMIT || 20} free
                parses/month using Gemini.
              </p>
              {profile.preferred_ai_provider !== "gemini" &&
                !profile.custom_ai_api_key && (
                  <p className="text-xs text-warning mt-1">
                    ⚠ OpenAI and Claude require your own API key. Without one,
                    Gemini will be used instead.
                  </p>
                )}
            </div>
          </div>
        )}

        {tab === "calendars" && (
          <div className="space-y-4">
            {/* Google Calendar */}
            <div className="flex items-center justify-between p-4 bg-bg rounded-[10px] border border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${googleConnected ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">
                    Google Calendar
                  </p>
                  <p className="text-xs text-text-muted">
                    {googleConnected
                      ? googleConnected.calendar_name
                      : "Not connected"}
                  </p>
                </div>
              </div>
              {googleConnected ? (
                <button
                  onClick={() => disconnectCalendar(googleConnected.id)}
                  className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-[8px] cursor-pointer transition-colors"
                  title="Disconnect Calendar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-[10px] cursor-pointer hover:bg-primary-dark"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Microsoft Outlook */}
            <div className="flex items-center justify-between p-4 bg-bg rounded-[10px] border border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${outlookConnected ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">
                    Microsoft Outlook
                  </p>
                  <p className="text-xs text-text-muted">
                    {outlookConnected
                      ? outlookConnected.calendar_name
                      : "Not connected"}
                  </p>
                </div>
              </div>
              {outlookConnected ? (
                <button
                  onClick={() => disconnectCalendar(outlookConnected.id)}
                  className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-[8px] cursor-pointer transition-colors"
                  title="Disconnect Calendar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleConnectOutlook}
                  className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-[10px] cursor-pointer hover:bg-primary-dark"
                >
                  Connect
                </button>
              )}
            </div>

            <div className="text-center py-4 mt-2">
              <p className="text-xs text-text-muted">
                You can always export events as .ics files without connecting a
                calendar.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {(tab === "profile" || tab === "ai") && (
        <button
          onClick={saveProfile}
          disabled={saving}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-[10px] cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {success ? "Saved!" : "Save Changes"}
        </button>
      )}
    </div>
  );
}
