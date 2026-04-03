import { NextResponse } from 'next/server';
import { resolveAppBaseUrl } from '@/lib/url/base-url';

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

export async function GET(request: Request) {
    const clientId = getGoogleClientId();
    const baseUrl = resolveAppBaseUrl(request);
    if (!clientId) {
        return NextResponse.redirect(
            `${baseUrl}/login?error=${encodeURIComponent('Missing Google OAuth client ID')}`
        );
    }

    const url = new URL(request.url);
    const requestedNext = url.searchParams.get('next');
    const next = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/dashboard';

    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const redirectUri = `${baseUrl}/api/auth/google/direct/callback`;

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'select_account');

    const response = NextResponse.redirect(authUrl.toString());
    const secure = baseUrl.startsWith('https://');
    const cookieOptions = {
        httpOnly: true,
        secure,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 10,
    };

    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, cookieOptions);
    response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, nonce, cookieOptions);
    response.cookies.set(GOOGLE_OAUTH_NEXT_COOKIE, next, cookieOptions);

    return response;
}
