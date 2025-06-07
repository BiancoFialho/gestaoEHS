
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET || "fallback-secret-for-ehs-app-dev-only"; // Use environment variable
const key = new TextEncoder().encode(secretKey);
const COOKIE_NAME = 'ehs_session';

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // Expiration time: 2 hours from now
    .sign(key);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function createSession(userId: number, email: string, role: string) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const sessionPayload: SessionPayload = { userId, email, role, expiresAt };
  const session = await encrypt(sessionPayload);

  cookies().set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
  console.log('[AuthLib] Session created for user:', email);
}

export async function verifySession(request?: NextRequest): Promise<SessionPayload | null> {
  const cookieStore = request ? request.cookies : cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    console.log('[AuthLib] No session token found.');
    return null;
  }
  const session = await decrypt(token);
  if (!session || new Date(session.expiresAt) < new Date()) {
    console.log('[AuthLib] Session invalid or expired.');
    await deleteSession(); // Clean up expired cookie
    return null;
  }
  return session;
}


export async function deleteSession() {
  cookies().delete(COOKIE_NAME);
  console.log('[AuthLib] Session deleted.');
}
