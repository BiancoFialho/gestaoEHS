// Marcar como Server Component (ou usar Server Actions)
// "use client" removido pois vamos buscar dados no servidor

import React from 'react';
import Link from 'next/link';
import {
  BarChart3, // Page Title
  AlertTriangle, // Análise de Riscos (used in KPI)
  FileWarning, // Incidentes (used in KPI)
  ClipboardCheck, // Auditorias (used in KPI)
  GraduationCap, // Treinamentos (used in KPI)
  ChevronRight,
  // Database, // Exemplo de ícone para dados - REMOVED
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getAllKpis } from '@/lib/db'; // Importar funções do banco de dados
import DashboardCharts from '@/components/dashboard/charts'; // Importar o componente cliente para gráficos

// --- Tipos ---
interface Kpi {
  id: number;
  name: string;
  value: number;
  category: string | null;
  updated_at: string;
}

// --- Dados do Banco de Dados ---
async function fetchKpiData(): Promise<Kpi[]> {
  try {
    // A conexão já é gerenciada globalmente em db.ts
    // Não precisamos abrir/fechar aqui
    const kpis = await getAllKpis();
    console.log("KPIs buscados do banco de dados:", kpis);
    // Garantir que o retorno seja do tipo Kpi[]
    return kpis as Kpi[];
  } catch (error) {
    console.error("Erro ao buscar KPIs do banco de dados:", error);
    return []; // Retorna array vazio em caso de erro
  }
}

// Função auxiliar para encontrar valor de KPI
function findKpiValue(kpis: Kpi[], name: string, defaultValue: number): number {
  const kpi = kpis.find(k => k.name === name);
  // Se kpi for encontrado e value for um número, retorna value, senão defaultValue
  return kpi && typeof kpi.value === 'number' ? kpi.value : defaultValue;
}


export default async function EhsDashboardPage() { // Marcar como async para usar await
  const kpiDataFromDb = await fetchKpiData();

  // Mapear dados do DB para os valores de KPI usando a função auxiliar
  const kpiValues = {
    riscosIdentificados: findKpiValue(kpiDataFromDb, 'Riscos Identificados', 15),
    riscosCriticos: findKpiValue(kpiDataFromDb, 'Riscos Críticos', 2),
    incidentesAbertos: findKpiValue(kpiDataFromDb, 'Incidentes Abertos', 3),
    incidentesComAfastamento: findKpiValue(kpiDataFromDb, 'Incidentes com Afastamento', 1),
    auditoriasPendentes: findKpiValue(kpiDataFromDb, 'Auditorias Pendentes', 2),
    auditoriasInternas: findKpiValue(kpiDataFromDb, 'Auditorias Internas Pendentes', 1), // Keep for the card
    auditoriasExternas: findKpiValue(kpiDataFromDb, 'Auditorias Externas Pendentes', 1), // Keep for the card
    treinamentosVencidos: findKpiValue(kpiDataFromDb, 'Treinamentos Vencidos', 5),
    treinamentosProximaSemana: findKpiValue(kpiDataFromDb, 'Treinamentos Vencendo Próx. Semana', 2),
  };

  // Dados de exemplo para passar para o componente cliente de gráficos
  // Idealmente, isso também viria do banco de dados
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

       {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Riscos Identificados */}
          <Card className="shadow-md border border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Riscos Identificados</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
               <CardContent className="pt-0 pb-2">
                  <div className="text-2xl font-bold">{kpiValues.riscosIdentificados}</div>
                  <p className="text-xs text-muted-foreground">Críticos: {kpiValues.riscosCriticos}</p>
               </CardContent>
              <CardFooter className="pt-2 pb-4 px-6">
                 <Link href="/seguranca-trabalho/inventario-jsa" className="flex items-center justify-between w-full text-sm text-primary hover:underline"> {/* Updated Link */}
                      Ver Inventário JSA <ChevronRight className="h-4 w-4" />
                  </Link>
              </CardFooter>
          </Card>

           {/* Incidentes Abertos */}
          <Card className="shadow-md border border-border">
               <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Incidentes Abertos</CardTitle>
                  <FileWarning className="h-5 w-5 text-muted-foreground" />
               </CardHeader>
                <CardContent className="pt-0 pb-2">
                   <div className="text-2xl font-bold">{kpiValues.incidentesAbertos}</div>
                   <p className="text-xs text-muted-foreground">Com Afastamento: {kpiValues.incidentesComAfastamento}</p>
                </CardContent>
               <CardFooter className="pt-2 pb-4 px-6">
                   <Link href="/seguranca-trabalho/incidentes" className="flex items-center justify-between w-full text-sm text-primary hover:underline">
                      Ver Incidentes <ChevronRight className="h-4 w-4" />
                   </Link>
               </CardFooter>
          </Card>

           {/* Auditorias Pendentes */}
           <Card className="shadow-md border border-border">
               <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Auditorias Pendentes</CardTitle>
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
               </CardHeader>
                <CardContent className="pt-0 pb-2">
                    <div className="text-2xl font-bold">{kpiValues.auditoriasPendentes}</div>
                    <p className="text-xs text-muted-foreground">Internas: {kpiValues.auditoriasInternas}, Externas: {kpiValues.auditoriasExternas}</p>
                </CardContent>
               <CardFooter className="pt-2 pb-4 px-6">
                   <Link href="/seguranca-trabalho/auditorias" className="flex items-center justify-between w-full text-sm text-primary hover:underline">
                      Ver Auditorias <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
          </Card>

           {/* Treinamentos Vencidos */}
          <Card className="shadow-md border border-border">
               <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Treinamentos Vencidos</CardTitle>
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
               </CardHeader>
                <CardContent className="pt-0 pb-2">
                   <div className="text-2xl font-bold">{kpiValues.treinamentosVencidos}</div>
                   <p className="text-xs text-muted-foreground">Próxima Semana: {kpiValues.treinamentosProximaSemana}</p>
                </CardContent>
               <CardFooter className="pt-2 pb-4 px-6">
                 <Link href="/geral/treinamentos" className="flex items-center justify-between w-full text-sm text-primary hover:underline">
                      Ver Treinamentos <ChevronRight className="h-4 w-4" />
                  </Link>
               </CardFooter>
          </Card>
      </div>

      {/* Section for displaying raw KPI data removed */}


      {/* Renderizar o componente cliente para gráficos */}
      <DashboardCharts
        incidentesData={incidentesQuaseAcidentesData}
        atividadesData={atividadesSegurancaData}
      />

    </>
  );
}
