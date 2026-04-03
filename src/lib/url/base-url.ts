export function resolveAppBaseUrl(request: Request): string {
    const url = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const requestBaseUrl = forwardedHost
        ? `${forwardedProto || 'https'}://${forwardedHost}`
        : url.origin;

    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!configured || !configured.startsWith('http')) {
        return requestBaseUrl;
    }

    // In production, never trust a localhost app URL because it breaks deployed redirects.
    if (process.env.NODE_ENV === 'production') {
        try {
            const configuredHost = new URL(configured).hostname;
            if (configuredHost === 'localhost' || configuredHost === '127.0.0.1') {
                return requestBaseUrl;
            }
        } catch {
            return requestBaseUrl;
        }
    }

    return configured.replace(/\/$/, '');
}
