
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa } from '@/lib/db'; // Assuming db function is named dbInsertJsa
import { revalidatePath } from 'next/cache';

// Schema matching the JSA data (without steps for initial creation)
const jsaBaseSchema = z.object({
  task: z.string().min(5),
  locationId: z.number().int().positive().optional().nullable(),
  department: z.string().optional().nullable(),
  responsiblePersonId: z.number().int().positive().optional().nullable(),
  teamMembers: z.string().optional().nullable(),
  requiredPpe: z.string().optional().nullable(),
  status: z.string().optional(),
  reviewDate: z.string().optional().nullable(), // Expecting formatted date string or null
});

// Schema for a single step (used internally)
const jsaStepSchema = z.object({
    step_order: z.number().int().positive(),
    description: z.string().min(3),
    hazards: z.string().min(3),
    controls: z.string().min(3),
});

// Input type for the server action (includes steps, although they might be empty initially)
const jsaInputSchema = jsaBaseSchema.extend({
    steps: z.array(jsaStepSchema).optional().default([]),
});


type JsaInput = z.infer<typeof jsaInputSchema>;
type JsaStepInput = z.infer<typeof jsaStepSchema>;

export async function addJsa(data: JsaInput, stepsData: JsaStepInput[]): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = jsaInputSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("JSA Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

     // Extract validated base JSA data
    const jsaBaseData = {
      task: validatedData.data.task,
      locationId: validatedData.data.locationId ?? undefined, // Use undefined if null
      department: validatedData.data.department,
      responsiblePersonId: validatedData.data.responsiblePersonId ?? undefined,
      teamMembers: validatedData.data.teamMembers,
      requiredPpe: validatedData.data.requiredPpe,
      status: validatedData.data.status ?? 'Rascunho',
      reviewDate: validatedData.data.reviewDate ?? undefined,
    };

    // Validate steps data separately (although it might be empty)
    const validatedSteps = z.array(jsaStepSchema).safeParse(stepsData);
     if (!validatedSteps.success) {
       console.error("JSA Steps Validation failed:", validatedSteps.error.errors);
       const errorMessages = validatedSteps.error.errors.map(e => `Passo[${e.path[0]}].${e.path[1]}: ${e.message}`).join(', ');
       return { success: false, error: `Dados dos passos inválidos: ${errorMessages}` };
     }

    // Insert into the database using the db function
    const newJsaId = await dbInsertJsa(jsaBaseData, validatedSteps.data);

    if (newJsaId === undefined || newJsaId === null) {
        throw new Error('Failed to insert JSA, ID not returned.');
    }

    console.log(`JSA added with ID: ${newJsaId}`);

    // Revalidate the path where JSAs are listed
    revalidatePath('/seguranca-trabalho/inventario-jsa'); // Adjust the path if needed

    return { success: true, id: newJsaId };
  } catch (error) {
    console.error('Error adding JSA:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar JSA: ${errorMessage}` };
  }
}
