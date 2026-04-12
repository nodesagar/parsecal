import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const testDate = new Date('2026-04-17T23:30:00Z');
  const timezone = profile?.default_timezone || 'UTC';
  
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset'
  }).formatToParts(testDate);
  
  const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || 'N/A';
  
  return NextResponse.json({
    user: user.id,
    timezone,
    tzPart,
    fullParts: parts
  });
}
