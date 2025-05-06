
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa } from '@/lib/db'; // Assuming db function is named dbInsertJsa
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises'; // Use promises API for fs operations

// Schema matching the JSA data (without steps for initial creation)
const jsaBaseSchema = z.object({
  task: z.string().min(5),
  locationId: z.number().int().positive().optional().nullable(),
  department: z.string().optional().nullable(),
  responsiblePersonId: z.number().int().positive().optional().nullable(),
  teamMembers: z.string().optional().nullable(),
  requiredPpe: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  reviewDate: z.string().optional().nullable(), // Expecting formatted date string or null
  attachmentPath: z.string().optional().nullable(), // Added for type consistency
  // Attachment field is handled separately via FormData
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
    // Add file information if needed directly in schema, though FormData is often separate
});


export type JsaInput = z.infer<typeof jsaInputSchema>; // Exporting the Zod-derived type
type JsaStepInput = z.infer<typeof jsaStepSchema>;

const NONE_SELECT_VALUE = "__NONE__"; // Ensure this matches the client-side constant

// Updated function to accept FormData
export async function addJsaWithAttachment(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    const file = formData.get('attachment') as File | null;
    let attachmentPath: string | null = null;
    let fileSaveError: string | null = null;

    // --- File Handling ---
    if (file && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await fs.mkdir(uploadsDir, { recursive: true });
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const safeFilename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const filePath = path.join(uploadsDir, safeFilename);
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(filePath, buffer);
            attachmentPath = `/uploads/${safeFilename}`; // Relative path for serving
            console.log(`File saved successfully: ${attachmentPath}`);
        } catch (uploadError) {
            console.error('Error saving file:', uploadError);
            fileSaveError = 'Erro ao salvar o anexo.';
        }
    } else {
        console.log("No attachment provided or file is empty.");
    }

    // --- JSA Data Handling ---
    const locationIdString = formData.get('locationId') as string | null;
    const responsiblePersonIdString = formData.get('responsiblePersonId') as string | null;

    // Construct jsaDataFromForm based on JsaInput type (derived from Zod schema)
    const jsaDataForDb: JsaInput = {
        task: formData.get('task') as string,
        locationId: (locationIdString && locationIdString !== NONE_SELECT_VALUE) ? parseInt(locationIdString, 10) : null,
        department: formData.get('department') as string | null || null, // Ensure null if empty
        responsiblePersonId: (responsiblePersonIdString && responsiblePersonIdString !== NONE_SELECT_VALUE) ? parseInt(responsiblePersonIdString, 10) : null,
        teamMembers: formData.get('teamMembers') as string | null || null, // Ensure null if empty
        requiredPpe: formData.get('requiredPpe') as string | null || null, // Ensure null if empty
        status: formData.get('status') as string | null || 'Rascunho', // Ensure default if null
        reviewDate: formData.get('reviewDate') as string | null || null, // Ensure null if empty
        attachmentPath: attachmentPath, // Use the determined attachmentPath
        steps: [], // Assuming steps are not sent via this form for simplicity now
    };


     // Basic validation (can be more robust with Zod if needed)
     if (!jsaDataForDb.task || jsaDataForDb.task.length < 5) {
        return { success: false, error: 'Tarefa inválida. Deve ter pelo menos 5 caracteres.' };
    }

    try {
        // Pass the structured data and steps to dbInsertJsa
        const newJsaId = await dbInsertJsa(
            jsaDataForDb,
            jsaDataForDb.steps || [] // Ensure steps is an array
        );

        if (newJsaId === undefined || newJsaId === null) {
            throw new Error('Failed to insert JSA, ID not returned.');
        }

        console.log(`JSA added with ID: ${newJsaId}`);

        revalidatePath('/seguranca-trabalho/inventario-jsa');

        const successMessage = fileSaveError
            ? `JSA adicionada (ID: ${newJsaId}), mas houve um erro ao salvar o anexo: ${fileSaveError}`
            : `JSA adicionada com sucesso (ID: ${newJsaId}).`;

        return { success: true, id: newJsaId, /* message: successMessage */ };

    } catch (error) {
        console.error('Error adding JSA:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao adicionar JSA: ${errorMessage}` };
    }
}

