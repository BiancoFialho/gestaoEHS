
'use server';

import { z } from 'zod';
import { insertIncident as dbInsertIncident, updateIncidentInDb, getIncidentById as dbGetIncidentById, deleteIncidentById as dbDeleteIncidentById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema for data received by the server action (from client, dates are strings)
const incidentActionSchema = z.object({
  id: z.number().int().positive().optional(), // For updates
  date: z.string(), // Expecting formatted date string 'yyyy-MM-dd HH:mm:ss'
  type: z.string().min(1, "Tipo é obrigatório."),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres."),
  locationId: z.number().int().positive().optional().nullable(),
  severity: z.string().optional().nullable(),
  reportedById: z.number().int().positive().optional().nullable(),
  status: z.string().optional().nullable(),
  // Investigation fields
  root_cause: z.string().optional().nullable(),
  corrective_actions: z.string().optional().nullable(),
  preventive_actions: z.string().optional().nullable(),
  involved_persons_ids: z.string().optional().nullable(), // Storing as string for simplicity
  investigation_responsible_id: z.number().int().positive().optional().nullable(),
  lost_days: z.number().int().nonnegative().optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  closure_date: z.string().optional().nullable(), // Expecting 'yyyy-MM-dd' or null
});

export type IncidentInput = z.infer<typeof incidentActionSchema>;

export async function addIncident(data: IncidentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:addIncident] Recebido para adicionar:", data);
  try {
    const validatedData = incidentActionSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addIncident] Falha na validação:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const { id, ...incidentData } = validatedData.data; // Exclude id for insert
    console.log("[Action:addIncident] Dados validados para inserção:", incidentData);

    const newIncidentId = await dbInsertIncident(incidentData);

    if (newIncidentId === undefined || newIncidentId === null) {
        console.error("[Action:addIncident] Falha ao inserir no DB, ID não retornado.");
        throw new Error('Falha ao inserir incidente, ID não retornado.');
    }

    console.log(`[Action:addIncident] Incidente reportado com ID: ${newIncidentId}`);
    revalidatePath('/seguranca-trabalho/incidentes');
    return { success: true, id: newIncidentId };

  } catch (error) {
    console.error('[Action:addIncident] Erro ao adicionar incidente:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { success: false, error: `Erro ao reportar incidente: ${errorMessage}` };
  }
}


export async function updateIncident(data: IncidentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:updateIncident] Recebido para atualizar:", data);
  try {
    const validatedData = incidentActionSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:updateIncident] Falha na validação:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    if (!validatedData.data.id) {
      console.error("[Action:updateIncident] ID do incidente ausente para atualização.");
      return { success: false, error: 'ID do incidente é obrigatório para atualização.' };
    }
    
    const { id, ...incidentDataToUpdate } = validatedData.data;
    console.log("[Action:updateIncident] Dados validados para atualização (ID:", id, "):", incidentDataToUpdate);

    const success = await updateIncidentInDb(id!, incidentDataToUpdate); // id is asserted as it's checked

    if (!success) {
      console.error("[Action:updateIncident] Falha ao atualizar no DB para ID:", id);
      throw new Error('Falha ao atualizar o incidente no banco de dados.');
    }

    console.log(`[Action:updateIncident] Incidente atualizado com ID: ${id}`);
    revalidatePath('/seguranca-trabalho/incidentes');
    return { success: true, id: id };

  } catch (error) {
    console.error('[Action:updateIncident] Erro ao atualizar incidente:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { success: false, error: `Erro ao atualizar incidente: ${errorMessage}` };
  }
}

export async function getIncidentById(id: number): Promise<{ success: boolean; data?: IncidentInput; error?: string }> {
    console.log("[Action:getIncidentById] Buscando incidente com ID:", id);
    try {
        const incident = await dbGetIncidentById(id);
        if (incident) {
            console.log("[Action:getIncidentById] Incidente encontrado:", incident);
            return { success: true, data: incident as IncidentInput }; // Type assertion
        } else {
            console.warn("[Action:getIncidentById] Incidente não encontrado para ID:", id);
            return { success: false, error: 'Incidente não encontrado.' };
        }
    } catch (error) {
        console.error('[Action:getIncidentById] Erro ao buscar incidente por ID:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { success: false, error: `Erro ao buscar incidente: ${errorMessage}` };
    }
}

export async function deleteIncidentAction(id: number): Promise<{ success: boolean; error?: string }> {
  console.log(`[Action:deleteIncidentAction] Tentando excluir Incidente ID: ${id}`);
  try {
    const success = await dbDeleteIncidentById(id);
    if (success) {
      console.log(`[Action:deleteIncidentAction] Incidente ${id} excluído com sucesso do DB.`);
      revalidatePath('/seguranca-trabalho/incidentes');
      return { success: true };
    } else {
      console.warn(`[Action:deleteIncidentAction] Falha ao excluir incidente ${id} do DB.`);
      return { success: false, error: 'Falha ao excluir o incidente. Pode já ter sido removido.' };
    }
  } catch (error) {
    console.error(`[Action:deleteIncidentAction] Erro ao excluir incidente ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { success: false, error: `Erro ao excluir incidente: ${errorMessage}` };
  }
}
