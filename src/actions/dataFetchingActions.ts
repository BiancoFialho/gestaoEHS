'use server';

import { getAllLocations as dbGetAllLocations, getAllUsers as dbGetAllUsers, getAllEmployees, getAllTrainings, getAllJsas as dbGetAllJsas } from '@/lib/db';

// Define common types for data fetching results
// Ensure these types align with what the db functions actually return or cast appropriately
type Location = { id: number; name: string };
type User = { id: number; name: string };
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
        return { success: true, data: users as User[] };
    } catch (error) {
        console.error('Error fetching users:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar usuários: ${message}` };
    }
}


export async function fetchEmployees(): Promise<FetchResult<Employee>> {
    try {
        const employees = await getAllEmployees();
        return { success: true, data: employees as Employee[] };
    } catch (error) {
        console.error('Error fetching employees:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar funcionários: ${message}` };
    }
}

export async function fetchTrainings(): Promise<FetchResult<Training>> {
    try {
        const trainings = await getAllTrainings();
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
