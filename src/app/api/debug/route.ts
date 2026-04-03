import { createClient } from '@/lib/supabase/server';
import { GeminiProvider } from '@/lib/ai/gemini';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const checks: string[] = [];
    const runModelTest = new URL(request.url).searchParams.get('runModelTest') === '1';

    // 1. Check Supabase connection
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) checks.push(`Auth error: ${authError.message}`);
        if (!user) checks.push('No authenticated user');
        else checks.push(`Auth OK for user: ${user.id}`);

        // 2. Check profile exists
        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (profileError) checks.push(`Profile error: ${profileError.message}`);
            if (!profile) checks.push('No profile found');
            else checks.push(`Profile row exists for user ${user.id}`);
        }

        // 3. Test session insert
        if (user) {
            const { data: session, error: sessionError } = await supabase
                .from('parse_sessions')
                .insert({
                    user_id: user.id,
                    input_type: 'text',
                    raw_text_input: 'debug test',
                    ai_provider_used: 'gemini',
                    status: 'processing',
                })
                .select()
                .single();

            if (sessionError) checks.push(`Session insert error: ${sessionError.message} (code: ${sessionError.code})`);
            else {
                checks.push(`Session insert OK: ${session.id}`);
                // Clean up
                await supabase.from('parse_sessions').delete().eq('id', session.id);
            }
        }
    } catch (e) {
        checks.push(`Supabase exception: ${(e as Error).message}`);
    }

    // 4. Check Gemini API key
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'your_gemini_key') {
        checks.push('Gemini API key missing');
    } else {
        checks.push('Gemini API key present');

        // 5. Optional model test to avoid accidental billable calls.
        if (runModelTest) {
            try {
                const provider = new GeminiProvider(geminiKey);
                const result = await provider.callModel(
                    'Return exactly this JSON: {"events": []}. No other text.',
                    { type: 'text', content: '', timezone: 'UTC' }
                );
                checks.push(`Gemini response preview: ${result.slice(0, 100)}`);
            } catch (e) {
                checks.push(`Gemini error: ${(e as Error).message}`);
            }
        }
    }

    return NextResponse.json({ checks, modelTestRan: runModelTest }, { status: 200 });
}
