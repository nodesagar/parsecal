import { createClient } from '@/lib/supabase/server';
import { resolveAppBaseUrl } from '@/lib/url/base-url';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
const GOOGLE_OAUTH_NONCE_COOKIE = 'google_oauth_nonce';
const GOOGLE_OAUTH_NEXT_COOKIE = 'google_oauth_next';

function getGoogleClientId(): string | null {
    return (
        process.env.GOOGLE_CALENDAR_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        null
    );
}

function getGoogleClientSecret(): string | null {
    return (
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        null
    );
}

function clearOAuthCookies(response: NextResponse) {
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    response.cookies.delete(GOOGLE_OAUTH_NONCE_COOKIE);
    response.cookies.delete(GOOGLE_OAUTH_NEXT_COOKIE);
}

export async function GET(request: Request) {
    const baseUrl = resolveAppBaseUrl(request);
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const oauthError = url.searchParams.get('error');
    const oauthErrorDescription = url.searchParams.get('error_description');

    if (oauthError || oauthErrorDescription) {
        const message = oauthErrorDescription || oauthError || 'google_oauth_error';
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(message)}`);
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent('Missing Google OAuth code or state')}`
        );
    }

    const cookieStore = await cookies();
    const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
    const nonce = cookieStore.get(GOOGLE_OAUTH_NONCE_COOKIE)?.value || undefined;
    const storedNext = cookieStore.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value;
    const next = storedNext && storedNext.startsWith('/') ? storedNext : '/dashboard';

    if (!expectedState || expectedState !== state) {
        const response = NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent('Invalid OAuth state. Please retry.')}`
        );
        clearOAuthCookies(response);
        return response;
    }

    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    if (!clientId || !clientSecret) {
        const response = NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent('Missing Google OAuth credentials')}`
        );
        clearOAuthCookies(response);
        return response;
    }

    const redirectUri = `${baseUrl}/api/auth/google/direct/callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
        cache: 'no-store',
    });

    const tokenData = await tokenResponse.json().catch(() => null) as {
        id_token?: string;
        access_token?: string;
        error?: string;
        error_description?: string;
    } | null;

    if (!tokenResponse.ok || !tokenData?.id_token) {
        const message =
            tokenData?.error_description ||
            tokenData?.error ||
            'Failed to exchange Google authorization code';
        const response = NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent(message)}`
        );
        clearOAuthCookies(response);
        return response;
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokenData.id_token,
        access_token: tokenData.access_token,
        nonce,
    });

    if (signInError) {
        const response = NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent(signInError.message)}`
        );
        clearOAuthCookies(response);
        return response;
    }

    const response = NextResponse.redirect(`${baseUrl}${next}`);
    clearOAuthCookies(response);
    return response;
}
