
'use server';

import { z } from 'zod';
import { insertEquipment } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the form and database structure
// Note: locationId is received as number | null after conversion in the component
const equipmentSchema = z.object({
  name: z.string().min(2),
  type: z.string().optional(),
  locationId: z.number().nullable(), // Expect number or null
  serialNumber: z.string().optional().nullable(), // Allow null from DB perspective
  maintenanceSchedule: z.string().optional().nullable(),
  // lastMaintenanceDate: z.string().optional(), // Add date validation if using
});

// Type for the data received *before* server-side conversion/validation
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

    const { name, type, locationId, serialNumber, maintenanceSchedule } = validatedData.data;

    // Insert into the database
    const newEquipmentId = await insertEquipment(
        name,
        type,
        locationId, // Already number or null
        serialNumber,
        maintenanceSchedule
        // lastMaintenanceDate // Pass if added
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
