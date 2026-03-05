'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    FileText,
    Image,
    Type,
    ArrowRight,
    Trash2,
    Loader2,
    Search,
    X,
    Check,
    Filter,
    CheckSquare,
    MinusSquare,
} from 'lucide-react';
import type { ParseSession } from '@/types';

type StatusKey = 'processing' | 'draft' | 'pushed' | 'partially_pushed' | 'failed';

const statusConfig: Record<StatusKey, { label: string; color: string; bg: string }> = {
    processing: { label: 'Processing', color: 'text-primary', bg: 'bg-primary/10' },
    draft: { label: 'Draft', color: 'text-warning', bg: 'bg-warning/10' },
    pushed: { label: 'Pushed', color: 'text-success', bg: 'bg-success/10' },
    partially_pushed: { label: 'Partial', color: 'text-warning', bg: 'bg-warning/10' },
    failed: { label: 'Failed', color: 'text-error', bg: 'bg-error/10' },
};

const filterOptions: { key: StatusKey | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'pushed', label: 'Pushed' },
    { key: 'failed', label: 'Failed' },
    { key: 'processing', label: 'Processing' },
];

const inputTypeIcon = {
    pdf: FileText,
    image: Image,
    text: Type,
};

export default function SessionList({ sessions: initialSessions }: { sessions: ParseSession[] }) {
    const [sessions, setSessions] = useState(initialSessions);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusKey | 'all'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    // Filtered + searched sessions
    const filtered = useMemo(() => {
        let result = sessions;
        if (statusFilter !== 'all') {
            if (statusFilter === 'pushed') {
                result = result.filter((s) => s.status === 'pushed' || s.status === 'partially_pushed');
            } else {
                result = result.filter((s) => s.status === statusFilter);
            }
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (s) =>
                    (s.title || '').toLowerCase().includes(q) ||
                    s.input_type.toLowerCase().includes(q)
            );
        }
        return result;
    }, [sessions, statusFilter, search]);

    const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
    const someFilteredSelected = filtered.some((s) => selectedIds.has(s.id));

    function toggleSelect(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleSelectAll() {
        if (allFilteredSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                filtered.forEach((s) => next.delete(s.id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                filtered.forEach((s) => next.add(s.id));
                return next;
            });
        }
    }

    async function deleteSession(sessionId: string) {
        setDeletingId(sessionId);
        try {
            const res = await fetch(`/api/parse/${sessionId}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions((prev) => prev.filter((s) => s.id !== sessionId));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(sessionId);
                    return next;
                });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch {
            alert('Network error');
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    }

    async function bulkDelete() {
        setBulkDeleting(true);
        const ids = Array.from(selectedIds);
        const failed: string[] = [];

        // Delete in parallel batches of 5
        for (let i = 0; i < ids.length; i += 5) {
            const batch = ids.slice(i, i + 5);
            const results = await Promise.allSettled(
                batch.map((id) => fetch(`/api/parse/${id}`, { method: 'DELETE' }))
            );
            results.forEach((r, idx) => {
                if (r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)) {
                    failed.push(batch[idx]);
                }
            });
        }

        setSessions((prev) => prev.filter((s) => !ids.includes(s.id) || failed.includes(s.id)));
        setSelectedIds(new Set(failed));
        setBulkDeleting(false);
        setConfirmBulkDelete(false);

        if (failed.length > 0) {
            alert(`${failed.length} session(s) failed to delete.`);
        }


    }

    // Status counts for filter badges
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        sessions.forEach((s) => {
            const key = s.status === 'partially_pushed' ? 'pushed' : s.status;
            counts[key] = (counts[key] || 0) + 1;
        });
        counts['all'] = sessions.length;
        return counts;
    }, [sessions]);

    if (sessions.length === 0) {
        return (
            <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
                <p className="text-text-muted text-sm">
                    No parses yet. Upload your first schedule to get started!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar: filters + search on one row */}
            <div className="flex items-center gap-2">
                {/* Filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
                    <Filter className="w-3.5 h-3.5 text-text-light shrink-0" />
                    {filterOptions.map((f) => {
                        const count = statusCounts[f.key] || 0;
                        const isActive = statusFilter === f.key;
                        if (f.key !== 'all' && count === 0) return null;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer transition-all whitespace-nowrap ${isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-bg text-text-muted hover:bg-bg-card hover:text-text'
                                    }`}
                            >
                                {f.label}
                                <span
                                    className={`text-[10px] font-bold px-1 py-px rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-border/50 text-text-light'
                                        }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 text-text-light absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full text-xs bg-bg-card border border-border rounded-lg pl-8 pr-7 py-1.5 focus:border-primary focus:outline-none placeholder:text-text-light"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                            <X className="w-3 h-3 text-text-light hover:text-text" />
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer"
                        >
                            {allFilteredSelected ? (
                                <MinusSquare className="w-4 h-4" />
                            ) : (
                                <CheckSquare className="w-4 h-4" />
                            )}
                            {allFilteredSelected ? 'Deselect all' : 'Select all'}
                        </button>
                        <span className="text-xs text-text-muted">
                            {selectedIds.size} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {confirmBulkDelete ? (
                            <>
                                <span className="text-xs text-error font-medium">
                                    Delete {selectedIds.size} session{selectedIds.size !== 1 ? 's' : ''}?
                                </span>
                                <button
                                    onClick={bulkDelete}
                                    disabled={bulkDeleting}
                                    className="text-xs font-medium bg-error text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                    {bulkDeleting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3 h-3" />
                                    )}
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setConfirmBulkDelete(false)}
                                    className="text-xs font-medium text-text-muted hover:text-text cursor-pointer px-2 py-1.5"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setConfirmBulkDelete(true)}
                                className="text-xs font-medium text-error hover:bg-error/10 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete selected
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Session list */}
            {filtered.length === 0 ? (
                <div className="bg-bg-card border border-border rounded-[16px] p-6 text-center">
                    <p className="text-text-muted text-sm">
                        {search ? 'No sessions match your search.' : 'No sessions with this status.'}
                    </p>
                    <button
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('all');
                        }}
                        className="text-xs text-primary font-medium mt-2 cursor-pointer hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((session) => {
                        const status = statusConfig[session.status as StatusKey];
                        const InputIcon = inputTypeIcon[session.input_type as keyof typeof inputTypeIcon];
                        const isConfirming = confirmId === session.id;
                        const isDeleting = deletingId === session.id;
                        const isSelected = selectedIds.has(session.id);

                        return (
                            <div
                                key={session.id}
                                className={`group flex items-center gap-3 bg-bg-card border rounded-[14px] p-3.5 transition-all ${isSelected
                                    ? 'border-primary bg-primary/3'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleSelect(session.id)}
                                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${isSelected
                                        ? 'bg-primary border-primary'
                                        : 'border-2 border-border hover:border-primary'
                                        }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </button>

                                {/* Session card content */}
                                <Link
                                    href={session.status === 'processing' ? '#' : `/parse/${session.id}`}
                                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                    onClick={(e) => {
                                        if (isConfirming) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <div className="w-9 h-9 bg-bg rounded-md flex items-center justify-center shrink-0">
                                        <InputIcon className="w-4.5 h-4.5 text-text-muted" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-text truncate">
                                                {session.title || `${session.input_type.charAt(0).toUpperCase() + session.input_type.slice(1)} Upload`}
                                            </span>
                                            <span
                                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${status.bg} ${status.color}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {session.event_count} event{session.event_count !== 1 ? 's' : ''} •{' '}
                                            {new Date(session.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {isConfirming ? (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => deleteSession(session.id)}
                                                disabled={isDeleting}
                                                className="text-[11px] font-medium bg-error text-white px-2.5 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3 h-3" />
                                                )}
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setConfirmId(null)}
                                                className="text-[11px] font-medium text-text-muted bg-bg border border-border px-2.5 py-1.5 rounded-lg cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setConfirmId(session.id);
                                                }}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-error/10 cursor-pointer transition-opacity"
                                                title="Delete session"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-text-light hover:text-error" />
                                            </button>
                                            <Link
                                                href={session.status === 'processing' ? '#' : `/parse/${session.id}`}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg cursor-pointer"
                                            >
                                                <ArrowRight className="w-3.5 h-3.5 text-text-light" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Results count */}
            {(search || statusFilter !== 'all') && filtered.length > 0 && (
                <p className="text-[11px] text-text-light text-center">
                    Showing {filtered.length} of {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
