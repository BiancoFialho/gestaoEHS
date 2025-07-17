
'use server';

import {
    getAllLocations as dbGetAllLocations,
    getAllUsers as dbGetAllUsers,
    getAllEmployees as dbGetAllEmployees,
    getAllTrainings as dbGetAllTrainings,
    getAllJsas as dbGetAllJsas,
    getJsaById as dbGetJsaById,
    getAllIncidents as dbGetAllIncidents,
    getAllAudits as dbGetAllAudits,
    getJsaSteps as dbGetJsaSteps
} from '@/lib/db';

// Define common types for data fetching results
// Ensure these types align with what the db functions actually return or cast appropriately
type Location = { id: number; name: string };
type User = { id: number; name: string; email?: string; role?: string; is_active?: boolean };
type Employee = { id: number; name: string };
type Training = { id: number; course_name: string };

type Jsa = {
    id: number;
    task: string;
    location_name: string | null;
    responsible_person_name: string | null;
    review_date: string | null;
    status: string | null;
    attachment_path: string | null;
    department?: string | null;
    team_members?: string | null;
    required_ppe?: string | null;
    creation_date?: string | null;
    approval_date?: string | null;
    approver_id?: number | null;
};

// Type that matches the full data for the dialog
type JsaData = {
    id: number;
    task: string;
    locationName?: string | null;
    department?: string | null;
    responsiblePersonName?: string | null;
    teamMembers?: string | null;
    requiredPpe?: string | null;
    status?: string | null;
    reviewDate?: string | null;
    attachmentPath?: string | null;
}

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

// Definição do tipo AuditEntry, consistente com /auditorias/page.tsx
interface AuditEntry {
  id: number;
  type: string;
  scope: string;
  audit_date: string; // YYYY-MM-DD
  auditor: string;
  lead_auditor_id: number | null;
  lead_auditor_name?: string | null; // Nome do auditor líder vindo do JOIN
  status: string | null;
  non_conformities_count?: number;
}

// Definição do tipo para um passo da JSA
export interface JsaStep {
  id: number;
  jsa_id: number;
  step_order: number;
  description: string;
  hazards: string;
  controls: string;
}


type FetchResult<T> = {
    success: boolean;
    data?: T | T[];
    error?: string;
};


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

export async function fetchUsers(): Promise<FetchResult<User>> {
    try {
        const users = await dbGetAllUsers();
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
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
        const jsas = await dbGetAllJsas();
        return { success: true, data: jsas as Jsa[] };
    } catch (error) {
        console.error('Error fetching JSAs:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, error: `Erro ao buscar JSAs: ${message}` };
    }
}

export async function fetchJsaByIdAction(id: number): Promise<FetchResult<JsaData>> {
    console.log(`[dataFetchingActions] fetchJsaByIdAction: Buscando JSA com ID: ${id}`);
    try {
        const jsa = await dbGetJsaById(id);
        if (jsa) {
            // Mapeia os campos do DB para os campos esperados pelo Dialog/Form
            const jsaData: JsaData = {
                id: jsa.id,
                task: jsa.task,
                locationName: jsa.location_name,
                department: jsa.department,
                responsiblePersonName: jsa.responsible_person_name,
                teamMembers: jsa.team_members,
                requiredPpe: jsa.required_ppe,
                status: jsa.status,
                reviewDate: jsa.review_date,
                attachmentPath: jsa.attachment_path,
            };
            console.log(`[dataFetchingActions] JSA ID ${id} encontrada e formatada:`, jsaData);
            return { success: true, data: jsaData };
        } else {
            return { success: false, error: 'JSA não encontrada.' };
        }
    } catch (error) {
        console.error(`[dataFetchingActions] Erro ao buscar JSA por ID (${id}):`, error);
        const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { success: false, error: `Erro ao buscar JSA: ${message}` };
    }
}


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

// Nova Server Action para buscar todas as auditorias
export async function fetchAllAuditsAction(): Promise<FetchResult<AuditEntry>> {
    console.log("[dataFetchingActions] fetchAllAuditsAction: Iniciando busca de auditorias.");
    try {
        const audits = await dbGetAllAudits();
        console.log(`[dataFetchingActions] fetchAllAuditsAction: ${audits.length} auditorias encontradas.`);
        return { success: true, data: audits as AuditEntry[] };
    } catch (error) {
        console.error('[dataFetchingActions] Error fetching all audits via action:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred while fetching audits.';
        return { success: false, error: `Erro ao buscar auditorias: ${message}` };
    }
}

// Nova Server Action para buscar os passos de uma JSA
export async function fetchJsaStepsAction(jsaId: number): Promise<FetchResult<JsaStep>> {
    console.log(`[dataFetchingActions] fetchJsaStepsAction: Buscando passos para JSA ID: ${jsaId}`);
    try {
        const steps = await dbGetJsaSteps(jsaId);
        console.log(`[dataFetchingActions] fetchJsaStepsAction: ${steps.length} passos encontrados.`);
        return { success: true, data: steps as JsaStep[] };
    } catch (error) {
        console.error(`[dataFetchingActions] Erro ao buscar passos da JSA (${jsaId}):`, error);
        const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { success: false, error: `Erro ao buscar passos da JSA: ${message}` };
    }
}
