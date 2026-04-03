import { createClient } from '@/lib/supabase/server';
import { resolveAppBaseUrl } from '@/lib/url/base-url';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const baseUrl = resolveAppBaseUrl(request);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const nextParam = searchParams.get('next');
    const next = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard';

    if (error || errorDescription) {
        const message = errorDescription || error || 'oauth_error';
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(message)}`);
    }

    if (code) {
        const supabase = await createClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
            return NextResponse.redirect(`${baseUrl}${next}`);
        }

        return NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
    }

    return NextResponse.redirect(`${baseUrl}/login?error=missing_auth_code`);
}
