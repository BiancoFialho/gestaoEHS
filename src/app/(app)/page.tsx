
// Marcar como Server Component (ou usar Server Actions)
// "use client" removido pois vamos buscar dados no servidor

import React from 'react';
import { BarChart3 } from 'lucide-react'; // Ícone para o título da página
import { getAllActionItemsSortedByDueDate } from '@/lib/db';
import DashboardCharts from '@/components/dashboard/charts'; // Componente cliente para gráficos
import ActionPlanTable from '@/components/dashboard/ActionPlanTable'; // Importar o novo componente cliente para a tabela

// --- Tipos ---
interface ActionItem {
  id: number;
  description: string;
  origin: string | null;
  responsible_name: string | null; // Nome do responsável vindo do JOIN
  due_date: string;
  priority: string;
  status: string;
}

// --- Dados do Banco de Dados ---
async function fetchAllActionItems(): Promise<ActionItem[]> {
  try {
    const items = await getAllActionItemsSortedByDueDate(); // Busca todos os itens
    console.log("All action items fetched:", items);
    return items as ActionItem[];
  } catch (error) {
    console.error("Erro ao buscar itens do plano de ação:", error);
    return []; // Retorna array vazio em caso de erro
  }
}

export default async function EhsDashboardPage() { // Marcar como async para usar await
  const allActionItems = await fetchAllActionItems(); // Buscar todos os itens

  // Dados de exemplo para gráficos (mantidos)
  const incidentesQuaseAcidentesData = [
    { date: '14/08', Incidentes: 0, QuaseAcidentes: 0 },
    { date: '15/08', Incidentes: 0, QuaseAcidentes: 0 },
    { date: '16/08', Incidentes: 0, QuaseAcidentes: 0 },
    { date: '17/08', Incidentes: 1, QuaseAcidentes: 0 },
    { date: '18/08', Incidentes: 2, QuaseAcidentes: 1 },
    { date: '19/08', Incidentes: 0, QuaseAcidentes: 2 },
    { date: '20/08', Incidentes: 0, QuaseAcidentes: 1 },
    { date: '21/08', Incidentes: 0, QuaseAcidentes: 0 },
    { date: '22/08', Incidentes: 1, QuaseAcidentes: 1 },
    { date: '23/08', Incidentes: 1, QuaseAcidentes: 2 },
  ];

  const atividadesSegurancaData = [
    { date: '14/08', AtividadesSeguranca: 0 },
    { date: '15/08', AtividadesSeguranca: 0 },
    { date: '16/08', AtividadesSeguranca: 0 },
    { date: '17/08', AtividadesSeguranca: 0 },
    { date: '18/08', AtividadesSeguranca: 10 },
    { date: '19/08', AtividadesSeguranca: 20 },
    { date: '20/08', AtividadesSeguranca: 5 },
    { date: '21/08', AtividadesSeguranca: 65 },
    { date: '22/08', AtividadesSeguranca: 40 },
    { date: '23/08', AtividadesSeguranca: 140 },
    { date: '24/08', AtividadesSeguranca: 50 },
  ];

  return (
    <>
      {/* Page Title */}
      <div className="flex items-center gap-2 mb-6">
           <BarChart3 className="h-6 w-6 text-foreground" />
           <div>
              <h1 className="text-2xl font-semibold ">Página Inicial EHS</h1>
              <p className="text-sm text-muted-foreground">Visão Geral de Segurança, Saúde e Meio Ambiente</p>
           </div>
      </div>

      {/* Renderizar o componente cliente para gráficos */}
      <DashboardCharts
        incidentesData={incidentesQuaseAcidentesData}
        atividadesData={atividadesSegurancaData}
      />

      {/* Action Plan Card - Renderiza o novo componente cliente para a tabela */}
      <ActionPlanTable items={allActionItems} />

    </>
  );
}
