
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionFromCookieStore } from '@/lib/auth'; // Renomeado para clareza

const PUBLIC_PATHS = ['/login', '/cadastro'];
const PROTECTED_ROOT = '/';

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Verificando rota:', request.nextUrl.pathname);
  // Passar request.cookies para a função de verificação de sessão
  const session = await verifySessionFromCookieStore(request.cookies);
  const url = request.nextUrl.clone();

  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  if (session && isPublicPath) {
    console.log('[Middleware] Usuário autenticado tentando acessar rota pública. Redirecionando para /');
    url.pathname = PROTECTED_ROOT;
    return NextResponse.redirect(url);
  }

  if (!session && !isPublicPath) {
    console.log('[Middleware] Usuário não autenticado tentando acessar rota protegida. Redirecionando para /login');
    const originalPath = url.pathname !== '/' ? url.pathname : '';
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
    '/((?!api|_next/static|_next/image|favicon.ico|picsum.photos|uploads).*)',
  ],
};
