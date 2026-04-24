export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { GOOGLE_CALENDAR_INTEGRATION_ENABLED } from '@/lib/features';
import Link from 'next/link';
import {
    Plus,
    Clock,
    Calendar,
} from 'lucide-react';
import SessionList from '@/components/dashboard/session-list';
import CalendarView from '@/components/dashboard/calendar-view';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

    const { data: sessions } = await supabase
        .from('parse_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    let googleCalendar: { id: string; provider: string; calendar_name?: string } | null = null;
    let outlookCalendar: { id: string; provider: string; calendar_name?: string } | null = null;
    const connectedCalendars: { provider: 'google' | 'outlook'; account_email?: string }[] = [];

    if (user?.id) {
        const { data: calendars } = await supabase
            .from('connected_calendars')
            .select('id, provider, calendar_name, calendar_id')
            .eq('user_id', user.id)
            .eq('is_active', true);

        if (calendars) {
            googleCalendar = calendars.find(c => c.provider === 'google') || null;
            outlookCalendar = calendars.find(c => c.provider === 'outlook') || null;
            if (googleCalendar) connectedCalendars.push({ provider: 'google', account_email: googleCalendar.calendar_name || undefined });
            if (outlookCalendar) connectedCalendars.push({ provider: 'outlook', account_email: outlookCalendar.calendar_name || undefined });
        }
    }

    const showGoogleCta = GOOGLE_CALENDAR_INTEGRATION_ENABLED && !googleCalendar;
    const showOutlookCta = !outlookCalendar;
    const showAnyCta = showGoogleCta || showOutlookCta;

    const parseLimit = parseInt(process.env.MONTHLY_PARSE_LIMIT || '20');
    const parsesUsed = profile?.monthly_parse_count ?? 0;
    const parsesRemaining = Math.max(0, parseLimit - parsesUsed);

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text mb-1">
                        Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}
                    </h1>
                    <p className="text-text-muted text-sm">
                        Manage your parsed events and schedule all in one place.
                    </p>
                </div>
                <Link
                    href="/parse/new"
                    className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-sm transition-all active:scale-[0.97]"
                >
                    <Plus className="w-5 h-5" />
                    New Parse
                </Link>
            </div>

            {/* Calendar View */}
            <CalendarView connectedCalendars={connectedCalendars} />

            {/* Calendar Connect Shortcut */}
            {showAnyCta && (
                <div className="group bg-linear-to-br from-bg-card to-bg border border-border/90 ring-1 ring-border/35 hover:border-primary/35 rounded-[20px] p-6 mb-8 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.05)] transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-[14px] flex items-center justify-center shrink-0 animate-pulse-slow">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-base font-bold text-text mb-1 flex items-center gap-2">
                                    One-Click Calendar Sync
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success uppercase tracking-wider">Recommended</span>
                                </h2>
                                <p className="text-sm text-text-muted">
                                    Link your accounts to push parsed events directly to your personal or work calendars in one click.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch md:items-center justify-end gap-3 flex-1 md:flex-none">
                            {showGoogleCta && (
                                <Link
                                    href="/api/auth/calendar/google/init?next=%2Fdashboard"
                                    className="group/btn flex items-center gap-3 bg-bg-card border border-border/90 ring-1 ring-border/30 hover:border-primary/50 hover:shadow-lg text-text font-bold px-5 py-3.5 rounded-2xl text-sm transition-all active:scale-[0.97] min-w-42.5 md:max-w-50"
                                >
                                    <div className="w-8 h-8 rounded-[10px] bg-bg flex items-center justify-center shrink-0 border border-border/40 group-hover/btn:scale-110 transition-transform">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[13px]">Google</span>
                                        <span className="text-[10px] text-text-muted font-medium">Auto-Sync</span>
                                    </div>
                                </Link>
                            )}
                            {showOutlookCta && (
                                <Link
                                    href="/api/auth/calendar/outlook/init?next=%2Fdashboard"
                                    className="group/btn flex items-center gap-3 bg-[#0072C6]/5 hover:bg-[#0072C6]/10 border border-[#0072C6]/20 hover:border-[#0072C6]/40 hover:shadow-lg text-[#0060ac] dark:text-[#9ed6ff] dark:bg-[#7fc8ff]/15 dark:hover:bg-[#7fc8ff]/25 dark:border-[#7fc8ff]/35 dark:hover:border-[#7fc8ff]/50 font-bold px-5 py-3.5 rounded-2xl text-sm transition-all active:scale-[0.97] min-w-42.5 md:max-w-50"
                                >
                                    <div className="w-8 h-8 rounded-[10px] bg-bg-card flex items-center justify-center shrink-0 border border-[#0072C6]/10 dark:border-[#7fc8ff]/30 group-hover/btn:scale-110 transition-transform">
                                        <img src="/icons/outlook.svg" alt="Outlook" className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[13px]">Outlook</span>
                                        <span className="text-[10px] text-[#0060ac]/70 dark:text-[#9ed6ff]/75 font-medium">Auto-Sync</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Meter */}
            <div className="bg-bg-card border border-border/90 ring-1 ring-border/35 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-text">Monthly Parses</span>
                    <span className="text-sm text-text-muted">
                        {parsesUsed}/{parseLimit} used
                    </span>
                </div>
                <div className="w-full bg-bg rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${parsesRemaining <= 3 ? 'bg-error' : 'bg-primary'
                            }`}
                        style={{ width: `${Math.min(100, (parsesUsed / parseLimit) * 100)}%` }}
                    />
                </div>
                {parsesRemaining <= 3 && (
                    <p className="text-xs text-warning mt-2">
                        {parsesRemaining === 0
                            ? 'Limit reached — add your own AI key in Settings for unlimited use.'
                            : `Only ${parsesRemaining} parses remaining this month.`}
                    </p>
                )}
            </div>

            {/* Recent Sessions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                        <Clock className="w-5 h-5 text-text-muted" />
                        Recent Parses
                    </h2>
                    <Link
                        href="/history"
                        className="text-sm font-medium text-primary hover:underline transition-all"
                    >
                        View All
                    </Link>
                </div>

                {!sessions || sessions.length === 0 ? (
                    <div className="bg-bg-card border border-border/90 ring-1 ring-border/35 rounded-2xl p-8 text-center">
                        <p className="text-text-muted text-sm">
                            No parses yet. Upload your first schedule to get started!
                        </p>
                    </div>
                ) : (
                    <SessionList sessions={sessions} />
                )}
            </div>
        </div>
    );
}
