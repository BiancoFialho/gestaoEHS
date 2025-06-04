
'use server';

import { z } from 'zod';
import { insertDocument } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
  console.log("[Action:addDocument] Dados recebidos para adicionar:", data);
  try {
    const validatedData = documentSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addDocument] Falha na validação Zod:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        title, description, category, filePath, version, reviewDate,
        status, jsaId, authorId, ownerDepartment
    } = validatedData.data;
    console.log("[Action:addDocument] Dados validados e formatados para inserção no DB:", validatedData.data);

    const newDocumentId = await insertDocument(
      title, description, category, filePath, version, reviewDate,
      status, jsaId, authorId, ownerDepartment
    );

    if (newDocumentId === undefined || newDocumentId === null) {
        console.error("[Action:addDocument] Falha ao inserir documento no DB, ID não retornado.");
        throw new Error('Falha ao inserir documento, ID não retornado.');
    }

    console.log(`[Action:addDocument] Documento adicionado com sucesso com ID: ${newDocumentId}`);
    revalidatePath('/geral/documentos');
    return { success: true, id: newDocumentId };

  } catch (error) {
    console.error('[Action:addDocument] Erro detalhado ao adicionar documento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao adicionar documento.';
    return { success: false, error: `Erro ao adicionar documento: ${errorMessage}` };
  }
}

    