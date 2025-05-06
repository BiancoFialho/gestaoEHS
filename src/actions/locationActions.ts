'use server';

import { z } from 'zod';
import { insertLocation } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the form and database structure
const locationSchema = z.object({
  name: z.string().min(2, { message: "Nome do local deve ter pelo menos 2 caracteres." }),
  description: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
});

type LocationInput = z.infer<typeof locationSchema>;

export async function addLocation(data: LocationInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = locationSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { name, description, type, address, contactPerson } = validatedData.data;

    // Insert into the database
    const newLocationId = await insertLocation(
        name,
        description,
        type,
        address,
        contactPerson
    );

     if (newLocationId === undefined || newLocationId === null) {
        throw new Error('Failed to insert location, ID not returned.');
     }

    console.log(`Location added with ID: ${newLocationId}`);

    // Revalidate the path where locations are listed
    revalidatePath('/geral/cadastros'); // Adjust the path if needed

    return { success: true, id: newLocationId };
  } catch (error) {
    console.error('Error adding location:', error);
     // Check if it's a unique constraint error (SQLite specific code)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: locations.name')) {
      return { success: false, error: 'Erro: Já existe um local com este nome.' };
    }
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar local: ${errorMessage}` };
  }
}
