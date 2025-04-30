
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_KEY = 'ehs_control_auth'; // Ensure this matches AuthContext

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get(AUTH_KEY)?.value === 'true';
  const url = request.nextUrl.clone();

  // If trying to access login page while authenticated, redirect to home
  if (isAuthenticated && url.pathname === '/login') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If trying to access protected routes (anything other than login) while not authenticated, redirect to login
  if (!isAuthenticated && url.pathname !== '/login') {
    // Preserve the original path as a query parameter for potential redirection after login
    // Example: /some/protected/path -> /login?next=/some/protected/path
    // url.searchParams.set('next', url.pathname); // Uncomment if you want redirect after login feature
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Allow the request to proceed if none of the above conditions are met
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - picsum.photos (placeholder images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|picsum.photos).*)',
  ],
};

    