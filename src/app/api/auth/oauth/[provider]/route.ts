import { createClient } from '@/lib/supabase/server';
import { resolveAppBaseUrl } from '@/lib/url/base-url';
import { NextResponse } from 'next/server';

type OAuthProvider = 'google' | 'azure';

function isSupportedProvider(value: string): value is OAuthProvider {
    return value === 'google' || value === 'azure';
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider: rawProvider } = await params;
    if (!isSupportedProvider(rawProvider)) {
        return NextResponse.json({ error: 'Unsupported OAuth provider' }, { status: 400 });
    }

    const url = new URL(request.url);
    const requestedNext = url.searchParams.get('next');
    const next = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/dashboard';
    const redirectTo = `${resolveAppBaseUrl(request)}/auth/callback?next=${encodeURIComponent(next)}`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: rawProvider,
        options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: {
                prompt: 'select_account',
            },
        },
    });

    if (error || !data?.url) {
        const fallbackBaseUrl = resolveAppBaseUrl(request);
        const encodedError = encodeURIComponent(error?.message || 'Failed to initialize OAuth');
        return NextResponse.redirect(`${fallbackBaseUrl}/login?error=${encodedError}`);
    }

    // Resolve the first hop server-side so the browser can go straight to provider login.
    // This avoids direct browser navigation to Supabase /auth/v1/authorize when that domain
    // is flaky/blocked on the client network.
    try {
        const resolved = await fetch(data.url, {
            method: 'GET',
            redirect: 'manual',
            cache: 'no-store',
            headers: {
                accept: 'text/html',
            },
        });

        const providerUrl = resolved.headers.get('location');
        if (providerUrl && providerUrl.startsWith('http')) {
            return NextResponse.redirect(providerUrl);
        }
    } catch {
        // Fall back to the default URL below.
    }

    return NextResponse.redirect(data.url);
}
