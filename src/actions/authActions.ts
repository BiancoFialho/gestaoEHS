
'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUserByEmail as dbGetUserByEmail, insertUser as dbInsertUser } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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

    await createSession(user.id, user.email, user.role || 'user');
    console.log(`[AuthActions:loginAction] Login bem-sucedido para: ${email}`);
    // O redirecionamento será tratado no lado do cliente ou pelo middleware
    // Para Server Actions, o redirect deve ser chamado fora do try/catch ou no final da action
  } catch (error) {
    console.error('[AuthActions:loginAction] Erro no servidor durante login:', error);
    return { success: false, message: 'Erro no servidor. Tente novamente.' };
  }
  redirect('/'); // Redireciona para o dashboard após login bem-sucedido
}


const registerSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email({ message: "E-mail inválido." }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // Path of the error
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

    // Novos usuários são cadastrados como inativos (is_active = 0)
    // e com role 'user' por padrão
    const newUserId = await dbInsertUser(name, email, passwordHash, 'user', false);

    if (!newUserId) {
      console.error('[AuthActions:registerAction] Falha ao inserir usuário no DB.');
      return { success: false, message: 'Erro ao registrar usuário. Tente novamente.' };
    }

    console.log(`[AuthActions:registerAction] Usuário registrado com sucesso (ID: ${newUserId}, Email: ${email}). Aguardando aprovação.`);
    // Não cria sessão aqui, usuário precisa ser aprovado
    revalidatePath('/geral/usuarios'); // Para admin ver o novo usuário na lista
    return { success: true, message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.' };

  } catch (error) {
    console.error('[AuthActions:registerAction] Erro no servidor durante registro:', error);
    return { success: false, message: 'Erro no servidor. Tente novamente.' };
  }
}


export async function logoutAction() {
  console.log('[AuthActions:logoutAction] Iniciando logout...');
  await deleteSession();
  redirect('/login');
}
