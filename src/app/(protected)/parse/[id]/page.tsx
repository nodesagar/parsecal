'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GOOGLE_CALENDAR_INTEGRATION_ENABLED } from '@/lib/features';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ParseSession, ParsedEvent } from '@/types';
import {
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    MapPin,
    Clock,
    Repeat,
    Trash2,
    Plus,
    Download,
    Send,
    Edit3,
    Check,
    Loader2,
    Calendar,
    ChevronDown,
    Pencil,
    X,
} from 'lucide-react';

function ConfidenceBadge({ confidence }: { confidence: number }) {
    if (confidence >= 0.8)
        return (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-confidence-high/10 text-confidence-high">
                {Math.round(confidence * 100)}%
            </span>
        );
    if (confidence >= 0.5)
        return (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-confidence-medium/10 text-confidence-medium">
                {Math.round(confidence * 100)}%
            </span>
        );
    return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-confidence-low/10 text-confidence-low">
            {Math.round(confidence * 100)}%
        </span>
    );
}

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;
    const supabase = createClient();

    const [session, setSession] = useState<ParseSession | null>(null);
    const [events, setEvents] = useState<ParsedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [pushing, setPushing] = useState(false);
    const [pushResult, setPushResult] = useState<{ successful: number; failed: number } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<ParsedEvent>>({});
    const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>('ics');
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState('');
    const [customRuleMode, setCustomRuleMode] = useState(false);

    // We only want to load initially
    const loadData = useCallback(async () => {
        const { data: sessionData } = await supabase
            .from('parse_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        const { data: eventsData } = await supabase
            .from('parsed_events')
            .select('*')
            .eq('session_id', sessionId)
            .order('start_datetime', { ascending: true });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: calData } = await supabase
                .from('connected_calendars')
                .select('provider')
                .eq('user_id', user.id)
                .eq('is_active', true);

            if (calData && calData.length > 0) {
                const rawProviders = calData.map(c => c.provider);
                const providers = GOOGLE_CALENDAR_INTEGRATION_ENABLED
                    ? rawProviders
                    : rawProviders.filter((provider) => provider !== 'google');
                setConnectedProviders(providers);
                if (providers.includes('outlook')) {
                    setSelectedProvider('outlook');
                } else if (providers.includes('google')) {
                    setSelectedProvider('google');
                }
            }
        }

        setSession(sessionData);
        setEvents(eventsData || []);
        setLoading(false);
    }, [sessionId, supabase]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    async function toggleSelect(eventId: string, selected: boolean) {
        setEvents((prev) =>
            prev.map((e) => (e.id === eventId ? { ...e, is_selected: selected } : e))
        );
        await supabase
            .from('parsed_events')
            .update({ is_selected: selected })
            .eq('id', eventId);
    }

    async function toggleSelectAll(selected: boolean) {
        setEvents((prev) => prev.map((e) => ({ ...e, is_selected: selected })));
        const ids = events.map((e) => e.id);
        await supabase
            .from('parsed_events')
            .update({ is_selected: selected })
            .in('id', ids);
    }

    async function deleteEvent(eventId: string) {
        const eventInfo = events.find((e) => e.id === eventId);
        
        // If it was already pushed, attempt to delete from external calendar too
        if (eventInfo?.external_event_id && eventInfo?.pushed_to_provider) {
            try {
                // Background deletion, don't block UI
                fetch(`/api/calendar/events?provider=${eventInfo.pushed_to_provider}&eventId=${eventInfo.external_event_id}`, {
                    method: 'DELETE'
                });
            } catch (err) {
                console.error("Failed to delete external event:", err);
            }
        }

        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        await supabase.from('parsed_events').delete().eq('id', eventId);

        // Update session event count
        if (session) {
            const newCount = Math.max(0, session.event_count - 1);
            if (newCount === 0) {
                // If no events left, delete the entire session
                await supabase.from('parse_sessions').delete().eq('id', sessionId);
                router.refresh();
                router.push('/dashboard');
                return;
            }
            setSession({ ...session, event_count: newCount });
            await supabase.from('parse_sessions').update({ event_count: newCount }).eq('id', sessionId);
            router.refresh();
        }
    }

    function startEdit(event: ParsedEvent) {
        setEditingId(event.id);
        const presets = ['RRULE:FREQ=DAILY', 'RRULE:FREQ=WEEKLY', 'RRULE:FREQ=BIWEEKLY', 'RRULE:FREQ=MONTHLY'];
        setCustomRuleMode(!!event.recurrence_rule && !presets.includes(event.recurrence_rule));
        
        // Helper to convert DB ISO string to local input format
        const toLocalInput = (iso: string | null) => {
            if (!iso) return '';
            const date = new Date(iso);
            if (isNaN(date.getTime())) return '';
            const tzOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
        };

        setEditValues({
            title: event.title,
            description: event.description,
            start_datetime: toLocalInput(event.start_datetime),
            end_datetime: toLocalInput(event.end_datetime),
            is_all_day: event.is_all_day,
            location: event.location,
            is_recurring: event.is_recurring,
            recurrence_rule: event.recurrence_rule,
        });
    }

    async function saveEdit(eventId: string) {
        const existingEvent = events.find((event) => event.id === eventId);
        if (!existingEvent) return;

        // Helper to convert naive input value back to UTC ISO
        const toUtcIso = (input: string | undefined | null) => {
            if (!input) return null;
            // new Date(input) on a naive string like "2026-04-12T23:30" 
            // will correctly use the browser's local timezone.
            const date = new Date(input);
            if (isNaN(date.getTime())) return null;
            return date.toISOString();
        };

        const updatePayload = {
            title: editValues.title ?? existingEvent.title,
            description: editValues.description ?? existingEvent.description,
            start_datetime: toUtcIso(editValues.start_datetime) || existingEvent.start_datetime,
            end_datetime: toUtcIso(editValues.end_datetime),
            is_all_day: !!editValues.is_all_day,
            location: editValues.location ?? existingEvent.location,
            is_recurring: !!editValues.is_recurring,
            recurrence_rule: editValues.recurrence_rule ?? existingEvent.recurrence_rule,
            is_edited: true,
            pushed_at: null, // Reset push status on edit to allow re-pushing
        };

        await supabase
            .from('parsed_events')
            .update(updatePayload)
            .eq('id', eventId);

        setEvents((prev) =>
            prev.map((e) =>
                e.id === eventId ? { ...e, ...updatePayload } : e
            )
        );
        setEditingId(null);
        router.refresh();
    }

    async function handleExportICS() {
        window.open(`/api/calendar/export/${params.id}`, '_blank');
    }

    async function handlePush() {
        if (selectedProvider === 'ics') {
            return handleExportICS();
        }

        setPushing(true);
        setPushResult(null);

        try {
            const res = await fetch('/api/calendar/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: params.id,
                    provider: selectedProvider
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to push events');
            }

            setPushResult({ successful: data.successful, failed: data.failed });

            // Reload events to show them as pushed
            loadData();

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(errorMessage);
        } finally {
            setPushing(false);
        }
    }

    const selectedCount = events.filter((e) => e.is_selected && !e.pushed_at).length;
    const alreadyPushedCount = events.filter((e) => e.pushed_at).length;
    const googleConnected = GOOGLE_CALENDAR_INTEGRATION_ENABLED && connectedProviders.includes('google');
    const outlookConnected = connectedProviders.includes('outlook');
    const connectGoogleHref = `/api/auth/calendar/google/init?next=${encodeURIComponent(`/parse/${sessionId}`)}`;
    const connectOutlookHref = `/api/auth/calendar/outlook/init?next=${encodeURIComponent(`/parse/${sessionId}`)}`;
    const showConnectOutlookCta = !outlookConnected;
    const showConnectGoogleCta = GOOGLE_CALENDAR_INTEGRATION_ENABLED && !googleConnected;
    const showCalendarConnectCta = showConnectOutlookCta || showConnectGoogleCta;

    if (loading) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto text-center">
                <p className="text-text-muted">Session not found.</p>
                <Link href="/dashboard" className="text-primary font-medium hover:underline mt-2 inline-block cursor-pointer">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-bg border border-border hover:border-primary cursor-pointer transition-colors"
                    title="Go back"
                >
                    <ArrowLeft className="w-4 h-4 text-text-muted" />
                </button>
                <div className="flex-1 min-w-0">
                    {editingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                value={titleDraft}
                                onChange={(e) => setTitleDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const newTitle = titleDraft.trim();
                                        if (newTitle && session) {
                                            supabase
                                                .from('parse_sessions')
                                                .update({ title: newTitle })
                                                .eq('id', session.id)
                                                .then(() => {
                                                    setSession({ ...session, title: newTitle });
                                                });
                                        }
                                        setEditingTitle(false);
                                    } else if (e.key === 'Escape') {
                                        setEditingTitle(false);
                                    }
                                }}
                                className="text-xl font-bold text-text bg-bg border border-border rounded-[8px] px-2 py-0.5 focus:border-primary focus:outline-none w-full max-w-sm"
                            />
                            <button
                                onClick={() => {
                                    const newTitle = titleDraft.trim();
                                    if (newTitle && session) {
                                        supabase
                                            .from('parse_sessions')
                                            .update({ title: newTitle })
                                            .eq('id', session.id)
                                            .then(() => {
                                                setSession({ ...session, title: newTitle });
                                            });
                                    }
                                    setEditingTitle(false);
                                }}
                                className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-success/10 hover:bg-success/20 cursor-pointer"
                            >
                                <Check className="w-4 h-4 text-success" />
                            </button>
                            <button
                                onClick={() => setEditingTitle(false)}
                                className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-bg hover:bg-error/10 cursor-pointer"
                            >
                                <X className="w-4 h-4 text-text-muted" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-xl font-bold text-text truncate">
                                {session.title || 'Review Events'}
                            </h1>
                            <button
                                onClick={() => {
                                    setTitleDraft(session.title || '');
                                    setEditingTitle(true);
                                }}
                                className="w-6 h-6 rounded-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-bg cursor-pointer transition-opacity"
                                title="Rename session"
                            >
                                <Pencil className="w-3.5 h-3.5 text-text-muted" />
                            </button>
                        </div>
                    )}
                    <p className="text-sm text-text-muted">
                        {events.length} events found • {selectedCount} selected to push
                        {alreadyPushedCount > 0 && ` • ${alreadyPushedCount} already pushed`}
                    </p>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => toggleSelectAll(true)}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                    Select All
                </button>
                <span className="text-text-light">•</span>
                <button
                    onClick={() => toggleSelectAll(false)}
                    className="text-xs font-medium text-text-muted hover:text-text cursor-pointer"
                >
                    Deselect All
                </button>
            </div>

            {/* Event Cards */}
            {events.length === 0 ? (
                <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
                    <p className="text-text-muted text-sm mb-4">
                        No events were extracted from this input.
                    </p>
                    <Link
                        href="/parse/new"
                        className="inline-flex items-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-[10px] text-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Try Again
                    </Link>
                </div>
            ) : (
                <div className="space-y-3 mb-6">
                    {events.map((event) => {
                        const isEditing = editingId === event.id;
                        const borderClass = event.is_ambiguous
                            ? 'border-warning'
                            : event.is_selected
                                ? 'border-border hover:border-primary'
                                : 'border-border opacity-50';

                        return (
                            <div
                                key={event.id}
                                className={`bg-bg-card border rounded-[16px] p-4 ${borderClass}`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleSelect(event.id, !event.is_selected)}
                                        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center mt-0.5 flex-shrink-0 cursor-pointer ${event.is_selected
                                            ? 'bg-primary border-primary'
                                            : 'border-border'
                                            }`}
                                    >
                                        {event.is_selected && <Check className="w-3 h-3 text-white" />}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            /* Edit Mode */
                                            <div className="space-y-3">
                                                {/* Title */}
                                                <div>
                                                    <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1 block">Title</label>
                                                    <input
                                                        value={editValues.title || ''}
                                                        onChange={(e) =>
                                                            setEditValues({ ...editValues, title: e.target.value })
                                                        }
                                                        placeholder="Event title"
                                                        className="w-full text-sm font-semibold bg-bg border border-border rounded-[6px] px-3 py-1.5 focus:border-primary focus:outline-none"
                                                    />
                                                </div>

                                                {/* All Day Toggle */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditValues({ ...editValues, is_all_day: !editValues.is_all_day })
                                                        }
                                                        className={`relative w-8 h-[18px] rounded-full transition-colors cursor-pointer ${editValues.is_all_day ? 'bg-primary' : 'bg-border'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform ${editValues.is_all_day ? 'translate-x-[14px]' : 'translate-x-0'
                                                                }`}
                                                        />
                                                    </button>
                                                    <span className="text-xs text-text-muted">All day</span>
                                                </div>

                                                {/* Start & End DateTime */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1 block">Start</label>
                                                        <input
                                                            type={editValues.is_all_day ? 'date' : 'datetime-local'}
                                                            value={
                                                                editValues.is_all_day
                                                                    ? (editValues.start_datetime || '').slice(0, 10)
                                                                    : (editValues.start_datetime || '').slice(0, 16)
                                                            }
                                                            onChange={(e) =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    start_datetime: e.target.value,
                                                                })
                                                            }
                                                            className="w-full text-xs bg-bg border border-border rounded-[6px] px-3 py-1.5 focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1 block">End</label>
                                                        <input
                                                            type={editValues.is_all_day ? 'date' : 'datetime-local'}
                                                            value={
                                                                editValues.is_all_day
                                                                    ? (editValues.end_datetime || '').slice(0, 10)
                                                                    : (editValues.end_datetime || '').slice(0, 16)
                                                            }
                                                            onChange={(e) =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    end_datetime: e.target.value || null,
                                                                })
                                                            }
                                                            className="w-full text-xs bg-bg border border-border rounded-[6px] px-3 py-1.5 focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Location */}
                                                <div>
                                                    <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1 block">Location</label>
                                                    <div className="relative">
                                                        <MapPin className="w-3.5 h-3.5 text-text-light absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                        <input
                                                            value={editValues.location || ''}
                                                            onChange={(e) =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    location: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Add location"
                                                            className="w-full text-xs bg-bg border border-border rounded-[6px] pl-8 pr-3 py-1.5 focus:border-primary focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Recurring Toggle */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditValues({
                                                                    ...editValues,
                                                                    is_recurring: !editValues.is_recurring,
                                                                    recurrence_rule: !editValues.is_recurring ? editValues.recurrence_rule : null,
                                                                })
                                                            }
                                                            className={`relative w-8 h-[18px] rounded-full transition-colors cursor-pointer ${editValues.is_recurring ? 'bg-primary' : 'bg-border'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform ${editValues.is_recurring ? 'translate-x-[14px]' : 'translate-x-0'
                                                                    }`}
                                                            />
                                                        </button>
                                                        <Repeat className="w-3.5 h-3.5 text-text-muted" />
                                                        <span className="text-xs text-text-muted">Recurring</span>
                                                    </div>
                                                    {editValues.is_recurring && (
                                                        <div className="space-y-2">
                                                            <select
                                                                value={
                                                                    customRuleMode
                                                                        ? 'custom'
                                                                        : editValues.recurrence_rule &&
                                                                            ['RRULE:FREQ=DAILY', 'RRULE:FREQ=WEEKLY', 'RRULE:FREQ=BIWEEKLY', 'RRULE:FREQ=MONTHLY'].includes(editValues.recurrence_rule)
                                                                            ? editValues.recurrence_rule
                                                                            : editValues.recurrence_rule ? 'custom' : ''
                                                                }
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === 'custom') {
                                                                        setCustomRuleMode(true);
                                                                        if (!editValues.recurrence_rule ||
                                                                            ['RRULE:FREQ=DAILY', 'RRULE:FREQ=WEEKLY', 'RRULE:FREQ=BIWEEKLY', 'RRULE:FREQ=MONTHLY'].includes(editValues.recurrence_rule || '')) {
                                                                            setEditValues({
                                                                                ...editValues,
                                                                                recurrence_rule: '',
                                                                            });
                                                                        }
                                                                    } else {
                                                                        setCustomRuleMode(false);
                                                                        setEditValues({
                                                                            ...editValues,
                                                                            recurrence_rule: val || null,
                                                                        });
                                                                    }
                                                                }}
                                                                className="w-full text-xs bg-bg border border-border rounded-[6px] px-3 py-1.5 focus:border-primary focus:outline-none cursor-pointer"
                                                            >
                                                                <option value="">Select frequency...</option>
                                                                <option value="RRULE:FREQ=DAILY">Daily</option>
                                                                <option value="RRULE:FREQ=WEEKLY">Weekly</option>
                                                                <option value="RRULE:FREQ=BIWEEKLY">Every 2 weeks</option>
                                                                <option value="RRULE:FREQ=MONTHLY">Monthly</option>
                                                                <option value="custom">Custom rule...</option>
                                                            </select>
                                                            {(customRuleMode ||
                                                                (editValues.recurrence_rule &&
                                                                    !['RRULE:FREQ=DAILY', 'RRULE:FREQ=WEEKLY', 'RRULE:FREQ=BIWEEKLY', 'RRULE:FREQ=MONTHLY'].includes(editValues.recurrence_rule))) && (
                                                                    <input
                                                                        value={editValues.recurrence_rule || ''}
                                                                        onChange={(e) =>
                                                                            setEditValues({
                                                                                ...editValues,
                                                                                recurrence_rule: e.target.value,
                                                                            })
                                                                        }
                                                                        placeholder="e.g. RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
                                                                        className="w-full text-xs font-mono bg-bg border border-border rounded-[6px] px-3 py-1.5 focus:border-primary focus:outline-none"
                                                                    />
                                                                )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1 block">Description</label>
                                                    <textarea
                                                        value={editValues.description || ''}
                                                        onChange={(e) =>
                                                            setEditValues({ ...editValues, description: e.target.value || null })
                                                        }
                                                        placeholder="Add description"
                                                        rows={2}
                                                        className="w-full text-xs bg-bg border border-border rounded-[6px] px-3 py-1.5 focus:border-primary focus:outline-none resize-none"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => saveEdit(event.id)}
                                                        className="text-xs font-medium bg-success text-white px-4 py-1.5 rounded-[6px] cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="text-xs font-medium bg-bg border border-border px-4 py-1.5 rounded-[6px] cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            deleteEvent(event.id);
                                                        }}
                                                        className="text-xs font-medium text-error hover:bg-error/10 px-4 py-1.5 rounded-[6px] cursor-pointer ml-auto flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View Mode */
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`text-sm font-semibold truncate ${event.pushed_at ? 'text-success' : 'text-text'}`}>
                                                        {event.title}
                                                    </h3>
                                                    <ConfidenceBadge confidence={event.confidence} />
                                                    {event.is_ambiguous && (
                                                        <span title={event.ambiguity_note || 'Uncertain'}>
                                                            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                                                        </span>
                                                    )}
                                                    {event.is_edited && (
                                                        <span className="text-[10px] font-medium text-primary">edited</span>
                                                    )}
                                                    {event.pushed_at && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Pushed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(event.start_datetime).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}{' '}
                                                        {!event.is_all_day &&
                                                            new Date(event.start_datetime).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        {event.end_datetime &&
                                                            ` — ${new Date(event.end_datetime).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}`}
                                                    </span>
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                    {event.is_recurring && (
                                                        <span className="flex items-center gap-1">
                                                            <Repeat className="w-3 h-3" />
                                                            Recurring
                                                        </span>
                                                    )}
                                                </div>
                                                {event.ambiguity_note && (
                                                    <p className="text-[11px] text-warning mt-1 bg-warning/10 px-2 py-1 rounded-[6px]">
                                                        ⚠️ {event.ambiguity_note}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {!isEditing && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => startEdit(event)}
                                                className="w-7 h-7 rounded-[6px] flex items-center justify-center hover:bg-bg cursor-pointer"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 text-text-muted" />
                                            </button>
                                            <button
                                                onClick={() => deleteEvent(event.id)}
                                                className="w-7 h-7 rounded-[6px] flex items-center justify-center hover:bg-error/10 cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Push Bar */}
            {events.length > 0 && selectedCount > 0 && !pushResult && (
                <div className="sticky bottom-4 mx-auto w-full max-w-[calc(100%-2rem)] bg-white/80 backdrop-blur-xl border border-border/40 rounded-[20px] p-2.5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-stretch md:items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <div className="relative group">
                            <select
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="w-full md:w-[200px] appearance-none bg-bg-card border border-border/60 hover:border-primary/40 rounded-[14px] pl-10 pr-8 py-3 text-sm font-bold text-text focus:border-primary focus:outline-none cursor-pointer transition-all shadow-sm group-hover:shadow-md"
                            >
                                {googleConnected && <option value="google">Google Calendar</option>}
                                {outlookConnected && <option value="outlook">Outlook Calendar</option>}
                                <option value="ics">.ics Download</option>
                            </select>
                            <Calendar className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform" />
                             <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-y-[-40%] transition-transform" />
                        </div>

                        {showCalendarConnectCta && (
                            <div className="flex items-center gap-2 overflow-hidden px-1">
                                <span className="hidden lg:block text-[10px] font-bold text-text-muted uppercase tracking-widest mr-1">Link</span>
                                <div className="flex items-center gap-1.5 flex-1">
                                    {showConnectGoogleCta && (
                                        <Link
                                            href={connectGoogleHref}
                                            className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] bg-white border border-border/50 hover:border-primary/30 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all active:scale-[0.96]"
                                            title="Connect Google Calendar"
                                        >
                                            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-[12px] font-bold text-text truncate">Google</span>
                                        </Link>
                                    )}
                                    {showConnectOutlookCta && (
                                        <Link
                                            href={connectOutlookHref}
                                            className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] bg-[#0072C6]/5 hover:bg-[#0072C6]/10 border border-[#0072C6]/10 hover:border-[#0072C6]/20 transition-all active:scale-[0.96]"
                                            title="Connect Outlook Calendar"
                                        >
                                            <img src="/icons/outlook.svg" alt="Outlook" className="w-4 h-4 shrink-0" />
                                            <span className="text-[12px] font-bold text-[#0060ac] truncate">Outlook</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePush}
                        disabled={selectedCount === 0 || pushing || (selectedProvider !== 'ics' && !connectedProviders.includes(selectedProvider))}
                        className="group relative flex items-center gap-2.5 bg-linear-to-br from-[#FF7E33] to-[#FF4B00] hover:from-[#FF8E4D] hover:to-[#FF5C1A] text-white font-bold px-8 py-3.5 rounded-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(255,75,0,0.25)] hover:shadow-[0_6px_20px_rgba(255,75,0,0.35)] transition-all active:scale-[0.97] w-full md:w-auto justify-center flex-shrink-0"
                    >
                        {pushing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="tracking-tight">{selectedProvider === 'ics' ? 'Exporting...' : 'Pushing...'}</span>
                            </>
                        ) : (
                            <>
                                <div className="p-1 rounded-full bg-white/20 group-hover:scale-110 transition-transform">
                                    {selectedProvider === 'ics' ? <Download className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                                </div>
                                <span className="tracking-tight">
                                    {selectedProvider === 'ics' ? `Export ${selectedCount} Event${selectedCount !== 1 ? 's' : ''}` : `Push ${selectedCount} Event${selectedCount !== 1 ? 's' : ''}`}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Success state */}
            {pushResult && (
                <div className="sticky bottom-0 md:bottom-auto bg-success/10 border border-success/30 rounded-[16px] p-5 flex items-center justify-between text-success">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6" />
                        <div>
                            <p className="font-semibold">Successfully pushed {pushResult.successful} events!</p>
                            {pushResult.failed > 0 && <p className="text-sm text-error">{pushResult.failed} events failed to push.</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="bg-bg text-text-muted hover:text-text font-medium px-4 py-2 rounded-[10px] border border-border hover:border-border-focus cursor-pointer text-sm"
                        >
                            Back
                        </button>
                        <a
                            href={
                                selectedProvider === 'google'
                                    ? 'https://calendar.google.com'
                                    : selectedProvider === 'outlook'
                                        ? 'https://outlook.live.com/calendar'
                                        : 'https://calendar.google.com'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-[10px] cursor-pointer text-sm flex items-center gap-1.5"
                        >
                            <Calendar className="w-4 h-4" />
                            View Calendar
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
