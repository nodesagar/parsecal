import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getFallbackProviders } from '@/lib/ai/provider-factory';
import { NextResponse } from 'next/server';
import type { AIProviderName, ParseInput, ParsedEventFromAI } from '@/types';
import { checkRateLimit, checkGlobalDailyLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

// Gemini free tier: 15 RPM, ~400 safe daily cap (leaving headroom from 500 limit)
const GLOBAL_DAILY_PARSE_LIMIT = parseInt(process.env.GLOBAL_DAILY_PARSE_LIMIT || '400');
const PER_USER_RPM = 3; // Max 3 parses per minute per user
const PER_IP_RPM = 5;   // Max 5 parses per minute per IP
const ALLOWED_INPUT_TYPES: ParseInput['type'][] = ['pdf', 'image', 'text'];
const UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || 'uploads';
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/heic',
]);

function isAllowedInputType(value: string): value is ParseInput['type'] {
    return ALLOWED_INPUT_TYPES.includes(value as ParseInput['type']);
}

function sanitizeFileName(name: string): string {
    const trimmed = name.trim();
    const normalized = trimmed
        .replace(/[\\/]/g, '-')
        .replace(/[^\w.\- ]+/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 120);

    return normalized || `upload-${Date.now()}`;
}

function buildSessionTitleFromFileName(fileName: string): string {
    return fileName
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function isBucketMissingError(message: string | undefined): boolean {
    if (!message) return false;
    return /bucket not found/i.test(message);
}

function isNonCriticalStorageUploadError(message: string | undefined): boolean {
    if (!message) return false;
    return (
        isBucketMissingError(message) ||
        /row-level security|permission denied|access denied/i.test(message)
    );
}

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
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
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
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

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

        // Parse the multipart form data
        const formData = await request.formData();
        const rawInputType = formData.get('inputType');
        const rawTextInput = formData.get('textInput');
        const rawFile = formData.get('file');

        if (typeof rawInputType !== 'string' || !isAllowedInputType(rawInputType)) {
            return NextResponse.json({ error: 'Invalid inputType' }, { status: 400 });
        }

        const inputType = rawInputType;
        const textInput = typeof rawTextInput === 'string' ? rawTextInput : null;
        const file = rawFile instanceof File ? rawFile : null;

        if ((inputType === 'text' && !textInput?.trim()) || (inputType !== 'text' && !file)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Validate file mime type and size.
        if (inputType === 'pdf' && file?.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are allowed for pdf inputType.' }, { status: 400 });
        }

        if (inputType === 'image' && file && !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: 'Unsupported image type. Use PNG, JPG, JPEG, WEBP, or HEIC.' },
                { status: 400 }
            );
        }

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
        let storageWarning: string | null = null;
        const sanitizedFileName = file ? sanitizeFileName(file.name) : null;

        if (file) {
            fileBuffer = Buffer.from(await file.arrayBuffer());
            fileBase64 = fileBuffer.toString('base64');
            fileMimeType = file.type;
            filePath = `${user.id}/${sessionId}/${sanitizedFileName}`;
        }

        // Auto-generate initial session title
        let sessionTitle: string | null = null;
        if (sanitizedFileName) {
            sessionTitle = buildSessionTitleFromFileName(sanitizedFileName);
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
                title: sessionTitle,
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
            const adminClient = createAdminClient();
            const storageClient = adminClient ?? supabase;

            let { error: uploadError } = await storageClient.storage
                .from(UPLOADS_BUCKET)
                .upload(filePath!, fileBuffer, { contentType: file.type });

            // Auto-provision the uploads bucket when running with service role credentials.
            if (uploadError && isBucketMissingError(uploadError.message) && adminClient) {
                const { error: createBucketError } = await adminClient.storage.createBucket(
                    UPLOADS_BUCKET,
                    {
                        public: false,
                        fileSizeLimit: 25 * 1024 * 1024,
                        allowedMimeTypes: [
                            'application/pdf',
                            'image/png',
                            'image/jpeg',
                            'image/jpg',
                            'image/webp',
                            'image/heic',
                        ],
                    }
                );

                if (createBucketError && !/already exists/i.test(createBucketError.message)) {
                    console.error('Bucket creation error:', createBucketError);
                } else {
                    const retry = await adminClient.storage
                        .from(UPLOADS_BUCKET)
                        .upload(filePath!, fileBuffer, { contentType: file.type });
                    uploadError = retry.error;
                }
            }

            if (uploadError) {
                console.error('File upload error:', uploadError);
                const userMessage = isBucketMissingError(uploadError.message)
                    ? `Storage bucket "${UPLOADS_BUCKET}" is missing. Create it in Supabase Storage, or set SUPABASE_SERVICE_ROLE_KEY on the server for auto-provisioning.`
                    : 'Failed to upload file';

                if (isNonCriticalStorageUploadError(uploadError.message)) {
                    // File content is already loaded in-memory and parse can proceed.
                    storageWarning = userMessage;
                } else {
                    await supabase
                        .from('parse_sessions')
                        .update({ status: 'failed', error_message: 'Failed to upload input file' })
                        .eq('id', session.id);

                    return NextResponse.json({ error: userMessage }, { status: 500 });
                }
            }
        }

        // Build parse input
        const parseInput: ParseInput = {
            type: inputType,
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

        // Global daily limit — protects Gemini free tier (only when using app keys)
        if (!profile.custom_ai_api_key) {
            const globalCheck = checkGlobalDailyLimit(GLOBAL_DAILY_PARSE_LIMIT);
            if (!globalCheck.allowed) {
                await supabase
                    .from('parse_sessions')
                    .update({
                        status: 'failed',
                        error_message: 'Daily server limit reached',
                    })
                    .eq('id', session.id);

                return NextResponse.json(
                    { error: 'Daily server limit reached. Please try again tomorrow or add your own AI API key for unlimited use.' },
                    { status: 429 }
                );
            }
        }

        // Try providers with fallback
        let events: ParsedEventFromAI[] = [];
        let lastError: Error | null = null;

        for (const provider of providers) {
            try {
                events = await provider.parse(parseInput);
                break;
            } catch (err) {
                lastError = err as Error;
                // If rate limited, try next provider
                if ((err as { status?: number }).status === 429) continue;
                // If JSON parse error, retry once with same provider
                if (err instanceof SyntaxError) {
                    try {
                        events = await provider.parse(parseInput);
                        break;
                    } catch {
                        continue;
                    }
                }
                continue;
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

            const { error: eventInsertError } = await supabase.from('parsed_events').insert(eventRows);
            if (eventInsertError) {
                console.error('Parsed events insert error:', eventInsertError);
                await supabase
                    .from('parse_sessions')
                    .update({
                        status: 'failed',
                        error_message: 'Failed to save parsed events',
                    })
                    .eq('id', session.id);
                return NextResponse.json({ error: 'Failed to save parsed events' }, { status: 500 });
            }
        }

        // Update session
        const { error: sessionUpdateError } = await supabase
            .from('parse_sessions')
            .update({
                status: 'draft',
                event_count: events.length,
            })
            .eq('id', session.id);
        if (sessionUpdateError) {
            console.error('Session update error:', sessionUpdateError);
            return NextResponse.json({ error: 'Failed to finalize parse session' }, { status: 500 });
        }

        // Increment monthly parse count
        const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ monthly_parse_count: profile.monthly_parse_count + 1 })
            .eq('id', user.id);
        if (profileUpdateError) {
            console.error('Profile usage update error:', profileUpdateError);
        }

        return NextResponse.json({
            sessionId: session.id,
            eventCount: events.length,
            storageWarning,
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
