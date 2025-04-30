
'use server';

import { z } from 'zod';
import { insertEmployee } from '@/lib/db';
import { revalidatePath } from 'next/cache'; // To refresh data on the page

// Schema matching the form and database structure (adjust if needed)
const employeeSchema = z.object({
  name: z.string().min(2),
  role: z.string().optional(),
  department: z.string().optional(),
  // Add other fields from your form/db if necessary, e.g., hire_date
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

    const { name, role, department } = validatedData.data;

    // Insert into the database
    const newEmployeeId = await insertEmployee(name, role, department); // Pass optional fields

     if (newEmployeeId === undefined || newEmployeeId === null) {
        throw new Error('Failed to insert employee, ID not returned.');
     }

    console.log(`Employee added with ID: ${newEmployeeId}`);

    // Revalidate the path where employees are listed to show the new data
    revalidatePath('/geral/cadastros'); // Adjust the path if needed

    return { success: true, id: newEmployeeId };
  } catch (error) {
    console.error('Error adding employee:', error);
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar funcionário: ${errorMessage}` };
  }
}
