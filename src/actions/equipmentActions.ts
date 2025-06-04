
'use server';

import { z } from 'zod';
import { insertEquipment } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const equipmentSchema = z.object({
  name: z.string().min(2, { message: "Nome do equipamento deve ter pelo menos 2 caracteres." }),
  type: z.string().optional().nullable(),
  locationId: z.number().int().positive().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de aquisição inválido (YYYY-MM-DD)").optional().nullable(),
  status: z.string().optional().nullable().default('Operacional'),
  maintenanceSchedule: z.string().optional().nullable(),
  lastMaintenanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de última manutenção inválido (YYYY-MM-DD)").optional().nullable(),
  nextMaintenanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data de próxima manutenção inválido (YYYY-MM-DD)").optional().nullable(),
});

type EquipmentInput = z.infer<typeof equipmentSchema>;

export async function addEquipment(data: EquipmentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("[Action:addEquipment] Dados recebidos para adicionar:", data);
  try {
    const validatedData = equipmentSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("[Action:addEquipment] Falha na validação Zod:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        name, type, locationId, serialNumber, brand, model,
        acquisitionDate, status, maintenanceSchedule,
        lastMaintenanceDate, nextMaintenanceDate
    } = validatedData.data;
    console.log("[Action:addEquipment] Dados validados e formatados para inserção no DB:", validatedData.data);

    const newEquipmentId = await insertEquipment(
        name, type, locationId, serialNumber, brand, model,
        acquisitionDate, status, maintenanceSchedule,
        lastMaintenanceDate, nextMaintenanceDate
    );

     if (newEquipmentId === undefined || newEquipmentId === null) {
        console.error("[Action:addEquipment] Falha ao inserir equipamento no DB, ID não retornado.");
        throw new Error('Falha ao inserir equipamento, ID não retornado.');
     }

    console.log(`[Action:addEquipment] Equipamento adicionado com sucesso com ID: ${newEquipmentId}`);
    revalidatePath('/geral/cadastros');
    return { success: true, id: newEquipmentId };

  } catch (error) {
    console.error('[Action:addEquipment] Erro detalhado ao adicionar equipamento:', error);
     if (error instanceof Error && error.message.includes('UNIQUE constraint failed: equipment.serial_number')) {
      return { success: false, error: 'Erro: Já existe um equipamento com este número de série.' };
    }
     const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao adicionar equipamento.';
    return { success: false, error: `Erro ao adicionar equipamento: ${errorMessage}` };
  }
}

    