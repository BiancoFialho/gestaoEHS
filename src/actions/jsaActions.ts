
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises';

// Schema for data extracted from FormData for Zod validation on server.
// locationId e responsiblePersonId não são mais usados diretamente pela action,
// mas os nomes são extraídos do FormData e passados para dbInsertJsa.
const jsaBaseSchemaServer = z.object({
  task: z.string().min(5, "A tarefa deve ter pelo menos 5 caracteres."),
  locationName: z.string().optional().nullable(), // Alterado para nome
  department: z.string().optional().nullable(),
  responsiblePersonName: z.string().optional().nullable(), // Alterado para nome
  teamMembers: z.string().optional().nullable(),
  requiredPpe: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de revisão inválido (YYYY-MM-DD)").optional().nullable(),
  attachmentPath: z.string().optional().nullable(),
});

const jsaStepSchema = z.object({
    step_order: z.number().int().positive(),
    description: z.string().min(3),
    hazards: z.string().min(3),
    controls: z.string().min(3),
});

// JsaInput para dbInsertJsa agora espera locationName e responsiblePersonName
export type JsaInput = {
  task: string;
  locationName?: string | null;
  department?: string | null;
  responsiblePersonName?: string | null;
  teamMembers?: string | null;
  requiredPpe?: string | null;
  status?: string | null;
  reviewDate?: string | null;
  attachmentPath?: string | null;
  steps?: JsaStepInput[];
};

type JsaStepInput = z.infer<typeof jsaStepSchema>;

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
    } else {
      console.log("[Action:addJsaWithAttachment] Nenhum arquivo de anexo encontrado ou o arquivo está vazio.");
    }

    // A data 'reviewDate' já vem formatada como YYYY-MM-DD do JsaDialog, se fornecida
    const reviewDateFromForm = formData.get('reviewDate') as string | null;

    const jsaDataForValidation = {
        task: formData.get('task') as string,
        // locationId não é mais usado, pegamos locationName
        locationName: (formData.get('locationName') as string) || null,
        department: (formData.get('department') as string) || null,
        // responsiblePersonId não é mais usado, pegamos responsiblePersonName
        responsiblePersonName: (formData.get('responsiblePersonName') as string) || null,
        teamMembers: (formData.get('teamMembers') as string) || null,
        requiredPpe: (formData.get('requiredPpe') as string) || null,
        status: (formData.get('status') as string) || 'Rascunho',
        reviewDate: reviewDateFromForm && reviewDateFromForm.trim() !== "" ? reviewDateFromForm : null,
        attachmentPath: attachmentPath,
    };

    console.log("[Action:addJsaWithAttachment] Dados para validação Zod (JSA):", jsaDataForValidation);

    const validatedResult = jsaBaseSchemaServer.safeParse(jsaDataForValidation);
    if (!validatedResult.success) {
      console.error("[Action:addJsaWithAttachment] Falha na validação Zod (JSA):", validatedResult.error.format());
      const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos para JSA: ${errorMessages}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }

    // Preparar os dados para dbInsertJsa, que agora espera JsaInput com os nomes
    const validatedJsaData: JsaInput = {
        ...validatedResult.data,
        steps: [] // Steps não são tratados nesta action por enquanto
    };
    console.log("[Action:addJsaWithAttachment] Dados validados para inserção no DB (JSA):", validatedJsaData);

    try {
        const newJsaId = await dbInsertJsa(validatedJsaData, validatedJsaData.steps || []);
        if (newJsaId === undefined || newJsaId === null) {
            console.error("[Action:addJsaWithAttachment] Falha ao inserir JSA no banco, ID não retornado.");
            throw new Error('Falha ao inserir JSA, ID não retornado.');
        }
        console.log(`[Action:addJsaWithAttachment] JSA adicionada com ID: ${newJsaId}`);
        revalidatePath('/seguranca-trabalho/inventario-jsa');
        
        const successMessage = fileSaveError
            ? `JSA adicionada (ID: ${newJsaId}), mas houve um erro com o anexo: ${fileSaveError}`
            : `JSA adicionada com sucesso (ID: ${newJsaId}).`;
        
        return { success: true, id: newJsaId, error: fileSaveError ? fileSaveError : undefined };

    } catch (error) {
        console.error('[Action:addJsaWithAttachment] Erro ao adicionar JSA no banco:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao salvar JSA.';
        // Retornar erro de anexo junto, se houver
        const finalErrorMessage = `${errorMessage}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}`;
        return { success: false, error: `Erro ao adicionar JSA: ${finalErrorMessage}` };
    }
}

    