"use client"; // Keep 'use client' as charts and potentially other components need client-side rendering

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
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// --- Sample Data (Needs EHS context later) ---
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

// --- Chart Configs ---
const incidentesQuaseAcidentesConfig = {
  Incidentes: {
    label: "Incidentes",
    color: "hsl(var(--chart-1))", // Red
  },
  QuaseAcidentes: {
    label: "Quase Acidentes",
    color: "hsl(var(--chart-2))", // Orange
  },
} satisfies ChartConfig;

const atividadesSegurancaConfig = {
  AtividadesSeguranca: {
    label: "Atividades de Segurança",
    color: "hsl(var(--chart-3))", // Blue
  },
} satisfies ChartConfig;


export default function EhsDashboardPage() {
  // Note: Sidebar and Header are now in the parent layout (src/app/(app)/layout.tsx)
  // This component only renders the main content area.

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
          <Card className="bg-blue-600 text-white shadow-md">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Riscos Identificados</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-blue-100" />
              </CardHeader>
               <CardContent className="pt-0 pb-2">
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-blue-200">Críticos: 2</p>
               </CardContent>
              <CardFooter className="pt-2 pb-4 px-6">
                 <Link href="/seguranca-trabalho/analise-riscos" className="flex items-center justify-between w-full text-sm text-blue-100 hover:text-white transition-colors">
                      Ver Mapa de Riscos <ChevronRight className="h-4 w-4" />
                  </Link>
              </CardFooter>
          </Card>

           {/* Incidentes Abertos */}
          <Card className="bg-red-600 text-white shadow-md">
               <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Incidentes Abertos</CardTitle>
                  <FileWarning className="h-5 w-5 text-red-100" />
               </CardHeader>
                <CardContent className="pt-0 pb-2">
                   <div className="text-2xl font-bold">3</div>
                   <p className="text-xs text-red-200">Com Afastamento: 1</p>
                </CardContent>
               <CardFooter className="pt-2 pb-4 px-6">
                   <Link href="/seguranca-trabalho/incidentes" className="flex items-center justify-between w-full text-sm text-red-100 hover:text-white transition-colors">
                      Ver Incidentes <ChevronRight className="h-4 w-4" />
                   </Link>
               </CardFooter>
          </Card>

           {/* Auditorias Pendentes */}
           <Card className="bg-yellow-500 text-white shadow-md">
               <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Auditorias Pendentes</CardTitle>
                  <ClipboardCheck className="h-5 w-5 text-yellow-100" />
               </CardHeader>
                <CardContent className="pt-0 pb-2">
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-yellow-200">Internas: 1, Externas: 1</p>
                </CardContent>
               <CardFooter className="pt-2 pb-4 px-6">
                   <Link href="/seguranca-trabalho/auditorias" className="flex items-center justify-between w-full text-sm text-yellow-100 hover:text-white transition-colors">
                      Ver Auditorias <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
          </Card>

           {/* Treinamentos Vencidos */}
          <Card className="bg-green-600 text-white shadow-md">
               <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Treinamentos Vencidos</CardTitle>
                  <GraduationCap className="h-5 w-5 text-green-100" />
               </CardHeader>
                <CardContent className="pt-0 pb-2">
                   <div className="text-2xl font-bold">5</div>
                   <p className="text-xs text-green-200">Próxima Semana: 2</p>
                </CardContent>
               <CardFooter className="pt-2 pb-4 px-6">
                 <Link href="/geral/treinamentos" className="flex items-center justify-between w-full text-sm text-green-100 hover:text-white transition-colors">
                      Ver Treinamentos <ChevronRight className="h-4 w-4" />
                  </Link>
               </CardFooter>
          </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Incidentes e Quase Acidentes Chart */}
          <Card>
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <LineChart className="h-5 w-5 text-muted-foreground"/> Incidentes e Quase Acidentes (Últimos 10 Dias)
                  </CardTitle>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={incidentesQuaseAcidentesConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart
                              data={incidentesQuaseAcidentesData}
                              margin={{ top: 5, right: 20, left: -15, bottom: 5 }} // Adjusted left margin
                          >
                              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                              <XAxis dataKey="date" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}/>
                              <YAxis tickLine={false} axisLine={false} dx={-10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} domain={[0, 'dataMax + 1']}/>
                              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                              <Line type="monotone" dataKey="Incidentes" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                              <Line type="monotone" dataKey="QuaseAcidentes" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                              <ReLegend content={<ChartLegendContent />} />
                          </ReLineChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>

           {/* Atividades de Segurança Chart */}
          <Card>
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <LineChart className="h-5 w-5 text-muted-foreground"/> Atividades de Segurança (Últimos 10 Dias)
                  </CardTitle>
              </CardHeader>
              <CardContent>
                   <ChartContainer config={atividadesSegurancaConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart
                              data={atividadesSegurancaData}
                              margin={{ top: 5, right: 20, left: -15, bottom: 5 }} // Adjusted left margin
                          >
                              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                              <XAxis dataKey="date" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}/>
                              <YAxis tickLine={false} axisLine={false} dx={-10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 'dataMax + 10']}/>
                              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                              <Line type="monotone" dataKey="AtividadesSeguranca" name="Atividades de Segurança" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          </ReLineChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
      </div>
    </>
  );
}
