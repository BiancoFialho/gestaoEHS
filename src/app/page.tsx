
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  HardHat,
  Stethoscope,
  FlaskConical,
  FileText,
  AreaChart,
  ListChecks,
  ShieldAlert,
  Activity,
  LineChart,
  Gavel,
  Settings,
  LogOut,
  TriangleAlert,
  Skull,
  Gauge,
  CalendarX2,
  Briefcase,
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend, PieChart, Pie, Cell } from 'recharts';

import { useAuth } from '@/context/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";


// Sample data for charts
const accidentTrendData = [
  { month: 'Jan', Acidentes: 0 },
  { month: 'Fev', Acidentes: 0 },
  { month: 'Mar', Acidentes: 0 },
  { month: 'Abr', Acidentes: 0 },
  { month: 'Mai', Acidentes: 0 },
  { month: 'Jun', Acidentes: 0 },
];

const asoStatusData = [
  { name: 'Válido', value: 80, fill: 'hsl(var(--chart-1))' }, // Teal
  { name: 'Próximo Venc.', value: 15, fill: 'hsl(var(--chart-3))' }, // Orange/Yellow
  { name: 'Vencido', value: 5, fill: 'hsl(var(--chart-5))' }, // Red
];
const asoStatusConfig = {
  value: {
    label: "Status",
  },
  Válido: {
    label: "Válido",
    color: "hsl(var(--chart-1))",
  },
  "Próximo Venc.": {
    label: "Próximo Venc.",
    color: "hsl(var(--chart-3))",
  },
  Vencido: {
    label: "Vencido",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


const accidentTrendConfig = {
  Acidentes: {
    label: "Acidentes",
    color: "hsl(var(--chart-5))", // Red
  },
} satisfies ChartConfig


export default function DashboardPage() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoading]);

  // Show loading state or nothing while checking auth
  if (isLoading || !isAuthenticated) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Carregando...</p> {/* Or a spinner */}
        </div>
    );
  }

  // Render the protected content if authenticated
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
            <SidebarHeader className="items-center gap-2 p-4">
                 {/* Placeholder Logo/Text */}
                 <LayoutDashboard className="size-6 shrink-0 text-primary"/>
                 <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">EHS Control</span>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="#" isActive tooltip="Dashboard BI">
                            <LayoutDashboard />
                            <span>Dashboard BI</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* TODO: Implement Collapsible Group for Cadastros if needed */}
                    <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Cadastros">
                             <ClipboardList />
                            <span>Cadastros</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Treinamentos">
                            <GraduationCap />
                            <span>Treinamentos</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="EPIs">
                            <HardHat />
                            <span>EPIs</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="ASOs">
                            <Stethoscope />
                            <span>ASOs</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Inventário Químico">
                            <FlaskConical />
                            <span>Inventário Químico</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Documentos">
                            <FileText />
                            <span>Documentos</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Análise de Riscos">
                            <AreaChart />
                            <span>Análise de Riscos</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Plano de Ação">
                            <ListChecks />
                            <span>Plano de Ação</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Prevenção (CIPA)">
                            <ShieldAlert />
                            <span>Prevenção (CIPA)</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Doenças Ocup.">
                            <Activity />
                            <span>Doenças Ocup.</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Estatísticas">
                            <LineChart />
                            <span>Estatísticas</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Ações Trab.">
                            <Gavel />
                            <span>Ações Trab.</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="#" tooltip="Configurações">
                            <Settings />
                            <span>Configurações</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-sidebar-border">
                 {/* Tooltip version for collapsed state */}
                <SidebarMenuButton
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={logout}
                    tooltip="Logout"
                    aria-label="Logout"
                    >
                    <LogOut />
                     <span className="sr-only group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>

        <SidebarInset>
            <header className="flex items-center justify-between border-b bg-background p-4 h-16">
                <SidebarTrigger className="md:hidden" />
                <div className="flex flex-col md:text-left text-center flex-1 md:ml-4">
                    <h1 className="text-xl font-semibold ">Dashboard BI - Indicadores Chave (KPIs)</h1>
                    <p className="text-sm text-muted-foreground">Análise visual dos indicadores chave de Segurança, Saúde e Meio Ambiente (Ano 2025).</p>
                </div>
                 {/* Add User menu or other header items here if needed */}
            </header>

            <main className="flex-1 p-6 bg-muted/40">
                 {/* KPI Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-destructive">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Acidentes no Período</CardTitle>
                            <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">(612.920 no Brasil em 2022)</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-destructive">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Óbitos</CardTitle>
                            <Skull className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">(Meta: 0 / 2.538 óbitos no BR em 2022)</p>
                        </CardContent>
                    </Card>
                     <Card className="border-l-4 border-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Frequência (TF)</CardTitle>
                            <Gauge className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0.00</div>
                            <p className="text-xs text-muted-foreground">Abaixo/Igual à Meta (15)</p>
                             <p className="text-xs text-muted-foreground">Abaixo/Igual média BR (Média BR: 14.3)</p>
                        </CardContent>
                    </Card>
                     <Card className="border-l-4 border-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dias Perdidos (TG)</CardTitle>
                            <CalendarX2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                             <p className="text-xs text-muted-foreground">TG: 0.00</p>
                            <p className="text-xs text-muted-foreground">Total de dias de afastamento</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Ações Trabalhistas Card */}
                <div className="mb-6">
                    <Card className="border-l-4 border-primary">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ações Trabalhistas Ativas</CardTitle>
                             <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Processos em andamento</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Tendência de Acidentes Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tendência de Acidentes</CardTitle>
                             <p className="text-sm text-muted-foreground">Número de acidentes registrados por mês (Ano 2025).</p>
                        </CardHeader>
                        <CardContent>
                           <ChartContainer config={accidentTrendConfig} className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart
                                    data={accidentTrendData}
                                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                    >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}/>
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} dx={-10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                    <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                                    <Line type="monotone" dataKey="Acidentes" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} />
                                     <ReLegend content={<ChartLegendContent />} />
                                    </ReLineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                     {/* Status dos ASOs Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status dos ASOs</CardTitle>
                             <p className="text-sm text-muted-foreground">Distribuição percentual dos ASOs por status (exemplo).</p>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                             <ChartContainer config={asoStatusConfig} className="h-[200px] w-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={asoStatusData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            strokeWidth={2}
                                             >
                                             {asoStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                             ))}
                                        </Pie>
                                         <ReLegend content={<ChartLegendContent verticalAlign="bottom" />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}

// Define ChartConfig type (adjust if you have a central types file)
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> } // Assuming theme keys are strings
  )
};

    