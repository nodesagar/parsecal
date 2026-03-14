"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import {
  User,
  Globe,
  Cpu,
  Key,
  Loader2,
  CheckCircle2,
  Save,
  Sliders
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type Tab = "profile" | "preferences" | "ai";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
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
        
      if (profileData) {
        // Auto-detect timezone if they have default UTC but exist in a different tz
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (profileData.default_timezone === "UTC" && detectedTz && detectedTz !== "UTC") {
          setProfile({ ...profileData, default_timezone: detectedTz });
        } else {
          setProfile(profileData);
        }
      }
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
    setErrorMsg(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        default_timezone: profile.default_timezone,
        time_format: profile.time_format || "12h",
        default_event_duration: profile.default_event_duration || 30,
        default_reminder: profile.default_reminder || 10,
        preferred_ai_provider: profile.preferred_ai_provider,
        custom_ai_api_key: profile.custom_ai_api_key,
      })
      .eq("id", profile.id);

    setSaving(false);
    
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 skeleton h-64 rounded-[10px] shrink-0" />
        <div className="flex-1 w-full space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full max-w-md" />
          ))}
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "preferences", label: "App Preferences", icon: Sliders },
    { key: "ai", label: "AI Provider", icon: Cpu },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Settings</h1>
        <p className="text-text-muted mt-1">Manage your account and customize your parsing experience.</p>
      </div>

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

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {tabs.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center justify-start gap-3 px-4 py-3 rounded-[10px] text-sm font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-bg-card text-primary shadow-sm border border-border"
                    : "text-text-muted hover:text-text hover:bg-bg-card/50 border border-transparent"
                }`}
              >
                <t.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 w-full bg-bg-card border border-border rounded-[16px] p-6 sm:p-8">
          {tab === "profile" && profile && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <h2 className="text-xl font-semibold text-text mb-4">Profile Information</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5 flex items-center">
                  <Globe className="w-4 h-4 mr-1.5" />
                  Default Timezone
                </label>
                <select
                  value={profile.default_timezone}
                  onChange={(e) =>
                    setProfile({ ...profile, default_timezone: e.target.value })
                  }
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer transition-colors"
                >
                  {Intl.supportedValuesOf("timeZone").map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-2">
                  We automatically detect this from your browser. Change it if you prefer explicitly saving to another timezone.
                </p>
              </div>
            </div>
          )}

          {tab === "preferences" && profile && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <h2 className="text-xl font-semibold text-text mb-4">App Preferences</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Time Format
                </label>
                <select
                  value={profile.time_format || "12h"}
                  onChange={(e) =>
                    setProfile({ ...profile, time_format: e.target.value as "12h" | "24h" })
                  }
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="12h">12-hour AM/PM (e.g. 2:30 PM)</option>
                  <option value="24h">24-hour (e.g. 14:30)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Default Event Duration
                </label>
                <select
                  value={profile.default_event_duration || 30}
                  onChange={(e) =>
                    setProfile({ ...profile, default_event_duration: parseInt(e.target.value) })
                  }
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer transition-colors"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
                <p className="text-xs text-text-muted mt-2">
                  When the AI detects an event but no end time is specified (e.g. &quot;Meeting at 5pm&quot;), it will default to this duration.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Default Calendar Reminder
                </label>
                <select
                  value={profile.default_reminder ?? 10}
                  onChange={(e) =>
                    setProfile({ ...profile, default_reminder: parseInt(e.target.value) })
                  }
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer transition-colors"
                >
                  <option value={0}>No default reminder</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
                <p className="text-xs text-text-muted mt-2">
                  The default notification alert added to events when pushed to your calendar.
                </p>
              </div>
            </div>
          )}

          {tab === "ai" && profile && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <h2 className="text-xl font-semibold text-text mb-4">AI Configuration</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5 text-text">
                  Preferred AI Provider
                </label>
                <select
                  value={profile.preferred_ai_provider}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferred_ai_provider: e.target
                        .value as Profile["preferred_ai_provider"],
                    })
                  }
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text focus:border-border-focus focus:outline-none cursor-pointer transition-colors"
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
                <label className="block text-sm font-medium text-text mb-1.5 flex items-center">
                  <Key className="w-4 h-4 mr-1.5" />
                  Your API Key (Optional)
                </label>
                <input
                  type="password"
                  value={profile.custom_ai_api_key || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      custom_ai_api_key: e.target.value || null,
                    })
                  }
                  placeholder="Enter your API key for unlimited parses"
                  className="w-full max-w-md bg-bg border border-border rounded-[10px] px-4 py-2.5 text-sm text-text placeholder:text-text-light focus:border-border-focus focus:outline-none transition-colors"
                />
                <p className="text-xs text-text-muted mt-2">
                  Add your own key for unlimited parsing. Without it, you get{" "}
                  {process.env.NEXT_PUBLIC_MONTHLY_PARSE_LIMIT || 20} free
                  parses/month using Gemini.
                </p>
                {profile.preferred_ai_provider !== "gemini" &&
                  !profile.custom_ai_api_key && (
                    <p className="text-xs text-warning mt-2 font-medium">
                      ⚠ OpenAI and Claude require your own API key. Without one,
                      Gemini will be used instead.
                    </p>
                  )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-[10px] cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {success ? "Saved successfully!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
