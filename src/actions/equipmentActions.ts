'use server';

import { z } from 'zod';
import { insertEquipment } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the form and database structure
const equipmentSchema = z.object({
  name: z.string().min(2, { message: "Nome do equipamento deve ter pelo menos 2 caracteres." }),
  type: z.string().optional().nullable(),
  locationId: z.number().nullable(), // Expect number or null
  serialNumber: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  acquisitionDate: z.string().optional().nullable(), // Expecting 'YYYY-MM-DD' or null
  status: z.string().optional().nullable().default('Operacional'),
  maintenanceSchedule: z.string().optional().nullable(),
  lastMaintenanceDate: z.string().optional().nullable(), // Expecting 'YYYY-MM-DD' or null
  nextMaintenanceDate: z.string().optional().nullable(), // Expecting 'YYYY-MM-DD' or null
});

type EquipmentInput = z.infer<typeof equipmentSchema>;


export async function addEquipment(data: EquipmentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = equipmentSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        name,
        type,
        locationId,
        serialNumber,
        brand,
        model,
        acquisitionDate,
        status,
        maintenanceSchedule,
        lastMaintenanceDate,
        nextMaintenanceDate
    } = validatedData.data;

    // Insert into the database
    const newEquipmentId = await insertEquipment(
        name,
        type,
        locationId, // Already number or null
        serialNumber,
        brand,
        model,
        acquisitionDate, // Pass as string or null
        status,
        maintenanceSchedule,
        lastMaintenanceDate, // Pass as string or null
        nextMaintenanceDate // Pass as string or null
    );

     if (newEquipmentId === undefined || newEquipmentId === null) {
        throw new Error('Failed to insert equipment, ID not returned.');
     }

    console.log(`Equipment added with ID: ${newEquipmentId}`);

    // Revalidate the path where equipment might be listed
    revalidatePath('/geral/cadastros'); // Adjust the path if needed

    return { success: true, id: newEquipmentId };
  } catch (error) {
    console.error('Error adding equipment:', error);
     // Check if it's a unique constraint error for serial number
     if (error instanceof Error && error.message.includes('UNIQUE constraint failed: equipment.serial_number')) {
      return { success: false, error: 'Erro: Já existe um equipamento com este número de série.' };
    }
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao adicionar equipamento: ${errorMessage}` };
  }
}
