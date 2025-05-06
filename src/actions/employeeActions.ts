'use server';

import { z } from 'zod';
import { insertEmployee } from '@/lib/db';
import { revalidatePath } from 'next/cache'; // To refresh data on the page

// Schema matching the form and database structure
const employeeSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  role: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(), // Expecting 'YYYY-MM-DD' or null
  birthDate: z.string().optional().nullable(), // Expecting 'YYYY-MM-DD' or null
  rg: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(), // Add CPF validation if needed (e.g., regex)
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

export async function addEmployee(data: EmployeeInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = employeeSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      // Flatten errors for a simpler message
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { name, role, department, hireDate, birthDate, rg, cpf, phone, address } = validatedData.data;

    // Insert into the database
    const newEmployeeId = await insertEmployee(
        name,
        role,
        department,
        hireDate, // Pass as string or null
        birthDate, // Pass as string or null
        rg,
        cpf,
        phone,
        address
    );

     if (newEmployeeId === undefined || newEmployeeId === null) {
        throw new Error('Failed to insert employee, ID not returned.');
     }

    console.log(`Employee added with ID: ${newEmployeeId}`);

    // Revalidate the path where employees are listed to show the new data
    revalidatePath('/geral/cadastros'); // Adjust the path if needed

    return { success: true, id: newEmployeeId };
  } catch (error) {
    console.error('Error adding employee:', error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: employees.cpf')) {
      return { success: false, error: 'Erro: Já existe um funcionário com este CPF.' };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar funcionário: ${errorMessage}` };
  }
}
