
"use client";

import React from 'react';
import {
  Boxes, // Updated icon for logo
  BarChart3, // Icon for Page Title
  Box,
  Folder,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  FileText as FileTextIcon, // Renamed to avoid conflict
  ChevronRight,
  LineChart, // Keep for chart titles
  Settings, // Keep if needed later
  LogOut, // Keep for logout
  User, // Icon for user info
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
  SidebarGroupLabel, // Import SidebarGroupLabel
} from '@/components/ui/sidebar';
// import { Button } from '@/components/ui/button'; // Keep if needed later
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Added CardDescription and CardFooter
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart"; // Import ChartConfig type

// --- Sample Data ---
const entradasSaidasData = [
  { date: '14/08', Entradas: 0, Saídas: 0 },
  { date: '15/08', Entradas: 0, Saídas: 0 },
  { date: '16/08', Entradas: 0, Saídas: 0 },
  { date: '17/08', Entradas: 1.0, Saídas: 0 },
  { date: '18/08', Entradas: 1.8, Saídas: 0.5 },
  { date: '19/08', Entradas: 0, Saídas: 2.0 },
  { date: '20/08', Entradas: 0, Saídas: 0.8 },
  { date: '21/08', Entradas: 0, Saídas: 0 },
  { date: '22/08', Entradas: 0.8, Saídas: 1.2 },
  { date: '23/08', Entradas: 0.8, Saídas: 2.0 },
];

const atividadesData = [
  { date: '14/08', Atividades: 0 },
  { date: '15/08', Atividades: 0 },
  { date: '16/08', Atividades: 0 },
  { date: '17/08', Atividades: 0 },
  { date: '18/08', Atividades: 10 },
  { date: '19/08', Atividades: 20 },
  { date: '20/08', Atividades: 5 },
  { date: '21/08', Atividades: 65 },
  { date: '22/08', Atividades: 40 },
  { date: '23/08', Atividades: 140 },
  { date: '24/08', Atividades: 50 },
];

// --- Chart Configs ---
const entradasSaidasConfig = {
  Entradas: {
    label: "Entradas",
    color: "hsl(var(--chart-1))", // Blueish
  },
  Saídas: {
    label: "Saídas",
    color: "hsl(var(--chart-2))", // Greenish
  },
} satisfies ChartConfig;

const atividadesConfig = {
  Atividades: {
    label: "Atividades no Sistema",
    color: "hsl(var(--chart-3))", // Orangish/Yellowish
  },
} satisfies ChartConfig;


export default function EstoqueDashboardPage() {
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
                 <Boxes className="size-6 shrink-0 text-primary"/>
                 <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                     <span className="text-lg font-semibold">Controle Estoque</span>
                     <span className="text-xs text-muted-foreground">Entrada e Saída de Produtos</span>
                 </div>
            </SidebarHeader>
            <SidebarContent className="p-2 flex-1 overflow-y-auto">
                <SidebarMenu>
                    {/* Gerenciamento Group */}
                    <SidebarGroup className="p-0">
                         <SidebarGroupLabel className="px-2 text-xs uppercase text-muted-foreground font-semibold group-data-[collapsible=icon]:hidden">Gerenciamento</SidebarGroupLabel>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Produtos">
                                <Box />
                                <span>Produtos</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Categorias">
                                <Folder />
                                <span>Categorias</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Fornecedores">
                                <Truck />
                                <span>Fornecedores</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroup>

                     {/* Movimentação Group */}
                    <SidebarGroup className="p-0 mt-4">
                         <SidebarGroupLabel className="px-2 text-xs uppercase text-muted-foreground font-semibold group-data-[collapsible=icon]:hidden">Movimentação</SidebarGroupLabel>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Entradas">
                                <ArrowDownLeft />
                                <span>Entradas</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Saídas">
                                <ArrowUpRight />
                                <span>Saídas</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroup>

                     {/* Administração Group */}
                     <SidebarGroup className="p-0 mt-4">
                         <SidebarGroupLabel className="px-2 text-xs uppercase text-muted-foreground font-semibold group-data-[collapsible=icon]:hidden">Administração</SidebarGroupLabel>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Usuários">
                                <Users />
                                <span>Usuários</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton href="#" tooltip="Logs de Atividades">
                                <FileTextIcon />
                                <span>Logs de Atividades</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarGroup>

                    {/* Optional: Settings moved to footer or separate menu */}
                     {/* <SidebarMenuItem className="mt-auto">
                        <SidebarMenuButton href="#" tooltip="Configurações">
                            <Settings />
                            <span>Configurações</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem> */}
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
                        <h1 className="text-2xl font-semibold ">Página Inicial</h1>
                        <p className="text-sm text-muted-foreground">Visão Geral do Controle de Estoque</p>
                     </div>
                </div>

                 {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Produtos Cadastrados */}
                    <Card className="bg-blue-600 text-white shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">4 Produtos Cadastrados</CardTitle>
                            <CardDescription className="text-sm text-blue-100">19 Itens no Estoque</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2 pb-4 px-6">
                           <Link href="#" className="flex items-center justify-between w-full text-sm text-blue-100 hover:text-white transition-colors">
                                Ver Relação de Produtos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </CardFooter>
                    </Card>

                     {/* Estoque Zerado */}
                    <Card className="bg-red-600 text-white shadow-md">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">2 Produtos Com Estoque Zerado</CardTitle>
                            {/* Optional: Add description if needed */}
                         </CardHeader>
                         <CardFooter className="pt-2 pb-4 px-6">
                             <Link href="#" className="flex items-center justify-between w-full text-sm text-red-100 hover:text-white transition-colors">
                                Ver Produtos Estoque Zerado <ChevronRight className="h-4 w-4" />
                             </Link>
                         </CardFooter>
                    </Card>

                     {/* Estoque Mínimo */}
                     <Card className="bg-yellow-500 text-white shadow-md">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">3 Produtos Com Estoque Mínimo</CardTitle>
                             {/* Optional: Add description if needed */}
                         </CardHeader>
                         <CardFooter className="pt-2 pb-4 px-6">
                             <Link href="#" className="flex items-center justify-between w-full text-sm text-yellow-100 hover:text-white transition-colors">
                                Ver Produtos Estoque Mínimo <ChevronRight className="h-4 w-4" />
                            </Link>
                         </CardFooter>
                    </Card>

                     {/* Investimento */}
                    <Card className="bg-green-600 text-white shadow-md">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Investimento: R$ 517,00</CardTitle>
                         </CardHeader>
                         <CardContent className="pt-0 pb-2 text-sm text-green-100">
                             <p>Retorno Previsto: R$ 1.412,35</p>
                         </CardContent>
                         <CardFooter className="pt-1 pb-4 px-6">
                             <p className="text-sm font-medium text-white">Margem de Lucro: 63,39%</p>
                         </CardFooter>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Entradas e Saídas Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                               <LineChart className="h-5 w-5 text-muted-foreground"/> Entradas e Saídas Últimos 10 Dias
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ChartContainer config={entradasSaidasConfig} className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart
                                        data={entradasSaidasData}
                                        margin={{ top: 5, right: 20, left: -15, bottom: 5 }} // Adjusted left margin
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}/>
                                        <YAxis tickLine={false} axisLine={false} dx={-10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 'dataMax + 0.2']}/>
                                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <Line type="monotone" dataKey="Entradas" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                        <Line type="monotone" dataKey="Saídas" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                        <ReLegend content={<ChartLegendContent />} />
                                    </ReLineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                     {/* Atividades no Sistema Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                               <LineChart className="h-5 w-5 text-muted-foreground"/> Atividades no Sistema Últimos 10 Dias
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={atividadesConfig} className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart
                                        data={atividadesData}
                                        margin={{ top: 5, right: 20, left: -15, bottom: 5 }} // Adjusted left margin
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}/>
                                        <YAxis tickLine={false} axisLine={false} dx={-10} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 'dataMax + 10']}/>
                                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <Line type="monotone" dataKey="Atividades" name="Atividades no Sistema" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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

// Removed duplicate ChartConfig type definition
