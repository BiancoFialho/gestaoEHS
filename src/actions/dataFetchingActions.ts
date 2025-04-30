'use server';

import { getAllLocations as dbGetAllLocations, getAllUsers as dbGetAllUsers, getAllEmployees, getAllTrainings } from '@/lib/db';

// Define common types for data fetching results
// Ensure these types align with what the db functions actually return or cast appropriately
type Location = { id: number; name: string };
type User = { id: number; name: string };
type Employee = { id: number; name: string };
type Training = { id: number; course_name: string };

type FetchResult<T> = {
    success: boolean;
    data?: T[];
    error?: string;
};

// Fetch all locations (specifically id and name for dropdowns)
export async function fetchLocations(): Promise<FetchResult<Location>> {
    try {
        const locations = await dbGetAllLocations(); // Assuming this returns at least { id, name }
        // Ensure the returned data matches the Location type or cast safely
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
        const users = await dbGetAllUsers(); // Assuming this returns at least { id, name }
        // Ensure the returned data matches the User type or cast safely
        return { success: true, data: users as User[] };
    } catch (error) {
        console.error('Error fetching users:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar usuários: ${message}` };
    }
}


export async function fetchEmployees(): Promise<FetchResult<Employee>> {
    try {
        const employees = await getAllEmployees(); // Assuming this returns { id, name }
        return { success: true, data: employees as Employee[] };
    } catch (error) {
        console.error('Error fetching employees:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar funcionários: ${message}` };
    }
}

export async function fetchTrainings(): Promise<FetchResult<Training>> {
    try {
        const trainings = await getAllTrainings(); // Assuming this returns { id, course_name }
        return { success: true, data: trainings as Training[] };
    } catch (error) {
        console.error('Error fetching trainings:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar treinamentos: ${message}` };
    }
}