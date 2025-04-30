
"use client";

import React from 'react';
import {
  ShieldCheck, // Logo
  BarChart3, // Page Title
  AlertTriangle, // Análise de Riscos (used in KPI)
  FileWarning, // Incidentes (used in KPI)
  ClipboardCheck, // Auditorias (used in KPI)
  FileCheck2, // Permissões de Trabalho (old menu)
  GraduationCap, // Treinamentos (used in KPI)
  Users, // Usuários (old menu)
  FileText as FileTextIcon, // Logs (old menu)
  ChevronRight,
  LineChart, // Chart titles
  LogOut, // Logout
  User, // User info
  ClipboardList, // Cadastros (old menu)
  HardHat, // EPIs (old menu)
  HeartPulse, // Saúde Ocupacional / ASOs
  FlaskConical, // Inventário Químico (old menu)
  Folder, // Documentos (old menu)
  ListChecks, // Plano de Ação (old menu)
  Stethoscope, // Doenças Ocup. (old menu)
  BarChartBig, // Estatísticas (old menu)
  Gavel, // Ações Trab. (old menu)
  Shield, // Segurança do Trabalho (new menu)
  Leaf, // Meio Ambiente (new menu)
  Target, // Indicadores Integrados (new menu)
  Activity, // Generic indicator icon
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';
import Link from 'next/link';

// Removed useAuth and related imports as auth is disabled for now

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion components

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  // Hardcoded user info for now
  const userName = "admin";
  const userIP = "192.168.56.1";

  // Fake logout function for now
  const handleLogout = () => {
    console.log("Logout clicked");
  };

  // EHS Menu Structure
  const ehsMenu = [
    {
      title: "Segurança do Trabalho",
      icon: Shield,
      subItems: [
        { title: "Indicadores de Desempenho", icon: BarChartBig, items: [
          "Nº Acidentes c/ Afastamento",
          "Nº Acidentes s/ Afastamento",
          "Taxa de Frequência (TF)",
          "Taxa de Gravidade (TG)",
          "Dias Perdidos",
          "Nº Fatalidades",
          "Índice Acidentes / Setor",
          "Custo Acidentes",
          "Taxa de Incidência (TI)",
        ]},
        { title: "Indicadores de Prevenção", icon: ListChecks, items: [
          "Nº Inspeções",
          "Nº Auditorias",
          "Nº Treinamentos",
          "Nº Não Conformidades",
          "Nº Ações Implementadas",
          "Adesão EPI",
          "Participação DDS",
          "Observações Comport.",
          "Perigos Controlados (%)",
        ]},
        // Add other relevant top-level items under Segurança if needed
         { title: "Análise de Riscos", icon: AlertTriangle, items: []},
         { title: "Incidentes", icon: FileWarning, items: [] },
         { title: "Auditorias", icon: ClipboardCheck, items: [] },
         { title: "Permissões", icon: FileCheck2, items: [] },
         { title: "EPIs", icon: HardHat, items: [] },
         { title: "Plano de Ação", icon: ListChecks, items: [] },
         { title: "Ações Trab.", icon: Gavel, items: [] },
      ],
    },
    {
      title: "Saúde Ocupacional",
      icon: HeartPulse,
      subItems: [
        { title: "Indicadores", icon: Activity, items: [
          "Absenteísmo / Doença",
          "Nº Exames Médicos",
          "Casos Doenças Trab.",
          "Aptidão vs. Inaptidão",
          "Incidência LER/DORT",
          "Monitoramento Agentes",
          "Avaliações Psicossociais",
          "Cobertura Vacinação",
          "Tempo Afastamento",
          "ASOs", // Added ASO here as per previous structure
          "Doenças Ocup.", // Added Doenças Ocup. here
        ]},
      ],
    },
    {
      title: "Meio Ambiente",
      icon: Leaf,
      subItems: [
        { title: "Indicadores", icon: Activity, items: [
          "Geração Resíduos",
          "Taxa Reciclagem",
          "Resíduos Perigosos",
          "Consumo Água",
          "Consumo Energia",
          "Emissões GEE",
          "Derrames / Vazamentos",
          "Autos Infração Amb.",
          "Atendimento Legislação (%)",
          "Materiais Perigosos Arm.",
          "Inventário Químico", // Added Inventário Químico here
        ]},
      ],
    },
    {
      title: "Indicadores Integrados",
      icon: Target,
      subItems: [
        { title: "Indicadores", icon: Activity, items: [
          "Maturidade EHS",
          "Conformidade Legal",
          "Score Auditoria Interna",
          "Engajamento Colab.",
          "ROI Programas EHS",
          "Horas Treinamento / Colab.",
          "Indicadores ESG (Foco EHS)",
          "Estatísticas", // Added Estatísticas here
        ]},
      ],
    },
     {
        title: "Geral", // Category for items without specific EHS group
        icon: ClipboardList, // Using Cadastros icon
        subItems: [
          { title: "Cadastros", icon: ClipboardList, items: [] },
          { title: "Treinamentos", icon: GraduationCap, items: [] }, // Moved to Geral for now
          { title: "Documentos", icon: Folder, items: [] },
          { title: "Usuários", icon: Users, items: [] },
          { title: "Logs de Atividades", icon: FileTextIcon, items: [] },
        ],
    },
  ];


  // Render the dashboard content
  return (
    <SidebarProvider>
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="items-center gap-2 p-4 h-16 border-b border-sidebar-border">
                 <ShieldCheck className="size-6 shrink-0 text-primary"/>
                 <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                     <span className="text-lg font-semibold">Gestão EHS</span>
                 </div>
            </SidebarHeader>
            <SidebarContent className="p-2 flex-1 overflow-y-auto">
                 <Accordion type="multiple" className="w-full">
                   {ehsMenu.map((category, catIndex) => (
                     <AccordionItem value={`category-${catIndex}`} key={`category-${catIndex}`} className="border-none">
                       <AccordionTrigger className="px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline rounded-md [&[data-state=open]>svg]:rotate-90 group-data-[collapsible=icon]:justify-center">
                         <div className="flex items-center gap-2">
                           <category.icon className="size-4 shrink-0" />
                           <span className="group-data-[collapsible=icon]:hidden">{category.title}</span>
                         </div>
                       </AccordionTrigger>
                       <AccordionContent className="pt-1 pb-0 pl-5 pr-0 group-data-[collapsible=icon]:hidden">
                         {category.subItems.map((subItem, subIndex) => (
                           subItem.items && subItem.items.length > 0 ? (
                             <Accordion type="multiple" key={`sub-${catIndex}-${subIndex}`} className="w-full">
                               <AccordionItem value={`subitem-${catIndex}-${subIndex}`} className="border-none">
                                 <AccordionTrigger className="px-2 py-1.5 text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:no-underline rounded-md [&[data-state=open]>svg]:rotate-90">
                                   <div className="flex items-center gap-2">
                                     {subItem.icon && <subItem.icon className="size-3.5 shrink-0" />}
                                     <span>{subItem.title}</span>
                                   </div>
                                 </AccordionTrigger>
                                 <AccordionContent className="pt-1 pb-0 pl-4 pr-0">
                                   <SidebarMenu className="gap-0.5">
                                     {subItem.items.map((item, itemIndex) => (
                                       <SidebarMenuItem key={`item-${catIndex}-${subIndex}-${itemIndex}`}>
                                         <SidebarMenuButton href="#" variant="ghost" size="sm" className="h-7 justify-start text-sidebar-foreground/70 hover:text-sidebar-accent-foreground">
                                           <span className="truncate">{item}</span>
                                         </SidebarMenuButton>
                                       </SidebarMenuItem>
                                     ))}
                                   </SidebarMenu>
                                 </AccordionContent>
                               </AccordionItem>
                             </Accordion>
                           ) : (
                               // Render as a direct link if no sub-items
                               <SidebarMenu key={`sub-direct-${catIndex}-${subIndex}`} className="pl-2">
                                   <SidebarMenuItem>
                                       <SidebarMenuButton href="#" variant="ghost" size="sm" className="h-7 justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground">
                                            {subItem.icon && <subItem.icon className="size-3.5 shrink-0" />}
                                           <span className="truncate">{subItem.title}</span>
                                       </SidebarMenuButton>
                                   </SidebarMenuItem>
                               </SidebarMenu>
                           )
                         ))}
                       </AccordionContent>
                     </AccordionItem>
                   ))}
                 </Accordion>
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
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 p-6 bg-muted/40">
                {/* Page Title */}
                <div className="flex items-center gap-2 mb-6">
                     <BarChart3 className="h-6 w-6 text-foreground" />
                     <div>
                        <h1 className="text-2xl font-semibold ">Página Inicial EHS</h1>
                        <p className="text-sm text-muted-foreground">Visão Geral de Segurança, Saúde e Meio Ambiente</p> {/* Updated description */}
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
