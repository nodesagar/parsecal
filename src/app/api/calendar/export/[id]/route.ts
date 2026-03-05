import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import ical, { ICalCalendarMethod } from 'ical-generator';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify session ownership
        const { data: session } = await supabase
            .from('parse_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Fetch selected events
        const { data: events } = await supabase
            .from('parsed_events')
            .select('*')
            .eq('session_id', sessionId)
            .eq('is_selected', true)
            .order('start_datetime', { ascending: true });

        if (!events || events.length === 0) {
            return NextResponse.json({ error: 'No selected events' }, { status: 400 });
        }

        // Generate ICS
        const calendar = ical({
            name: 'CalendarAI Export',
            method: ICalCalendarMethod.PUBLISH,
        });

        for (const event of events) {
            const calEvent = calendar.createEvent({
                start: new Date(event.start_datetime),
                end: event.end_datetime ? new Date(event.end_datetime) : undefined,
                allDay: event.is_all_day,
                summary: event.title,
                description: event.description || undefined,
                location: event.location || undefined,
            });

            if (event.is_recurring && event.recurrence_rule) {
                // Note: ical-generator expects repeating rules in a specific format
                // This is a simplified approach
                calEvent.description(
                    `${event.description || ''}\n\nRecurrence: ${event.recurrence_rule}`.trim()
                );
            }
        }

        const icsContent = calendar.toString();

        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="calendarai-export.ics"`,
            },
        });
    } catch (error) {
        console.error('ICS export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
