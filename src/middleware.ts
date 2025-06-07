
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { verifySessionFromCookieStore } from '@/lib/auth'; // Comentado para desabilitar auth

// const PUBLIC_PATHS = ['/login', '/cadastro']; // Comentado
// const PROTECTED_ROOT = '/'; // Comentado

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Autenticação temporariamente desabilitada. Permitindo acesso para:', request.nextUrl.pathname);
  
  // Comentar toda a lógica de autenticação e redirecionamento
  /*
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
  */
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|picsum.photos|uploads).*)',
  ],
};

