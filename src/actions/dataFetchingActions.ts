
'use server';

import {
    getAllLocations as dbGetAllLocations,
    getAllUsers as dbGetAllUsers,
    getAllEmployees as dbGetAllEmployees,
    getAllTrainings as dbGetAllTrainings,
    getAllJsas as dbGetAllJsas,
    getAllIncidents as dbGetAllIncidents // Importar a função do db.ts
} from '@/lib/db';

// Define common types for data fetching results
// Ensure these types align with what the db functions actually return or cast appropriately
type Location = { id: number; name: string };
type User = { id: number; name: string; email?: string; role?: string; is_active?: boolean }; // Adicionado mais campos para User
type Employee = { id: number; name: string };
type Training = { id: number; course_name: string };

// Updated Jsa type to match JsaEntry in InventarioJsaPage
type Jsa = {
    id: number;
    task: string;
    location_name: string | null;
    responsible_person_name: string | null;
    review_date: string | null;
    status: string | null;
    attachment_path: string | null;
    // Include other fields from the 'jsa' table if they might be needed elsewhere
    department?: string | null;
    team_members?: string | null;
    required_ppe?: string | null;
    creation_date?: string | null;
    approval_date?: string | null;
    approver_id?: number | null;
};

// Interface para IncidentEntry como definido em incidentes/page.tsx
interface IncidentEntry {
  id: number;
  date: string;
  type: string;
  severity: string | null;
  location_name: string | null;
  status: string | null;
  description: string;
  reporter_name: string | null;
  involved_persons_ids?: string | null;
  root_cause?: string | null;
  corrective_actions?: string | null;
  preventive_actions?: string | null;
  investigation_responsible_id?: number | null;
  investigation_responsible_name?: string | null;
  lost_days?: number | null;
  cost?: number | null;
  closure_date?: string | null;
}


type FetchResult<T> = {
    success: boolean;
    data?: T[];
    error?: string;
};

// Fetch all locations (specifically id and name for dropdowns)
export async function fetchLocations(): Promise<FetchResult<Location>> {
    try {
        const locations = await dbGetAllLocations();
        return { success: true, data: locations as Location[] };
    } catch (error) {
        console.error('Error fetching locations:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar locais: ${message}` };
    }
}

// Fetch all users (specifically id and name for dropdowns)
export async function fetchUsers(): Promise<FetchResult<User>> {
    try {
        const users = await dbGetAllUsers();
        // Ajustar para garantir que os campos retornados correspondam ao tipo User
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            // Adicione outros campos se eles vierem do dbGetAllUsers e forem necessários
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        }));
        return { success: true, data: formattedUsers as User[] };
    } catch (error) {
        console.error('Error fetching users:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar usuários: ${message}` };
    }
}


export async function fetchEmployees(): Promise<FetchResult<Employee>> {
    try {
        const employees = await dbGetAllEmployees();
        return { success: true, data: employees as Employee[] };
    } catch (error) {
        console.error('Error fetching employees:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar funcionários: ${message}` };
    }
}

export async function fetchTrainings(): Promise<FetchResult<Training>> {
    try {
        const trainings = await dbGetAllTrainings();
        return { success: true, data: trainings as Training[] };
    } catch (error) {
        console.error('Error fetching trainings:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar treinamentos: ${message}` };
    }
}

export async function fetchJsas(): Promise<FetchResult<Jsa>> {
    try {
        const jsas = await dbGetAllJsas(); // This function returns a more complex object
        // The type casting here should be safe if dbGetAllJsas returns objects matching the expanded Jsa type.
        return { success: true, data: jsas as Jsa[] };
    } catch (error) {
        console.error('Error fetching JSAs:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar JSAs: ${message}` };
    }
}

// Nova Server Action para buscar todos os incidentes
export async function fetchAllIncidentsAction(): Promise<FetchResult<IncidentEntry>> {
    console.log("fetchAllIncidentsAction: Iniciando busca de incidentes.");
    try {
        const incidents = await dbGetAllIncidents();
        console.log(`fetchAllIncidentsAction: ${incidents.length} incidentes encontrados.`);
        return { success: true, data: incidents as IncidentEntry[] };
    } catch (error) {
        console.error('Error fetching all incidents via action:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred while fetching incidents.';
        return { success: false, error: `Erro ao buscar incidentes: ${message}` };
    }
}
