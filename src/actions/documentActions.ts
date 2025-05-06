'use server';

import { z } from 'zod';
import { insertDocument } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the form and database structure
const documentSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres." }),
  category: z.string().optional().nullable(),
  version: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  filePath: z.string().optional().nullable(), // Path or URL
  reviewDate: z.string().optional().nullable(), // Expecting 'YYYY-MM-DD' or null
  authorId: z.number().int().positive().optional().nullable(),
  ownerDepartment: z.string().optional().nullable(),
  jsaId: z.number().int().positive().optional().nullable(), // Keep this if needed
});

type DocumentInput = z.infer<typeof documentSchema>;

export async function addDocument(data: DocumentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = documentSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        title,
        description,
        category,
        filePath,
        version,
        reviewDate,
        status,
        jsaId,
        authorId,
        ownerDepartment
    } = validatedData.data;

    // TODO: Handle actual file upload here if necessary.

    // Insert metadata into the database
    const newDocumentId = await insertDocument(
      title,
      description,
      category,
      filePath,
      version,
      reviewDate,
      status,
      jsaId,
      authorId,
      ownerDepartment
    );

    if (newDocumentId === undefined || newDocumentId === null) {
        throw new Error('Failed to insert document, ID not returned.');
    }

    console.log(`Document added with ID: ${newDocumentId}`);

    // Revalidate the path where documents are listed
    revalidatePath('/geral/documentos'); // Adjust the path if needed

    return { success: true, id: newDocumentId };
  } catch (error) {
    console.error('Error adding document:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar documento: ${errorMessage}` };
  }
}
