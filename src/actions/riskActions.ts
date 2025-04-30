
'use server';

import { z } from 'zod';
import { insertRisk } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the data *after* component-side conversion
const riskSchema = z.object({
  description: z.string().min(5),
  locationId: z.number().int().positive().optional(),
  activity: z.string().optional().nullable(),
  hazardType: z.string().optional().nullable(),
  probability: z.number().int().min(1).max(5).optional(),
  severity: z.number().int().min(1).max(5).optional(),
  controlMeasures: z.string().optional().nullable(),
  responsiblePersonId: z.number().int().positive().optional(),
  status: z.string().optional(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)").optional(),
});

type RiskInput = z.infer<typeof riskSchema>;

export async function addRisk(data: RiskInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = riskSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        description,
        probability,
        severity,
        locationId,
        activity,
        hazardType,
        controlMeasures,
        responsiblePersonId,
        reviewDate
     } = validatedData.data;

     // Probability and severity are required to calculate risk level in the DB function
     if (probability === undefined || severity === undefined) {
        return { success: false, error: 'Probabilidade e Severidade são necessárias para calcular o nível de risco.' };
     }

    // Insert into the database
    const newRiskId = await insertRisk(
        description,
        probability, // Pass the validated number
        severity,    // Pass the validated number
        locationId,
        activity ?? undefined, // Pass undefined if null/empty
        hazardType ?? undefined,
        controlMeasures ?? undefined,
        responsiblePersonId,
        reviewDate
    );

    if (newRiskId === undefined || newRiskId === null) {
        throw new Error('Failed to insert risk, ID not returned.');
    }

    console.log(`Risk added with ID: ${newRiskId}`);

    // Revalidate the path where risks are listed
    revalidatePath('/seguranca-trabalho/analise-riscos'); // Adjust path if needed

    return { success: true, id: newRiskId };
  } catch (error) {
    console.error('Error adding risk:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar risco: ${errorMessage}` };
  }
}
