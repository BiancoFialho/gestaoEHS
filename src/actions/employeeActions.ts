
'use server';

import { z } from 'zod';
import { insertEmployee } from '@/lib/db';
import { revalidatePath } from 'next/cache'; // To refresh data on the page

const employeeSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  role: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de admissão inválido (YYYY-MM-DD)").optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de nascimento inválido (YYYY-MM-DD)").optional().nullable(),
  rg: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

export async function addEmployee(data: EmployeeInput): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:addEmployee] Dados recebidos para adicionar:", data);
  try {
    const validatedData = employeeSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addEmployee] Falha na validação Zod:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { name, role, department, hireDate, birthDate, rg, cpf, phone, address } = validatedData.data;
    console.log("[Action:addEmployee] Dados validados e formatados para inserção no DB:", { name, role, department, hireDate, birthDate, rg, cpf, phone, address });

    const newEmployeeId = await insertEmployee(
        name,
        role,
        department,
        hireDate,
        birthDate,
        rg,
        cpf,
        phone,
        address
    );

     if (newEmployeeId === undefined || newEmployeeId === null) {
        console.error("[Action:addEmployee] Falha ao inserir funcionário no DB, ID não retornado.");
        throw new Error('Falha ao inserir funcionário, ID não retornado.');
     }

    console.log(`[Action:addEmployee] Funcionário adicionado com sucesso com ID: ${newEmployeeId}`);
    revalidatePath('/geral/cadastros');
    return { success: true, id: newEmployeeId };

  } catch (error) {
    console.error('[Action:addEmployee] Erro detalhado ao adicionar funcionário:', error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: employees.cpf')) {
      return { success: false, error: 'Erro: Já existe um funcionário com este CPF.' };
    }
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao adicionar funcionário.';
    return { success: false, error: `Erro ao adicionar funcionário: ${errorMessage}` };
  }
}

    