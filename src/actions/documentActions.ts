
'use server';

import { z } from 'zod';
import { insertDocument } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Dates are expected as 'yyyy-MM-dd' from the DocumentDialog after parsing
const documentSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres." }),
  category: z.string().optional().nullable(),
  version: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  filePath: z.string().optional().nullable(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de revisão inválido (YYYY-MM-DD)").optional().nullable(),
  authorId: z.number().int().positive().optional().nullable(),
  ownerDepartment: z.string().optional().nullable(),
  jsaId: z.number().int().positive().optional().nullable(),
});

type DocumentInput = z.infer<typeof documentSchema>;

export async function addDocument(data: DocumentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:addDocument] Recebido para adicionar:", data);
  try {
    const validatedData = documentSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addDocument] Falha na validação:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        title, description, category, filePath, version, reviewDate,
        status, jsaId, authorId, ownerDepartment
    } = validatedData.data;
    console.log("[Action:addDocument] Dados validados para inserção no DB:", validatedData.data);

    // TODO: Handle actual file upload here if necessary.
    // For now, filePath comes directly from the form (manual input).

    const newDocumentId = await insertDocument(
      title, description, category, filePath, version, reviewDate,
      status, jsaId, authorId, ownerDepartment
    );

    if (newDocumentId === undefined || newDocumentId === null) {
        console.error("[Action:addDocument] Falha ao inserir no DB, ID não retornado.");
        throw new Error('Failed to insert document, ID not returned.');
    }

    console.log(`[Action:addDocument] Documento adicionado com ID: ${newDocumentId}`);
    revalidatePath('/geral/documentos');
    return { success: true, id: newDocumentId };

  } catch (error) {
    console.error('[Action:addDocument] Erro ao adicionar documento:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar documento: ${errorMessage}` };
  }
}

    