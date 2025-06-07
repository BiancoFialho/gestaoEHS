
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/cadastro'];
const PROTECTED_ROOT = '/';

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Verificando rota:', request.nextUrl.pathname);
  const session = await verifySession(request);
  const url = request.nextUrl.clone();

  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  if (session && isPublicPath) {
    // Se autenticado e tentando acessar login/cadastro, redirecionar para o dashboard
    console.log('[Middleware] Usuário autenticado tentando acessar rota pública. Redirecionando para /');
    url.pathname = PROTECTED_ROOT;
    return NextResponse.redirect(url);
  }

  if (!session && !isPublicPath) {
    // Se não autenticado e tentando acessar rota protegida, redirecionar para login
    console.log('[Middleware] Usuário não autenticado tentando acessar rota protegida. Redirecionando para /login');
    const originalPath = url.pathname !== '/' ? url.pathname : ''; // Evitar next=/ se for a raiz
    if (originalPath) {
        url.searchParams.set('next', originalPath);
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  console.log('[Middleware] Permissão concedida para:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - picsum.photos (placeholder images)
     * - public assets (como /uploads)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|picsum.photos|uploads).*)',
  ],
};
