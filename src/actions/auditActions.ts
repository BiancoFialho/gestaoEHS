
"use server";

import { z } from 'zod';
import { insertAudit, getAuditById as dbGetAuditById, updateAudit as dbUpdateAudit } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { format, parse, isValid } from "date-fns";

const DATE_FORMAT_DB = "yyyy-MM-dd";
const DATE_FORMAT_DISPLAY = "dd/MM/yyyy"; // Para validação da string de entrada

const NONE_SELECT_VALUE = "__NONE__"; // Definir ou importar de um local comum se usado em outros lugares

const auditSchema = z.object({
  id: z.number().optional(), // ID para edição
  type: z.string().min(1, "Tipo é obrigatório."),
  scope: z.string().min(3, "Escopo deve ter pelo menos 3 caracteres."),
  auditDateString: z.string().refine((val) => {
    if (!val || val.trim() === "") return false; // Obrigatório
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  auditor: z.string().min(2, "Nome do auditor é obrigatório."),
  leadAuditorId: z.string().optional(),
  status: z.string().optional().default('Planejada'),
});

export type AuditInput = z.infer<typeof auditSchema>;

export async function addAudit(data: Omit<AuditInput, 'id'>): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:addAudit] Iniciando action. Dados recebidos:", data);
  try {
    const validatedData = auditSchema.omit({ id: true }).safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addAudit] Falha na validação Zod:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { type, scope, auditDateString, auditor, leadAuditorId, status } = validatedData.data;

    let formattedAuditDate: string;
    try {
        const parsedDate = parse(auditDateString, DATE_FORMAT_DISPLAY, new Date());
        if (!isValid(parsedDate)) throw new Error("Data da auditoria inválida após parse."); // Segurança extra
        formattedAuditDate = format(parsedDate, DATE_FORMAT_DB);
    } catch (e) {
        console.error("[Action:addAudit] Erro ao formatar data:", e);
        return { success: false, error: "Formato de data da auditoria inválido." };
    }

    const leadAuditorIdNumber = leadAuditorId && leadAuditorId !== NONE_SELECT_VALUE ? parseInt(leadAuditorId, 10) : null;

    console.log("[Action:addAudit] Dados formatados para inserção no DB:", {
        type, scope, formattedAuditDate, auditor, leadAuditorIdNumber, status
    });

    const newAuditId = await insertAudit(
      type,
      scope,
      formattedAuditDate,
      auditor,
      leadAuditorIdNumber,
      status
    );

    if (newAuditId === undefined || newAuditId === null) {
        console.error("[Action:addAudit] Falha ao inserir auditoria no DB, ID não retornado.");
        throw new Error('Falha ao inserir auditoria, ID não retornado.');
    }

    console.log(`[Action:addAudit] Auditoria adicionada com sucesso com ID: ${newAuditId}`);
    revalidatePath('/seguranca-trabalho/auditorias');
    console.log("[Action:addAudit] Finalizando action com sucesso.");
    return { success: true, id: newAuditId };

  } catch (error) {
    console.error('[Action:addAudit] Erro detalhado ao adicionar auditoria:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao adicionar auditoria.';
    console.log("[Action:addAudit] Finalizando action com erro.");
    return { success: false, error: `Erro ao adicionar auditoria: ${errorMessage}` };
  }
}

export async function updateAuditAction(data: AuditInput): Promise<{ success: boolean; error?: string; id?: number }> {
    console.log("[Action:updateAuditAction] Iniciando action. Dados recebidos:", data);
    if (!data.id) {
        return { success: false, error: "ID da auditoria é obrigatório para atualização." };
    }
    const { id } = data;

    try {
        const validatedData = auditSchema.safeParse(data);
        if (!validatedData.success) {
            console.error("[Action:updateAuditAction] Falha na validação Zod:", validatedData.error.errors);
            const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: `Dados inválidos: ${errorMessages}` };
        }

        const { type, scope, auditDateString, auditor, leadAuditorId, status } = validatedData.data;

        const parsedDate = parse(auditDateString, DATE_FORMAT_DISPLAY, new Date());
        const formattedAuditDate = format(parsedDate, DATE_FORMAT_DB);
        const leadAuditorIdNumber = leadAuditorId && leadAuditorId !== NONE_SELECT_VALUE ? parseInt(leadAuditorId, 10) : null;

        console.log(`[Action:updateAuditAction] Dados formatados para atualização no DB (ID: ${id}):`, {
            type, scope, formattedAuditDate, auditor, leadAuditorIdNumber, status
        });

        const success = await dbUpdateAudit(id, {
            type,
            scope,
            audit_date: formattedAuditDate,
            auditor,
            lead_auditor_id: leadAuditorIdNumber,
            status: status || 'Planejada'
        });

        if (!success) {
            throw new Error('Falha ao atualizar auditoria no banco de dados.');
        }

        console.log(`[Action:updateAuditAction] Auditoria ${id} atualizada com sucesso.`);
        revalidatePath('/seguranca-trabalho/auditorias');
        return { success: true, id: id };
    } catch (error) {
        console.error(`[Action:updateAuditAction] Erro detalhado ao atualizar auditoria ${id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao atualizar auditoria.';
        return { success: false, error: `Erro ao atualizar auditoria: ${errorMessage}` };
    }
}


export async function getAuditByIdAction(id: number): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log(`[Action:getAuditByIdAction] Buscando auditoria com ID: ${id}`);
    try {
        const audit = await dbGetAuditById(id);
        if (audit) {
            console.log(`[Action:getAuditByIdAction] Auditoria encontrada:`, audit);
            return { success: true, data: audit };
        } else {
            return { success: false, error: 'Auditoria não encontrada.' };
        }
    } catch (error) {
        console.error(`[Action:getAuditByIdAction] Erro ao buscar auditoria por ID (${id}):`, error);
        const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { success: false, error: `Erro ao buscar auditoria: ${message}` };
    }
}
