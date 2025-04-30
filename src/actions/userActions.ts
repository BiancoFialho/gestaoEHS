'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing
import { insertUser, getUserByEmail } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the form
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6), // Password received from form
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

type UserInput = z.infer<typeof userSchema>;

export async function addUser(data: UserInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate basic data using Zod schema on the server-side
    const validatedData = userSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { name, email, password, role, isActive } = validatedData.data;

    // Check if user with this email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'Erro: Já existe um usuário com este e-mail.' };
    }

    // **Hash the password** before saving
    const saltRounds = 10; // Adjust salt rounds as needed for security/performance balance
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert into the database with the hashed password
    const newUserId = await insertUser(
        name,
        email,
        passwordHash, // Use the hashed password
        role,
        isActive
    );

     if (newUserId === undefined || newUserId === null) {
        throw new Error('Failed to insert user, ID not returned.');
     }

    console.log(`User added with ID: ${newUserId}`);

    // Revalidate the path where users are listed
    revalidatePath('/geral/usuarios'); // Adjust the path if needed

    return { success: true, id: newUserId };
  } catch (error) {
    console.error('Error adding user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar usuário: ${errorMessage}` };
  }
}

