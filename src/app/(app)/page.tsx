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
  LineChart, // Chart titles
  Database, // Exemplo de ícone para dados
} from 'lucide-react';
// Importações de Chart removidas temporariamente para Server Component
// import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// Importações de Chart removidas temporariamente
// import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
// import type { ChartConfig } from "@/components/ui/chart";
import { getDbConnection, getAllKpis } from '@/lib/db'; // Importar funções do banco de dados

// --- Dados do Banco de Dados ---
async function fetchKpiData() {
  try {
    const db = await getDbConnection();
    // Exemplo: Buscar alguns KPIs específicos ou todos
    const kpis = await getAllKpis(); // Busca todos os KPIs para exemplo
    console.log("KPIs buscados do banco de dados:", kpis);
    // Aqui você processaria os dados para os KPIs específicos que quer mostrar
    // Por enquanto, vamos retornar os dados brutos para demonstração
    return kpis;
  } catch (error) {
    console.error("Erro ao buscar KPIs do banco de dados:", error);
    return []; // Retorna array vazio em caso de erro
  }
}


export default async function EhsDashboardPage() { // Marcar como async para usar await
  const kpiDataFromDb = await fetchKpiData();

  // Valores Fictícios para KPIs (Substituir com dados do DB quando disponíveis)
  const kpiValues = {
    riscosIdentificados: kpiDataFromDb.find(k => k.name === 'Riscos Identificados')?.value ?? 15,
    riscosCriticos: kpiDataFromDb.find(k => k.name === 'Riscos Críticos')?.value ?? 2,
    incidentesAbertos: kpiDataFromDb.find(k => k.name === 'Incidentes Abertos')?.value ?? 3,
    incidentesComAfastamento: kpiDataFromDb.find(k => k.name === 'Incidentes com Afastamento')?.value ?? 1,
    auditoriasPendentes: kpiDataFromDb.find(k => k.name === 'Auditorias Pendentes')?.value ?? 2,
    auditoriasInternas: kpiDataFromDb.find(k => k.name === 'Auditorias Internas Pendentes')?.value ?? 1,
    auditoriasExternas: kpiDataFromDb.find(k => k.name === 'Auditorias Externas Pendentes')?.value ?? 1,
    treinamentosVencidos: kpiDataFromDb.find(k => k.name === 'Treinamentos Vencidos')?.value ?? 5,
    treinamentosProximaSemana: kpiDataFromDb.find(k => k.name === 'Treinamentos Vencendo Próx. Semana')?.value ?? 2,
  };


  // --- Sample Data (Mantido por enquanto, idealmente viria do DB) ---
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

  // --- Chart Configs (Removido temporariamente) ---
  // const incidentesQuaseAcidentesConfig = { ... };
  // const atividadesSegurancaConfig = { ... };


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
                 <Link href="/seguranca-trabalho/analise-riscos" className="flex items-center justify-between w-full text-sm text-primary hover:underline">
                      Ver Mapa de Riscos <ChevronRight className="h-4 w-4" />
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

      {/* Seção de Demonstração do Banco de Dados */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" /> Dados do Banco (Exemplo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kpiDataFromDb.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {kpiDataFromDb.map((kpi) => (
                <li key={kpi.id}>
                  {kpi.name}: {kpi.value} ({kpi.category || 'Sem categoria'}) - Atualizado em: {new Date(kpi.updated_at).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum KPI encontrado no banco de dados ou erro ao buscar.</p>
          )}
           {/* Botão para adicionar KPI de exemplo (requer Server Action ou API route) */}
           {/* <form action={addSampleKpiAction}> <Button type="submit" size="sm" className="mt-4">Adicionar KPI de Exemplo</Button> </form> */}
           <p className="text-xs text-muted-foreground mt-2">Nota: A adição de dados requer Server Actions ou uma API route.</p>
        </CardContent>
      </Card>


      {/* Charts Row - Temporariamente desabilitado em Server Component */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Placeholder para Gráfico 1 */}
          <Card>
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <LineChart className="h-5 w-5 text-muted-foreground"/> Incidentes e Quase Acidentes (Gráfico Desabilitado)
                  </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
                 (Gráfico será implementado em Client Component)
              </CardContent>
          </Card>

           {/* Placeholder para Gráfico 2 */}
          <Card>
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <LineChart className="h-5 w-5 text-muted-foreground"/> Atividades de Segurança (Gráfico Desabilitado)
                  </CardTitle>
              </CardHeader>
               <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
                 (Gráfico será implementado em Client Component)
               </CardContent>
          </Card>
      </div>
    </>
  );
}
