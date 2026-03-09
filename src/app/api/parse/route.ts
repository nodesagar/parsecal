import { createClient } from '@/lib/supabase/server';
import { getFallbackProviders } from '@/lib/ai/provider-factory';
import { NextResponse } from 'next/server';
import type { AIProviderName, ParseInput, ParsedEventFromAI } from '@/types';
import { checkRateLimit, checkGlobalDailyLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

// Gemini free tier: 15 RPM, ~400 safe daily cap (leaving headroom from 500 limit)
const GLOBAL_DAILY_PARSE_LIMIT = parseInt(process.env.GLOBAL_DAILY_PARSE_LIMIT || '400');
const PER_USER_RPM = 3; // Max 3 parses per minute per user
const PER_IP_RPM = 5;   // Max 5 parses per minute per IP

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- Rate Limiting ---
        // Per-user rate limit
        const userRL = checkRateLimit(`user:${user.id}`, {
            maxRequests: PER_USER_RPM,
            windowMs: 60_000,
        });
        if (!userRL.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a minute before trying again.' },
                { status: 429 }
            );
        }

        // Per-IP rate limit
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const ipRL = checkRateLimit(`ip:${ip}`, {
            maxRequests: PER_IP_RPM,
            windowMs: 60_000,
        });
        if (!ipRL.allowed) {
            return NextResponse.json(
                { error: 'Too many requests from this IP. Please wait.' },
                { status: 429 }
            );
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Check monthly parse limit (only for users without custom key)
        const parseLimit = parseInt(process.env.MONTHLY_PARSE_LIMIT || '20');
        if (!profile.custom_ai_api_key && profile.monthly_parse_count >= parseLimit) {
            return NextResponse.json(
                { error: 'Monthly parse limit reached. Add your own AI API key in Settings for unlimited use.' },
                { status: 429 }
            );
        }

        // Global daily limit — protects Gemini free tier (only when using app keys)
        if (!profile.custom_ai_api_key) {
            const globalCheck = checkGlobalDailyLimit(GLOBAL_DAILY_PARSE_LIMIT);
            if (!globalCheck.allowed) {
                return NextResponse.json(
                    { error: 'Daily server limit reached. Please try again tomorrow or add your own AI API key for unlimited use.' },
                    { status: 429 }
                );
            }
        }

        // Parse the multipart form data
        const formData = await request.formData();
        const inputType = formData.get('inputType') as string;
        const textInput = formData.get('textInput') as string | null;
        const file = formData.get('file') as File | null;

        if (!['pdf', 'image', 'text'].includes(inputType) || (inputType === 'text' && !textInput) || (inputType !== 'text' && !file)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Validate file size
        if (file) {
            const maxSize = inputType === 'pdf' ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: `File too large. Max ${inputType === 'pdf' ? '25MB' : '10MB'}.` },
                    { status: 413 }
                );
            }
        }

        // Pre-compute file path and read file data before creating the session
        const sessionId = crypto.randomUUID();
        let filePath: string | null = null;
        let fileBase64 = '';
        let fileMimeType = '';
        let fileBuffer: Buffer | null = null;

        if (file) {
            fileBuffer = Buffer.from(await file.arrayBuffer());
            fileBase64 = fileBuffer.toString('base64');
            fileMimeType = file.type;
            filePath = `uploads/${user.id}/${sessionId}/${file.name}`;
        }

        // Auto-generate initial session title
        let sessionTitle: string | null = null;
        if (file) {
            // Use filename without extension, replace separators with spaces
            sessionTitle = file.name
                .replace(/\.[^.]+$/, '')
                .replace(/[_-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            // Capitalize first letter of each word
            sessionTitle = sessionTitle
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        } else if (textInput) {
            // Use first 60 chars of text input
            sessionTitle = textInput.trim().substring(0, 60).replace(/\n+/g, ' ').trim();
            if (textInput.trim().length > 60) sessionTitle += '…';
        }

        // Create parse session (with file path included to satisfy CHECK constraint)
        const { data: session, error: sessionError } = await supabase
            .from('parse_sessions')
            .insert({
                id: sessionId,
                user_id: user.id,
                title: sessionTitle || 'Untitled Session',
                input_type: inputType,
                input_file_path: filePath,
                raw_text_input: textInput || null,
                ai_provider_used: profile.preferred_ai_provider,
                status: 'processing',
            })
            .select()
            .single();

        if (sessionError || !session) {
            console.error('Session creation error:', sessionError);
            return NextResponse.json({ error: 'Failed to create session', details: sessionError?.message }, { status: 500 });
        }

        // Upload file to Supabase Storage if present
        if (file && fileBuffer) {
            await supabase.storage
                .from('uploads')
                .upload(filePath!, fileBuffer, { contentType: file.type });
        }

        // Build parse input
        const parseInput: ParseInput = {
            type: inputType as 'pdf' | 'image' | 'text',
            content: inputType === 'text' ? (textInput || '') : fileBase64,
            mimeType: fileMimeType || undefined,
            timezone: profile.default_timezone,
        };

        // Get AI providers (with fallback chain)
        const providers = getFallbackProviders(
            profile.preferred_ai_provider as AIProviderName,
            profile.custom_ai_api_key
        );

        if (providers.length === 0) {
            await supabase
                .from('parse_sessions')
                .update({ status: 'failed', error_message: 'No AI provider available' })
                .eq('id', session.id);

            return NextResponse.json({ error: 'No AI provider available' }, { status: 500 });
        }

        // Try providers with fallback
        let events: ParsedEventFromAI[] = [];
        let lastError: Error | null = null;
        let success = false;

        for (const provider of providers) {
            if (success) break;

            const maxRetries = 2; // Initial try + 1 retry for syntax errors
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    events = await provider.parse(parseInput);
                    success = true;
                    break; // Successfully parsed, break retry loop
                } catch (err) {
                    lastError = err as Error;

                    // If rate limited, don't retry same provider, move to next provider
                    if ((err as { status?: number }).status === 429) {
                        break;
                    }

                    // If JSON parse error, retry once with same provider
                    if (err instanceof SyntaxError && attempt < maxRetries) {
                        continue;
                    }

                    // Other errors or out of retries, break internal loop to move to next provider
                    break;
                }
            }
        }

        if (events.length === 0 && lastError) {
            await supabase
                .from('parse_sessions')
                .update({
                    status: 'failed',
                    error_message: lastError.message || 'AI parsing failed',
                })
                .eq('id', session.id);

            return NextResponse.json(
                { error: 'Failed to parse content', sessionId: session.id },
                { status: 500 }
            );
        }

        // Insert parsed events
        if (events.length > 0) {
            const eventRows = events.map((event) => ({
                session_id: session.id,
                title: event.title,
                description: event.description,
                start_datetime: event.start_datetime,
                end_datetime: event.end_datetime,
                is_all_day: event.is_all_day,
                location: event.location,
                is_recurring: event.is_recurring,
                recurrence_rule: event.recurrence_rule,
                confidence: event.confidence,
                is_ambiguous: event.is_ambiguous,
                ambiguity_note: event.ambiguity_note,
                is_selected: true,
                is_edited: false,
            }));

            await supabase.from('parsed_events').insert(eventRows);
        }

        // Update session
        await supabase
            .from('parse_sessions')
            .update({
                status: 'draft',
                event_count: events.length,
            })
            .eq('id', session.id);

        // Increment monthly parse count
        await supabase
            .from('profiles')
            .update({ monthly_parse_count: profile.monthly_parse_count + 1 })
            .eq('id', user.id);

        return NextResponse.json({
            sessionId: session.id,
            eventCount: events.length,
        });
    } catch (error) {
        console.error('Parse error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
