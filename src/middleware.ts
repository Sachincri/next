import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('jwt')?.value || request.cookies.get('auth-token')?.value;

    const pathname = request.nextUrl.pathname;

    const isAuthPage = pathname.startsWith('/login') ||
        pathname.startsWith('/signup');

    const protectedRoutes = ['/admin', '/me', '/shipping', '/payment', '/order', '/wishlist', '/order-summary'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    const response = NextResponse.next();

    // Security Headers
    // response.headers.set('X-Middleware-Debug', 'true');

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Next-CSP', 'active');

    // Content Security Policy origin resolution
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    let serverOrigin = 'http://localhost:5000';
    try {
        serverOrigin = new URL(serverUrl).origin;
    } catch (e) {
        // Fallback
    }

    // Enhanced Permissions-Policy for social media embeds
    const permissionsPolicy = [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'autoplay=(self "https://www.instagram.com" "https://*.instagram.com" "https://www.tiktok.com" "https://*.tiktok.com" "https://www.youtube.com" "https://*.youtube.com")',
        'encrypted-media=(self "https://www.instagram.com" "https://*.instagram.com" "https://www.tiktok.com" "https://*.tiktok.com" "https://www.youtube.com" "https://*.youtube.com")',
        'picture-in-picture=(self "https://www.instagram.com" "https://*.instagram.com" "https://www.tiktok.com" "https://*.tiktok.com" "https://www.youtube.com" "https://*.youtube.com")',
        'fullscreen=(self "https://www.instagram.com" "https://*.instagram.com" "https://www.tiktok.com" "https://*.tiktok.com" "https://www.youtube.com" "https://*.youtube.com")'
    ].join(', ');
    response.headers.set('Permissions-Policy', permissionsPolicy);

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://js.stripe.com https://www.instagram.com https://*.instagram.com https://*.cdninstagram.com https://www.tiktok.com https://*.tiktok.com https://www.youtube.com https://s.ytimg.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.instagram.com https://*.instagram.com;
        img-src 'self' blob: data: https://res.cloudinary.com https://*.cloudinary.com https://*.razorpay.com https://*.instagram.com https://*.fbcdn.net https://*.tiktok.com https://*.ytimg.com https://*.googleusercontent.com;
        media-src 'self' blob: data: https://res.cloudinary.com https://*.cloudinary.com https://*.instagram.com https://*.tiktok.com;
        font-src 'self' https://fonts.gstatic.com;
        frame-src 'self' https://api.razorpay.com https://js.stripe.com https://www.instagram.com https://*.instagram.com https://www.tiktok.com https://*.tiktok.com https://www.youtube.com https://*.youtube.com https://www.youtube-nocookie.com;
        child-src 'self' blob: https://www.instagram.com https://*.instagram.com https://www.tiktok.com https://*.tiktok.com https://www.youtube.com https://*.youtube.com;
        connect-src 'self' ${serverOrigin} https://api.razorpay.com https://*.instagram.com https://*.tiktok.com;
        frame-ancestors 'self';
    `.replace(/\s{2,}/g, ' ').trim();
    response.headers.set('Content-Security-Policy', cspHeader);


    // Redirect to login if accessing protected route without token
    if (isProtectedRoute && !token) {
        if (pathname.startsWith('/me')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to profile if accessing auth pages with valid token
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/me', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (static files)
         * - .svg, .png, .jpg, .jpeg, .gif, .webp (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico|csv|docx?|xlsx?|zip|pdf)$).*)',
    ],
};
