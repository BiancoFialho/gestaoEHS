
'use server';

import { z } from 'zod';
import { insertJsa as dbInsertJsa, updateJsa as dbUpdateJsa, deleteJsaById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import path from 'path';
import fs from 'fs/promises';

// Schema for data extracted from FormData for Zod validation on server.
const jsaBaseSchemaServer = z.object({
  id: z.number().int().positive().optional(), // ID is needed for updates
  task: z.string().min(5, "A tarefa deve ter pelo menos 5 caracteres."),
  locationName: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  responsiblePersonName: z.string().optional().nullable(),
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

    const reviewDateFromForm = formData.get('reviewDate') as string | null;

    const jsaDataForValidation = {
        task: formData.get('task') as string,
        locationName: (formData.get('locationName') as string) || null,
        department: (formData.get('department') as string) || null,
        responsiblePersonName: (formData.get('responsiblePersonName') as string) || null,
        teamMembers: (formData.get('teamMembers') as string) || null,
        requiredPpe: (formData.get('requiredPpe') as string) || null,
        status: (formData.get('status') as string) || 'Rascunho',
        reviewDate: reviewDateFromForm && reviewDateFromForm.trim() !== "" ? reviewDateFromForm : null,
        attachmentPath: attachmentPath,
    };

    console.log("[Action:addJsaWithAttachment] Dados para validação Zod (JSA):", jsaDataForValidation);

    const validatedResult = jsaBaseSchemaServer.omit({ id: true }).safeParse(jsaDataForValidation);
    if (!validatedResult.success) {
      console.error("[Action:addJsaWithAttachment] Falha na validação Zod (JSA):", validatedResult.error.format());
      const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos para JSA: ${errorMessages}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}` };
    }

    const validatedJsaData: JsaInput = {
        ...validatedResult.data,
        steps: []
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
        const finalErrorMessage = `${errorMessage}${fileSaveError ? ` (Erro anexo: ${fileSaveError})` : ''}`;
        return { success: false, error: `Erro ao adicionar JSA: ${finalErrorMessage}` };
    }
}

export async function updateJsaAction(formData: FormData): Promise<{ success: boolean; error?: string; id?: number }> {
    console.log("[Action:updateJsaAction] FormData recebido para atualização:");
    formData.forEach((value, key) => console.log(`  ${key}: ${value}`));

    // Lógica para lidar com arquivo (futuramente)
    // Por enquanto, esta action não altera o anexo.

    const reviewDateFromForm = formData.get('reviewDate') as string | null;

    const jsaDataForValidation = {
        id: parseInt(formData.get('id') as string, 10),
        task: formData.get('task') as string,
        locationName: (formData.get('locationName') as string) || null,
        department: (formData.get('department') as string) || null,
        responsiblePersonName: (formData.get('responsiblePersonName') as string) || null,
        teamMembers: (formData.get('teamMembers') as string) || null,
        requiredPpe: (formData.get('requiredPpe') as string) || null,
        status: (formData.get('status') as string) || 'Rascunho',
        reviewDate: reviewDateFromForm && reviewDateFromForm.trim() !== "" ? reviewDateFromForm : null,
        // attachmentPath não é atualizado por esta action
    };

    console.log("[Action:updateJsaAction] Dados para validação Zod (Update):", jsaDataForValidation);

    const validatedResult = jsaBaseSchemaServer.safeParse(jsaDataForValidation);
    if (!validatedResult.success) {
      console.error("[Action:updateJsaAction] Falha na validação Zod (Update):", validatedResult.error.format());
      const errorMessages = validatedResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos para JSA: ${errorMessages}` };
    }

    const { id, ...dataToUpdate } = validatedResult.data;
    if (!id) {
        return { success: false, error: "ID da JSA é obrigatório para atualização." };
    }

    console.log(`[Action:updateJsaAction] Dados validados para atualização no DB (JSA ID: ${id}):`, dataToUpdate);

    try {
        const success = await dbUpdateJsa(id, dataToUpdate);
        if (!success) {
            console.error(`[Action:updateJsaAction] Falha ao atualizar JSA ${id} no banco, dbUpdateJsa retornou false.`);
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
        // A função do DB agora retorna o caminho do anexo
        const deleteDbResult = await deleteJsaById(id);

        if (!deleteDbResult.success) {
            console.warn(`[Action:deleteJsaAction] Falha ao excluir JSA ${id} do banco de dados.`);
            return { success: false, error: 'Falha ao excluir JSA do banco de dados. Pode já ter sido removida.' };
        }

        // Se a exclusão do DB foi bem-sucedida e havia um anexo, tente excluir o arquivo
        if (deleteDbResult.attachmentPath) {
            try {
                const filePath = path.join(process.cwd(), 'public', deleteDbResult.attachmentPath);
                await fs.unlink(filePath);
                console.log(`[Action:deleteJsaAction] Anexo ${deleteDbResult.attachmentPath} excluído com sucesso.`);
            } catch (fileError) {
                // Não retorna um erro para o usuário se apenas a exclusão do arquivo falhar,
                // mas registra um aviso no servidor. O registro do DB já foi removido.
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
