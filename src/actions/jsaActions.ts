
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa } from '@/lib/db'; // Assuming db function is named dbInsertJsa
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises'; // Use promises API for fs operations

// Schema matching the JSA data (without steps for initial creation)
// This schema is for the data extracted from FormData, not directly for the form component.
const jsaBaseSchema = z.object({
  task: z.string().min(5, "A tarefa deve ter pelo menos 5 caracteres."),
  locationId: z.coerce.number().int().positive().optional().nullable(),
  department: z.string().optional().nullable(),
  responsiblePersonId: z.coerce.number().int().positive().optional().nullable(),
  teamMembers: z.string().optional().nullable(),
  requiredPpe: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  reviewDate: z.string().optional().nullable(), // Expecting formatted date string or null
  attachmentPath: z.string().optional().nullable(), // Added for type consistency
});

// Schema for a single step (used internally)
const jsaStepSchema = z.object({
    step_order: z.number().int().positive(),
    description: z.string().min(3),
    hazards: z.string().min(3),
    controls: z.string().min(3),
});

// Input type for the server action (includes steps, although they might be empty initially)
// This is the type expected by dbInsertJsa
export type JsaInput = z.infer<typeof jsaBaseSchema> & { steps?: JsaStepInput[] };
type JsaStepInput = z.infer<typeof jsaStepSchema>;

const NONE_SELECT_VALUE = "__NONE__"; // Ensure this matches the client-side constant

// Updated function to accept FormData
export async function addJsaWithAttachment(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    console.log("addJsaWithAttachment received FormData:");
    for (let [key, value] of formData.entries()) {
        console.log(`FormData Entry - ${key}: ${value instanceof File ? value.name : value}`);
    }

    const file = formData.get('attachment') as File | null;
    let attachmentPath: string | null = null;
    let fileSaveError: string | null = null;

    // --- File Handling ---
    if (file && file.size > 0) {
        console.log("Attachment found:", file.name, file.size, "bytes");
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
            fileSaveError = `Erro ao salvar o anexo: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`;
        }
    } else {
        console.log("No attachment provided or file is empty.");
    }

    // --- JSA Data Handling ---
    const task = formData.get('task') as string;
    const locationIdString = formData.get('locationId') as string | null;
    const department = formData.get('department') as string | null;
    const responsiblePersonIdString = formData.get('responsiblePersonId') as string | null;
    const teamMembers = formData.get('teamMembers') as string | null;
    const requiredPpe = formData.get('requiredPpe') as string | null;
    const status = formData.get('status') as string | null;
    const reviewDate = formData.get('reviewDate') as string | null;

    const jsaDataForValidation = {
        task: task,
        locationId: (locationIdString && locationIdString !== NONE_SELECT_VALUE && locationIdString !== "") ? parseInt(locationIdString, 10) : null,
        department: department || null,
        responsiblePersonId: (responsiblePersonIdString && responsiblePersonIdString !== NONE_SELECT_VALUE && responsiblePersonIdString !== "") ? parseInt(responsiblePersonIdString, 10) : null,
        teamMembers: teamMembers || null,
        requiredPpe: requiredPpe || null,
        status: status || 'Rascunho',
        reviewDate: reviewDate || null,
        attachmentPath: attachmentPath, // Use the determined attachmentPath
    };

    console.log("Data for validation (jsaDataForValidation):", jsaDataForValidation);

    // Validate data using Zod schema on the server-side
    const validatedResult = jsaBaseSchema.safeParse(jsaDataForValidation);
    if (!validatedResult.success) {
      console.error("Validation failed (addJsaWithAttachment):", validatedResult.error.errors);
      const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const validatedData: JsaInput = {
        ...validatedResult.data,
        steps: [], // Assuming steps are not sent via this form for simplicity now
    };

    console.log("Validated data to be passed to dbInsertJsa:", validatedData);

    try {
        // Pass the validated data and steps to dbInsertJsa
        const newJsaId = await dbInsertJsa(
            validatedData, // Pass the validated data object which includes attachmentPath
            validatedData.steps || [] // Ensure steps is an array (even if empty)
        );

        if (newJsaId === undefined || newJsaId === null) {
            throw new Error('Falha ao inserir JSA, ID não retornado.');
        }

        console.log(`JSA adicionada com ID: ${newJsaId}`);

        revalidatePath('/seguranca-trabalho/inventario-jsa');

        const successMessage = fileSaveError
            ? `JSA adicionada (ID: ${newJsaId}), mas houve um erro ao salvar o anexo: ${fileSaveError}`
            : `JSA adicionada com sucesso (ID: ${newJsaId}).`;

        return { success: true, id: newJsaId, }; // Removido message da resposta de sucesso para consistência

    } catch (error) {
        console.error('Erro ao adicionar JSA no banco:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao salvar JSA.';
        return { success: false, error: `Erro ao adicionar JSA: ${errorMessage}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }
}
