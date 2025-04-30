
'use server';

import { z } from 'zod';
import { insertIncident } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Schema matching the data *after* component-side conversion
const incidentSchema = z.object({
  date: z.string(), // Expecting formatted date string
  type: z.string().min(1),
  description: z.string().min(10),
  locationId: z.number().int().positive().optional(),
  severity: z.string().optional(),
  reportedById: z.number().int().positive().optional(),
  status: z.string().optional(),
  // Add other fields if they are included in the form/DB
});

type IncidentInput = z.infer<typeof incidentSchema>;

export async function addIncident(data: IncidentInput): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate data using Zod schema on the server-side
    const validatedData = incidentSchema.safeParse(data);
    if (!validatedData.success) {
      console.error("Validation failed:", validatedData.error.errors);
      const errorMessages = validatedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }

    const {
        description,
        date,
        type,
        severity,
        locationId,
        reportedById
        // status is handled by DB default or passed if needed
     } = validatedData.data;

    // Insert into the database
    // Note: The `insertIncident` function in db.ts might need adjustment
    // if it expects a different date format or handles status differently.
    const newIncidentId = await insertIncident(
        description,
        date, // Pass the formatted date string
        type,
        severity,
        locationId,
        reportedById
    );

    if (newIncidentId === undefined || newIncidentId === null) {
        throw new Error('Failed to insert incident, ID not returned.');
    }

    console.log(`Incident reported with ID: ${newIncidentId}`);

    // Revalidate the path where incidents are listed
    revalidatePath('/seguranca-trabalho/incidentes'); // Adjust path if needed

    return { success: true, id: newIncidentId };
  } catch (error) {
    console.error('Error adding incident:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Erro ao reportar incidente: ${errorMessage}` };
  }
}
