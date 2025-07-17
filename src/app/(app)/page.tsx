
// Marcar como Server Component

import React from 'react';
import { LayoutDashboard } from 'lucide-react'; // Ícone para o título da página
import { getAllActionItemsSortedByDueDate, getDashboardStats } from '@/lib/db';
import DashboardCharts from '@/components/dashboard/charts'; // Componente cliente para gráficos
import ActionPlanTable from '@/components/dashboard/ActionPlanTable';
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards'; // Novo componente de stats
import DashboardAlerts from '@/components/dashboard/DashboardAlerts'; // Novo componente de alertas

// --- Tipos ---
interface ActionItem {
  id: number;
  description: string;
  origin: string | null;
  responsible_name: string | null;
  due_date: string;
  priority: string;
  status: string;
}

// --- Dados do Banco de Dados ---
async function fetchData() {
  try {
    // Usar Promise.all para buscar dados em paralelo
    const [actionItems, stats] = await Promise.all([
      getAllActionItemsSortedByDueDate(),
      getDashboardStats(30) // Busca stats e itens vencendo nos próximos 30 dias
    ]);
    console.log("Dashboard stats fetched:", stats);
    return { actionItems, stats };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    // Retornar um estado de erro ou valores padrão
    return {
      actionItems: [],
      stats: {
        employeeCount: 0,
        jsaCount: 0,
        trainingCount: 0,
        expiringDocuments: [],
        expiringTrainings: []
      }
    };
  }
}

export default async function EhsDashboardPage() {
  const { actionItems, stats } = await fetchData();

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
      <div className="flex items-center gap-2 mb-6">
           <LayoutDashboard className="h-6 w-6 text-foreground" />
           <div>
              <h1 className="text-2xl font-semibold ">Dashboard EHS</h1>
              <p className="text-sm text-muted-foreground">Visão Geral de Segurança, Saúde e Meio Ambiente</p>
           </div>
      </div>

      {/* Seção de Estatísticas */}
      <DashboardStatsCards stats={stats} />

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Seção de Alertas */}
        <DashboardAlerts
            expiringDocuments={stats.expiringDocuments}
            expiringTrainings={stats.expiringTrainings}
        />

        {/* Action Plan Card - Renderiza o novo componente cliente para a tabela */}
        <div className="xl:col-start-2 xl:row-start-1">
             <ActionPlanTable items={actionItems} />
        </div>
      </div>


      {/* Renderizar o componente cliente para gráficos */}
      <DashboardCharts
        incidentesData={incidentesQuaseAcidentesData}
        atividadesData={atividadesSegurancaData}
      />

    </>
  );
}
