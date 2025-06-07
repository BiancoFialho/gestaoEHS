
'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUserByEmail as dbGetUserByEmail, insertUser as dbInsertUser } from '@/lib/db';
import { encrypt, decrypt, SessionPayload, COOKIE_NAME } from '@/lib/auth'; // encrypt, decrypt, SessionPayload e COOKIE_NAME são de auth.ts
import { cookies } from 'next/headers'; // Importar cookies de next/headers aqui
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Funções de sessão movidas para cá
async function createServerSession(userId: number, email: string, role: string) {
  const expiresAtDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
  const expTimestamp = Math.floor(expiresAtDate.getTime() / 1000); // JWT 'exp' é em segundos

  const sessionPayload: SessionPayload & { exp: number } = {
    userId,
    email,
    role,
    expiresAt: expiresAtDate, // Mantido para referência, mas JWT usa 'exp'
    exp: expTimestamp
  };
  const sessionToken = await encrypt(sessionPayload);

  cookies().set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAtDate,
    sameSite: 'lax',
    path: '/',
  });
  console.log('[AuthActions] Sessão criada para usuário:', email);
}

async function deleteServerSession() {
  cookies().delete(COOKIE_NAME);
  console.log('[AuthActions] Sessão deletada.');
}


const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

export async function loginAction(prevState: any, formData: FormData) {
  console.log('[AuthActions:loginAction] Iniciando login...');
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log('[AuthActions:loginAction] Falha na validação Zod:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Dados de login inválidos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await dbGetUserByEmail(email);
    if (!user) {
      console.log(`[AuthActions:loginAction] Usuário não encontrado: ${email}`);
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    if (!user.is_active) {
      console.log(`[AuthActions:loginAction] Usuário inativo ou pendente de aprovação: ${email}`);
      return { success: false, message: 'Usuário inativo ou pendente de aprovação. Contate o administrador.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log(`[AuthActions:loginAction] Senha incorreta para: ${email}`);
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    await createServerSession(user.id, user.email, user.role || 'user'); // Usar a função local
    console.log(`[AuthActions:loginAction] Login bem-sucedido para: ${email}`);

  } catch (error) {
    console.error('[AuthActions:loginAction] Erro no servidor durante login:', error);
    return { success: false, message: 'Erro no servidor. Tente novamente.' };
  }
  redirect('/');
}


const registerSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email({ message: "E-mail inválido." }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });


export async function registerAction(prevState: any, formData: FormData) {
  console.log('[AuthActions:registerAction] Iniciando registro...');
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.log('[AuthActions:registerAction] Falha na validação Zod:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Dados de registro inválidos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await dbGetUserByEmail(email);
    if (existingUser) {
      console.log(`[AuthActions:registerAction] E-mail já cadastrado: ${email}`);
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUserId = await dbInsertUser(name, email, passwordHash, 'user', false); // is_active = false

    if (!newUserId) {
      console.error('[AuthActions:registerAction] Falha ao inserir usuário no DB.');
      return { success: false, message: 'Erro ao registrar usuário. Tente novamente.' };
    }

    console.log(`[AuthActions:registerAction] Usuário registrado com sucesso (ID: ${newUserId}, Email: ${email}). Aguardando aprovação.`);
    revalidatePath('/geral/usuarios');
    return { success: true, message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.' };

  } catch (error) {
    console.error('[AuthActions:registerAction] Erro no servidor durante registro:', error);
    return { success: false, message: 'Erro no servidor. Tente novamente.' };
  }
}


export async function logoutAction() {
  console.log('[AuthActions:logoutAction] Iniciando logout...');
  await deleteServerSession(); // Usar a função local
  redirect('/login');
}
