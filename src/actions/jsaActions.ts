
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa, updateJsa as dbUpdateJsa, deleteJsaById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises';

const jsaStepSchema = z.object({
    description: z.string().min(1),
    hazards: z.string().min(1),
    controls: z.string().min(1),
});
export type JsaStepInput = z.infer<typeof jsaStepSchema>;


// This base schema validates only the text fields from the FormData
const jsaBaseSchemaServer = z.object({
  id: z.coerce.number().int().positive().optional(),
  task: z.string().min(5, "A tarefa deve ter pelo menos 5 caracteres."),
  locationName: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  responsiblePersonName: z.string().optional().nullable(),
  teamMembers: z.string().optional().nullable(),
  requiredPpe: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de revisão inválido (YYYY-MM-DD)").optional().nullable(),
  steps: z.array(jsaStepSchema).optional(),
});


async function handleFileUpload(formData: FormData): Promise<{ attachmentPath: string | null; error: string | null }> {
    const file = formData.get('attachment') as File | null;
    if (!file || file.size === 0) {
        return { attachmentPath: null, error: null };
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
        await fs.mkdir(uploadsDir, { recursive: true });
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeFilename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = path.join(uploadsDir, safeFilename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        const attachmentPath = `/uploads/${safeFilename}`;
        console.log(`[JSA Actions] Arquivo salvo em: ${attachmentPath}`);
        return { attachmentPath, error: null };
    } catch (uploadError) {
        console.error('[JSA Actions] Erro ao salvar arquivo:', uploadError);
        const message = uploadError instanceof Error ? uploadError.message : String(uploadError);
        return { attachmentPath: null, error: `Erro ao salvar o anexo: ${message}` };
    }
}

function parseFormData(formData: FormData) {
    const reviewDate = formData.get('reviewDate') as string | null;
    const stepsString = formData.get('steps') as string | null;
    let steps: JsaStepInput[] = [];
    if (stepsString) {
        try {
            steps = JSON.parse(stepsString);
        } catch (e) {
            console.error("Erro ao fazer parse dos passos da JSA:", e);
            // Lidar com o erro, talvez retornar um erro de validação
        }
    }

    return {
        id: formData.has('id') ? parseInt(formData.get('id') as string, 10) : undefined,
        task: formData.get('task') as string,
        locationName: (formData.get('locationName') as string) || null,
        department: (formData.get('department') as string) || null,
        responsiblePersonName: (formData.get('responsiblePersonName') as string) || null,
        teamMembers: (formData.get('teamMembers') as string) || null,
        requiredPpe: (formData.get('requiredPpe') as string) || null,
        status: (formData.get('status') as string) || 'Rascunho',
        reviewDate: reviewDate && reviewDate.trim() !== "" ? reviewDate : null,
        steps,
    };
}


export async function addJsaWithAttachment(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    console.log("[Action:addJsaWithAttachment] Iniciando adição...");

    const { attachmentPath, error: fileSaveError } = await handleFileUpload(formData);
    const jsaData = parseFormData(formData);

    const validatedResult = jsaBaseSchemaServer.omit({ id: true }).safeParse(jsaData);
    if (!validatedResult.success) {
      console.error("[Action:addJsaWithAttachment] Falha na validação Zod:", validatedResult.error.format());
      const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos para JSA: ${errorMessages}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }
    
    const dataToInsert = { ...validatedResult.data, attachmentPath };

    try {
        const newJsaId = await dbInsertJsa(dataToInsert);
        if (newJsaId === undefined || newJsaId === null) {
            throw new Error('Falha ao inserir JSA, ID não retornado.');
        }

        console.log(`[Action:addJsaWithAttachment] JSA adicionada com ID: ${newJsaId}`);
        revalidatePath('/seguranca-trabalho/inventario-jsa');
        
        return { success: true, id: newJsaId, error: fileSaveError ? fileSaveError : undefined };

    } catch (dbError) {
        console.error('[Action:addJsaWithAttachment] Erro ao adicionar JSA no banco:', dbError);
        const errorMessage = dbError instanceof Error ? dbError.message : 'Ocorreu um erro desconhecido ao salvar JSA.';
        return { success: false, error: `Erro ao adicionar JSA: ${errorMessage}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }
}


export async function updateJsaAction(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    console.log("[Action:updateJsaAction] Iniciando atualização...");
    
    const jsaData = parseFormData(formData);
    if (!jsaData.id) {
        return { success: false, error: "ID da JSA é obrigatório para atualização." };
    }

    const validatedResult = jsaBaseSchemaServer.safeParse(jsaData);
    if (!validatedResult.success) {
        console.error("[Action:updateJsaAction] Falha na validação Zod:", validatedResult.error.format());
        const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Dados inválidos para JSA: ${errorMessages}` };
    }

    const { id, ...dataToUpdate } = validatedResult.data;
    
    try {
        const success = await dbUpdateJsa(id!, dataToUpdate);
        if (!success) {
            throw new Error('Falha ao atualizar JSA no banco de dados.');
        }

        console.log(`[Action:updateJsaAction] JSA ${id} atualizada com sucesso.`);
        revalidatePath('/seguranca-trabalho/inventario-jsa');
        
        return { success: true, id: id };

    } catch (error) {
        console.error(`[Action:updateJsaAction] Erro ao atualizar JSA ${id} no banco:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao salvar JSA.';
        return { success: false, error: `Erro ao atualizar JSA: ${errorMessage}` };
    }
}


export async function deleteJsaAction(id: number): Promise<{ success: boolean; error?: string }> {
    console.log(`[Action:deleteJsaAction] Tentando excluir JSA ID: ${id}`);
    try {
        const deleteDbResult = await deleteJsaById(id);

        if (!deleteDbResult.success) {
            console.warn(`[Action:deleteJsaAction] Falha ao excluir JSA ${id} do banco de dados.`);
            return { success: false, error: 'Falha ao excluir JSA do banco de dados. Pode já ter sido removida.' };
        }

        if (deleteDbResult.attachmentPath) {
            try {
                const filePath = path.join(process.cwd(), 'public', deleteDbResult.attachmentPath);
                await fs.unlink(filePath);
                console.log(`[Action:deleteJsaAction] Anexo ${deleteDbResult.attachmentPath} excluído com sucesso.`);
            } catch (fileError) {
                console.error(`[Action:deleteJsaAction] JSA ${id} excluída do DB, mas falha ao excluir o arquivo anexo ${deleteDbResult.attachmentPath}:`, fileError);
            }
        }

        console.log(`[Action:deleteJsaAction] JSA ${id} e seu anexo (se houver) foram excluídos com sucesso.`);
        revalidatePath('/seguranca-trabalho/inventario-jsa');
        return { success: true };

    } catch (error) {
        console.error(`[Action:deleteJsaAction] Erro ao excluir JSA ${id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao excluir JSA.';
        return { success: false, error: `Erro ao excluir JSA: ${errorMessage}` };
    }
}
