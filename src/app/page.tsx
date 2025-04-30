
"use client";

import React from 'react';
import {
  ShieldCheck, // Updated icon for logo (EHS related)
  BarChart3, // Icon for Page Title
  AlertTriangle, // Icon for Análise de Riscos
  FileWarning, // Icon for Incidentes
  ClipboardCheck, // Icon for Auditorias
  FileCheck2, // Icon for Permissões de Trabalho
  GraduationCap, // Icon for Treinamentos
  Users,
  FileText as FileTextIcon, // Renamed to avoid conflict
  ChevronRight,
  LineChart, // Keep for chart titles
  LogOut, // Keep for logout
  User, // Icon for user info
  ClipboardList, // Icon for Cadastros
  HardHat, // Icon for EPIs
  HeartPulse, // Icon for ASOs
  FlaskConical, // Icon for Inventário Químico
  Folder, // Icon for Documentos
  ListChecks, // Icon for Plano de Ação
  Stethoscope, // Icon for Doenças Ocup.
  BarChartBig, // Icon for Estatísticas
  Gavel, // Icon for Ações Trab.
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';
import Link from 'next/link'; // Import Link

// Removed useAuth and related imports as auth is disabled for now
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';

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
  SidebarGroup, // Import SidebarGroup
} from '@/components/ui/sidebar';
// import { Button } from '@/components/ui/button'; // Keep if needed later
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Added CardDescription and CardFooter
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart"; // Import ChartConfig type

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
  // Removed auth checks
  // const { isAuthenticated, logout, isLoading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   // Redirect to login if not authenticated and not loading
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, router, isLoading]);

  // // Show loading state or nothing while checking auth
  // if (isLoading || !isAuthenticated) {
  //   return (
  //       <div className="flex h-screen items-center justify-center">
  //           <p>Carregando...</p> {/* Or a spinner */}
  //       </div>
  //   );
  // }

  // Hardcoded user info for now
  const userName = "admin";
  const userIP = "192.168.56.1";

  // Fake logout function for now
  const handleLogout = () => {
    console.log("Logout clicked");
    // Implement actual logout logic here when auth is re-enabled
    // router.push('/login');
  };


  // Render the dashboard content
  return (
    <SidebarProvider>
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="items-center gap-2 p-4 h-16 border-b border-sidebar-border">
                 <ShieldCheck className="size-6 shrink-0 text-primary"/>
                 <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                     <span className="text-lg font-semibold">Gestão EHS</span>
                     {/* Removed subtitle */}
                 </div>
            </SidebarHeader>
            <SidebarContent className="p-2 flex-1 overflow-y-auto">
                <SidebarMenu>
                    {/* Menu Items Group */}
                    <SidebarGroup className="p-0">
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Cadastros">
                                <ClipboardList />
                                <span>Cadastros</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Análise de Riscos">
                                <AlertTriangle />
                                <span>Análise de Riscos</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Incidentes">
                                <FileWarning />
                                <span>Incidentes</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Auditorias">
                                <ClipboardCheck />
                                <span>Auditorias</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Inventário Químico">
                                <FlaskConical />
                                <span>Inventário Químico</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Plano de Ação">
                                <ListChecks />
                                <span>Plano de Ação</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Permissões de Trabalho">
                                <FileCheck2 />
                                <span>Permissões</span>
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
                                <HeartPulse />
                                <span>ASOs</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Doenças Ocupacionais">
                                <Stethoscope />
                                <span>Doenças Ocup.</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Documentos">
                                <Folder />
                                <span>Documentos</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Usuários">
                                <Users />
                                <span>Usuários</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Ações Trabalhistas">
                                <Gavel />
                                <span>Ações Trab.</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Logs de Atividades">
                                <FileTextIcon />
                                <span>Logs de Atividades</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Estatísticas">
                                <BarChartBig />
                                <span>Estatísticas</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroup>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2 border-t border-sidebar-border">
                 {/* Logout Button */}
                <SidebarMenuButton
                    variant="ghost"
                    onClick={handleLogout}
                    tooltip="Logout"
                    className="justify-center group-data-[collapsible=icon]:justify-center"
                    >
                    <LogOut />
                     <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset>
            {/* Header */}
            <header className="flex items-center justify-between border-b bg-background p-4 h-16">
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1" /> {/* Spacer */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4"/>
                    <span>Você está logado como <span className="font-semibold text-foreground">{userName}</span> - IP: <span className="font-semibold text-foreground">{userIP}</span></span>
                    {/* Add dropdown for user actions if needed */}
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 p-6 bg-muted/40">
                {/* Page Title */}
                <div className="flex items-center gap-2 mb-6">
                     <BarChart3 className="h-6 w-6 text-foreground" />
                     <div>
                        <h1 className="text-2xl font-semibold ">Página Inicial EHS</h1>
                        <p className="text-sm text-muted-foreground">Visão Geral de Segurança e Meio Ambiente</p>
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
                         <CardContent className="pt-0 pb-2 text-2xl font-bold">
                            15
                         </CardContent>
                        <CardFooter className="pt-2 pb-4 px-6">
                           <Link href="#" className="flex items-center justify-between w-full text-sm text-blue-100 hover:text-white transition-colors">
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
                          <CardContent className="pt-0 pb-2 text-2xl font-bold">
                            3
                         </CardContent>
                         <CardFooter className="pt-2 pb-4 px-6">
                             <Link href="#" className="flex items-center justify-between w-full text-sm text-red-100 hover:text-white transition-colors">
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
                          <CardContent className="pt-0 pb-2 text-2xl font-bold">
                            2
                         </CardContent>
                         <CardFooter className="pt-2 pb-4 px-6">
                             <Link href="#" className="flex items-center justify-between w-full text-sm text-yellow-100 hover:text-white transition-colors">
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
                          <CardContent className="pt-0 pb-2 text-2xl font-bold">
                            5
                         </CardContent>
                         <CardFooter className="pt-2 pb-4 px-6">
                           <Link href="#" className="flex items-center justify-between w-full text-sm text-green-100 hover:text-white transition-colors">
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
                                        {/* Legend might be redundant if only one line */}
                                        {/* <ReLegend content={<ChartLegendContent />} />  */}
                                    </ReLineChart>
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

