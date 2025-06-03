
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises';

// Schema for data extracted from FormData. reviewDate is handled on server from FormData.
const jsaBaseSchemaServer = z.object({
  task: z.string().min(5, "A tarefa deve ter pelo menos 5 caracteres."),
  locationId: z.coerce.number().int().positive().optional().nullable(),
  department: z.string().optional().nullable(),
  responsiblePersonId: z.coerce.number().int().positive().optional().nullable(),
  teamMembers: z.string().optional().nullable(),
  requiredPpe: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de revisão inválido (YYYY-MM-DD)").optional().nullable(), // Expects YYYY-MM-DD
  attachmentPath: z.string().optional().nullable(),
});

const jsaStepSchema = z.object({
    step_order: z.number().int().positive(),
    description: z.string().min(3),
    hazards: z.string().min(3),
    controls: z.string().min(3),
});

export type JsaInput = z.infer<typeof jsaBaseSchemaServer> & { steps?: JsaStepInput[] };
type JsaStepInput = z.infer<typeof jsaStepSchema>;

const NONE_SELECT_VALUE = "__NONE__";

export async function addJsaWithAttachment(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    console.log("[Action:addJsaWithAttachment] FormData recebido:");
    formData.forEach((value, key) => {
        console.log(`  ${key}: ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`);
    });

    const file = formData.get('attachment') as File | null;
    let attachmentPath: string | null = null;
    let fileSaveError: string | null = null;

    if (file && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await fs.mkdir(uploadsDir, { recursive: true });
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const safeFilename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const filePath = path.join(uploadsDir, safeFilename);
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(filePath, buffer);
            attachmentPath = `/uploads/${safeFilename}`;
            console.log(`[Action:addJsaWithAttachment] Arquivo salvo: ${attachmentPath}`);
        } catch (uploadError) {
            console.error('[Action:addJsaWithAttachment] Erro ao salvar arquivo:', uploadError);
            fileSaveError = `Erro ao salvar o anexo: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`;
        }
    }

    const reviewDateFromForm = formData.get('reviewDate') as string | null; // This comes from the hidden input, already YYYY-MM-DD

    const jsaDataForValidation = {
        task: formData.get('task') as string,
        locationId: (formData.get('locationId') && formData.get('locationId') !== NONE_SELECT_VALUE && formData.get('locationId') !== "") ? parseInt(formData.get('locationId') as string, 10) : null,
        department: (formData.get('department') as string) || null,
        responsiblePersonId: (formData.get('responsiblePersonId') && formData.get('responsiblePersonId') !== NONE_SELECT_VALUE && formData.get('responsiblePersonId') !== "") ? parseInt(formData.get('responsiblePersonId') as string, 10) : null,
        teamMembers: (formData.get('teamMembers') as string) || null,
        requiredPpe: (formData.get('requiredPpe') as string) || null,
        status: (formData.get('status') as string) || 'Rascunho',
        reviewDate: reviewDateFromForm && reviewDateFromForm.trim() !== "" ? reviewDateFromForm : null, // Use directly if not empty
        attachmentPath: attachmentPath,
    };

    console.log("[Action:addJsaWithAttachment] Dados para validação Zod:", jsaDataForValidation);

    const validatedResult = jsaBaseSchemaServer.safeParse(jsaDataForValidation);
    if (!validatedResult.success) {
      console.error("[Action:addJsaWithAttachment] Falha na validação Zod:", validatedResult.error.format());
      const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }

    const validatedData: JsaInput = { ...validatedResult.data, steps: [] };
    console.log("[Action:addJsaWithAttachment] Dados validados para inserção no DB:", validatedData);

    try {
        const newJsaId = await dbInsertJsa(validatedData, validatedData.steps || []);
        if (newJsaId === undefined || newJsaId === null) {
            throw new Error('Falha ao inserir JSA, ID não retornado.');
        }
        console.log(`[Action:addJsaWithAttachment] JSA adicionada com ID: ${newJsaId}`);
        revalidatePath('/seguranca-trabalho/inventario-jsa');

        const successMessage = fileSaveError
            ? `JSA adicionada (ID: ${newJsaId}), mas houve um erro com o anexo: ${fileSaveError}`
            : `JSA adicionada com sucesso (ID: ${newJsaId}).`;
        
        // Return only success and id, toast message handled client-side or here if preferred
        return { success: true, id: newJsaId, error: fileSaveError ? fileSaveError : undefined };

    } catch (error) {
        console.error('[Action:addJsaWithAttachment] Erro ao adicionar JSA no banco:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao salvar JSA.';
        return { success: false, error: `Erro ao adicionar JSA: ${errorMessage}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }
}

    