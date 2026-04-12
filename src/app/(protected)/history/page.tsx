export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { 
    Clock, 
    Search,
} from 'lucide-react';
import SessionList from '@/components/dashboard/session-list';

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all sessions for history, no limit
    const { data: sessions } = await supabase
        .from('parse_sessions')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text mb-1">Scan History</h1>
                <p className="text-text-muted text-sm">
                    Keep track of all your schedule parses and their statuses.
                </p>
            </div>

            {/* List */}
            <div className="bg-bg-card border border-border rounded-[24px] p-1 shadow-sm">
                {!sessions || sessions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-7 h-7 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-text mb-2">No History Yet</h2>
                        <p className="text-sm text-text-muted max-w-sm mx-auto">
                            Start by parsing your first schedule from the dashboard.
                        </p>
                    </div>
                ) : (
                    <div className="p-2 sm:p-4">
                        <SessionList sessions={sessions} />
                    </div>
                )}
            </div>
        </div>
    );
}
