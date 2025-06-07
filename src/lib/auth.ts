
import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server'; // Para o tipo do cookie store

const secretKey = process.env.SESSION_SECRET || "fallback-secret-for-ehs-app-dev-only";
const key = new TextEncoder().encode(secretKey);
export const COOKIE_NAME = 'ehs_session'; // Exportando para uso em authActions

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  expiresAt: Date; // O JWT já lida com expiração, mas podemos manter para referência no payload
}

export async function encrypt(payload: SessionPayload & { exp: number }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt() // iat
    // .setExpirationTime('2h') // exp é definido no payload agora
    .sign(key);
}

export async function decrypt(sessionToken: string): Promise<SessionPayload | null> {
  if (!sessionToken) return null;
  try {
    const { payload } = await jwtVerify(sessionToken, key, {
      algorithms: ['HS256'],
    });
    // Convertendo exp de segundos para Data
    const expiresAt = new Date(payload.exp! * 1000);
    return {
        userId: payload.userId as number,
        email: payload.email as string,
        role: payload.role as string,
        expiresAt: expiresAt
    };
  } catch (error) {
    console.error('Falha ao verificar a sessão (decrypt):', error);
    return null;
  }
}

// verifySession agora espera um cookie store (do middleware) ou o valor do token diretamente.
// Não tenta mais importar 'next/headers'.
export async function verifySessionFromCookieStore(
  cookieStore: NextRequest['cookies'] | { get: (name: string) => { value: string } | undefined }
): Promise<SessionPayload | null> {
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    console.log('[AuthLib] verifySessionFromCookieStore: Nenhum token de sessão encontrado.');
    return null;
  }

  const session = await decrypt(token);

  if (!session || session.expiresAt < new Date()) {
    console.log('[AuthLib] verifySessionFromCookieStore: Sessão inválida ou expirada.');
    // A exclusão do cookie deve ser tratada pela action de logout ou pelo middleware se detectar expiração
    return null;
  }
  return session;
}
