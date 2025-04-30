
'use server';

import { z } from 'zod';
import { insertTraining } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the form and database structure
const courseSchema = z.object({
  courseName: z.string().min(3),
  description: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  durationHours: z.number().int().positive().optional().nullable(),
  frequencyMonths: z.number().int().nonnegative().optional().nullable(),
});

type CourseInput = z.infer<typeof courseSchema>;

export async function addTraining(data: CourseInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = courseSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { courseName, description, provider, durationHours, frequencyMonths } = validatedData.data;

    // Insert into the database
    const newTrainingId = await insertTraining(
        courseName,
        description,
        provider,
        durationHours,
        frequencyMonths
    );

    if (newTrainingId === undefined || newTrainingId === null) {
        throw new Error('Failed to insert training course, ID not returned.');
    }

    console.log(`Training course added with ID: ${newTrainingId}`);

    // Revalidate the path where courses are listed
    revalidatePath('/geral/treinamentos'); // Adjust the path if needed

    return { success: true, id: newTrainingId };
  } catch (error) {
    console.error('Error adding training course:', error);
     if (error instanceof Error && error.message.includes('UNIQUE constraint failed: trainings.course_name')) {
      return { success: false, error: 'Erro: Já existe um curso com este nome.' };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar curso: ${errorMessage}` };
  }
}
