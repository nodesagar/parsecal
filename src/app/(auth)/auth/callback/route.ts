import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const nextParam = searchParams.get('next');
    const next = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard';

    if (error || errorDescription) {
        const message = errorDescription || error || 'oauth_error';
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
    }

    if (code) {
        const supabase = await createClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }

        return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
    }

    return NextResponse.redirect(`${origin}/login?error=missing_auth_code`);
}
