
"use client";

import React from 'react';
import { LineChart, BarChart3 } from 'lucide-react'; // Importar ícones necessários
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// --- Tipos para os dados do gráfico ---
interface IncidentData {
  date: string;
  Incidentes: number;
  QuaseAcidentes: number;
}

interface ActivityData {
  date: string;
  AtividadesSeguranca: number;
}

interface DashboardChartsProps {
  incidentesData: IncidentData[];
  atividadesData: ActivityData[];
}

// --- Configurações do Gráfico ---
const incidentesQuaseAcidentesConfig = {
  Incidentes: {
    label: "Incidentes",
    color: "hsl(var(--chart-1))", // Usa a variável CSS para vermelho
  },
  QuaseAcidentes: {
    label: "Quase Acidentes",
    color: "hsl(var(--chart-2))", // Usa a variável CSS para laranja
  },
} satisfies ChartConfig;

const atividadesSegurancaConfig = {
  AtividadesSeguranca: {
    label: "Atividades de Segurança",
    color: "hsl(var(--chart-3))", // Usa a variável CSS para azul
  },
} satisfies ChartConfig;


export default function DashboardCharts({ incidentesData, atividadesData }: DashboardChartsProps) {
  return (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Incidentes e Quase Acidentes */}
          <Card>
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <LineChart className="h-5 w-5 text-muted-foreground"/> Incidentes e Quase Acidentes
                  </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                  <ChartContainer config={incidentesQuaseAcidentesConfig} className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart
                              data={incidentesData}
                              margin={{ top: 5, right: 10, left: -20, bottom: 0 }} // Ajustar margens se necessário
                          >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                              <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel />}
                              />
                              <ReLegend content={<ChartLegendContent />} />
                              <Line
                                  dataKey="Incidentes"
                                  type="monotone"
                                  stroke="var(--color-Incidentes)"
                                  strokeWidth={2}
                                  dot={true}
                              />
                              <Line
                                  dataKey="QuaseAcidentes"
                                  type="monotone"
                                  stroke="var(--color-QuaseAcidentes)"
                                  strokeWidth={2}
                                  dot={true}
                              />
                          </ReLineChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>

           {/* Gráfico 2: Atividades de Segurança */}
          <Card>
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <BarChart3 className="h-5 w-5 text-muted-foreground"/> Atividades de Segurança
                  </CardTitle>
              </CardHeader>
               <CardContent className="h-[250px]">
                  <ChartContainer config={atividadesSegurancaConfig} className="w-full h-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart
                              data={atividadesData}
                              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                          >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                               <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel />}
                              />
                              <ReLegend content={<ChartLegendContent />} />
                              <Line
                                  dataKey="AtividadesSeguranca"
                                  type="monotone"
                                  stroke="var(--color-AtividadesSeguranca)"
                                  strokeWidth={2}
                                  dot={true}
                              />
                          </ReLineChart>
                      </ResponsiveContainer>
                  </ChartContainer>
               </CardContent>
          </Card>
      </div>
  );
}
