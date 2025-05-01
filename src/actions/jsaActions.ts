
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


type JsaInput = z.infer<typeof jsaInputSchema>;
type JsaStepInput = z.infer<typeof jsaStepSchema>;


// Updated function to accept FormData
export async function addJsaWithAttachment(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    const file = formData.get('attachment') as File | null;
    let attachmentPath: string | null = null;
    let fileSaveError: string | null = null;

    // --- File Handling ---
    if (file && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            // Ensure the uploads directory exists
            await fs.mkdir(uploadsDir, { recursive: true });

            // Create a safe filename (e.g., timestamp + original name)
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const safeFilename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Basic sanitization
            const filePath = path.join(uploadsDir, safeFilename);

            // Read the file buffer from the File object
            const buffer = Buffer.from(await file.arrayBuffer());

            // Save the file
            await fs.writeFile(filePath, buffer);
            attachmentPath = `/uploads/${safeFilename}`; // Store the public path
            console.log(`File saved successfully: ${attachmentPath}`);

        } catch (uploadError) {
            console.error('Error saving file:', uploadError);
            fileSaveError = 'Erro ao salvar o anexo.';
            // Optionally decide if the JSA creation should proceed without the file
            // return { success: false, error: 'Erro ao salvar o anexo.' };
        }
    } else {
        console.log("No attachment provided or file is empty.");
    }

    // --- JSA Data Handling ---
    // Extract other form data
    const jsaData: JsaInput = {
        task: formData.get('task') as string,
        locationId: formData.get('locationId') ? parseInt(formData.get('locationId') as string, 10) : null,
        department: formData.get('department') as string | null,
        responsiblePersonId: formData.get('responsiblePersonId') ? parseInt(formData.get('responsiblePersonId') as string, 10) : null,
        teamMembers: formData.get('teamMembers') as string | null,
        requiredPpe: formData.get('requiredPpe') as string | null,
        status: formData.get('status') as string | null,
        reviewDate: formData.get('reviewDate') as string | null,
        // Steps data would need to be stringified and parsed if sent via FormData, or handled separately
        steps: [], // Assuming steps are not sent via this form for simplicity now
    };

     // Basic validation (can be more robust with Zod if needed)
     if (!jsaData.task || jsaData.task.length < 5) {
        return { success: false, error: 'Tarefa inválida. Deve ter pelo menos 5 caracteres.' };
    }

    try {
        // Insert into the database using the db function, including the attachment path
        const newJsaId = await dbInsertJsa(
            { // Pass JsaInput object
                ...jsaData,
                attachmentPath: attachmentPath, // Pass the saved file path
                 locationId: jsaData.locationId ?? undefined,
                 responsiblePersonId: jsaData.responsiblePersonId ?? undefined,
                 reviewDate: jsaData.reviewDate ?? undefined,
                 status: jsaData.status ?? 'Rascunho',
                 teamMembers: jsaData.teamMembers ?? undefined,
                 requiredPpe: jsaData.requiredPpe ?? undefined,
                 department: jsaData.department ?? undefined,
            },
            jsaData.steps // Pass the (currently empty) steps array
        );

        if (newJsaId === undefined || newJsaId === null) {
            throw new Error('Failed to insert JSA, ID not returned.');
        }

        console.log(`JSA added with ID: ${newJsaId}`); // Corrected template literal usage

        // Revalidate the path where JSAs are listed
        revalidatePath('/seguranca-trabalho/inventario-jsa'); // Adjust the path if needed

        // Include file save error in the success message if applicable
        const successMessage = fileSaveError
            ? `JSA adicionada (ID: ${newJsaId}), mas houve um erro ao salvar o anexo: ${fileSaveError}`
            : `JSA adicionada com sucesso (ID: ${newJsaId}).`;

        return { success: true, id: newJsaId, /* message: successMessage */ }; // Optionally return a detailed message

    } catch (error) {
        console.error('Error adding JSA:', error);
        // Clean up saved file if DB insert fails? Maybe not, user might retry.
        // if (attachmentPath) {
        //     try { await fs.unlink(path.join(process.cwd(), 'public', attachmentPath)); } catch (cleanupError) { console.error("Error cleaning up file:", cleanupError); }
        // }
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao adicionar JSA: ${errorMessage}` };
    }
}

// Keep the old function if needed for non-FormData submissions, or remove it
// export async function addJsa(data: JsaInput, stepsData: JsaStepInput[]): Promise<{ success: boolean; error?: string; id?: number }> { ... }

