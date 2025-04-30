
'use server';

import { getAllLocations, getAllUsers, getAllEmployees, getAllTrainings } from '@/lib/db';

// Define common types for data fetching results
type Location = { id: number; name: string };
type User = { id: number; name: string };
type Employee = { id: number; name: string };
type Training = { id: number; course_name: string };

type FetchResult<T> = {
    success: boolean;
    data?: T[];
    error?: string;
};

export async function fetchLocations(): Promise<FetchResult<Location>> {
    try {
        const locations = await getAllLocations();
        return { success: true, data: locations as Location[] };
    } catch (error) {
        console.error('Error fetching locations:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar locais: ${message}` };
    }
}

export async function fetchUsers(): Promise<FetchResult<User>> {
    try {
        const users = await getAllUsers(); // Assuming getAllUsers returns { id, name }
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
        const trainings = await getAllTrainings(); // Assuming getAllTrainings returns { id, course_name }
        return { success: true, data: trainings as Training[] };
    } catch (error) {
        console.error('Error fetching trainings:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar treinamentos: ${message}` };
    }
}
