
'use server';

import { z } from 'zod';
import { insertTrainingRecord } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Dates are expected as 'yyyy-MM-dd' from the TrainingRecordDialog after parsing
const recordSchema = z.object({
  employeeId: z.number().int().positive(),
  trainingId: z.number().int().positive(),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de conclusão inválido (YYYY-MM-DD)"),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de vencimento inválido (YYYY-MM-DD)").optional().nullable(),
  score: z.number().optional().nullable(),
  status: z.string().optional().nullable().default('Concluído'),
  instructorName: z.string().optional().nullable(),
});

type RecordInput = z.infer<typeof recordSchema>;

export async function addTrainingRecord(data: RecordInput): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:addTrainingRecord] Recebido para adicionar:", data);
  try {
    const validatedData = recordSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addTrainingRecord] Falha na validação:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        employeeId, trainingId, completionDate, expiryDate,
        score, status, instructorName
    } = validatedData.data;
    console.log("[Action:addTrainingRecord] Dados validados para inserção no DB:", validatedData.data);

    const newRecordId = await insertTrainingRecord(
        employeeId, trainingId, completionDate, expiryDate,
        score, status, null, instructorName // certificatePath placeholder
    );

     if (newRecordId === undefined || newRecordId === null) {
        console.error("[Action:addTrainingRecord] Falha ao inserir no DB, ID não retornado.");
        throw new Error('Failed to insert training record, ID not returned.');
     }

    console.log(`[Action:addTrainingRecord] Registro de treinamento adicionado com ID: ${newRecordId}`);
    revalidatePath('/geral/treinamentos');
    return { success: true, id: newRecordId };

  } catch (error) {
    console.error('[Action:addTrainingRecord] Erro ao adicionar registro de treinamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar registro de treinamento: ${errorMessage}` };
  }
}

    