'use server';

import { z } from 'zod';
import { insertTrainingRecord } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the data *after* component-side conversion
const recordSchema = z.object({
  employeeId: z.number().int().positive(),
  trainingId: z.number().int().positive(),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)").optional().nullable(),
  score: z.number().optional().nullable(),
  status: z.string().optional().nullable().default('Concluído'),
  // certificatePath: z.string().optional().nullable(), // Add later if needed
  instructorName: z.string().optional().nullable(),
});

type RecordInput = z.infer<typeof recordSchema>;

export async function addTrainingRecord(data: RecordInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = recordSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        employeeId,
        trainingId,
        completionDate,
        expiryDate,
        score,
        status,
        instructorName
    } = validatedData.data;

    // Insert into the database
    const newRecordId = await insertTrainingRecord(
        employeeId,
        trainingId,
        completionDate,
        expiryDate,
        score,
        status,
        null, // certificatePath placeholder
        instructorName
    );

     if (newRecordId === undefined || newRecordId === null) {
        throw new Error('Failed to insert training record, ID not returned.');
     }

    console.log(`Training record added with ID: ${newRecordId}`);

    // Revalidate the path where records are listed
    revalidatePath('/geral/treinamentos'); // Adjust the path if needed

    return { success: true, id: newRecordId };
  } catch (error) {
    console.error('Error adding training record:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar registro de treinamento: ${errorMessage}` };
  }
}
