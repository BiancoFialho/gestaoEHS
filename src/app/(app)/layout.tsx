"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, // Logo
  BarChart3, // Page Title (used in old header, keep for consistency if needed elsewhere)
  AlertTriangle, // Análise de Riscos
  FileWarning, // Incidentes
  ClipboardCheck, // Auditorias
  FileCheck2, // Permissões de Trabalho
  GraduationCap, // Treinamentos
  Users, // Usuários
  FileText as FileTextIcon, // Logs
  LogOut, // Logout
  User, // User info
  ClipboardList, // Cadastros
  HardHat, // EPIs
  HeartPulse, // Saúde Ocupacional / ASOs
  FlaskConical, // Inventário Químico
  Folder, // Documentos
  ListChecks, // Plano de Ação
  Stethoscope, // Doenças Ocup.
  BarChartBig, // Estatísticas / Indicadores Desempenho
  Gavel, // Ações Trab.
  Shield, // Segurança do Trabalho
  Leaf, // Meio Ambiente
  Target, // Indicadores Integrados
  Activity, // Generic indicator icon / Indicadores Prevenção
  LayoutDashboard, // Dashboard Icon
} from 'lucide-react';

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
} from "@/components/ui/accordion";

// NOTE: useAuth is not used here as authentication is currently disabled.
// If re-enabled, you might need to uncomment and use it.
// import { useAuth } from '@/context/AuthContext';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Hardcoded user info for now
  const userName = "admin";
  const userIP = "192.168.56.1"; // Example IP

  // Fake logout function for now
  const handleLogout = () => {
    console.log("Logout clicked");
    // If using NextAuth or similar, call signOut() here.
    // For basic context, you might call a context logout function.
    // If redirecting, use Next.js router.
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push('/login');
  };

  // EHS Menu Structure - Simplified
  const ehsMenu = [
    {
      title: "Segurança do Trabalho",
      icon: Shield,
      subItems: [
        { title: "Indicadores Desempenho", icon: BarChartBig, href: "/seguranca-trabalho/indicadores-desempenho" },
        { title: "Indicadores Prevenção", icon: Activity, href: "/seguranca-trabalho/indicadores-prevencao" },
        { title: "Análise de Riscos", icon: AlertTriangle, href: "/seguranca-trabalho/analise-riscos" },
        { title: "Incidentes", icon: FileWarning, href: "/seguranca-trabalho/incidentes" },
        { title: "Auditorias", icon: ClipboardCheck, href: "/seguranca-trabalho/auditorias" },
        { title: "Permissões", icon: FileCheck2, href: "/seguranca-trabalho/permissoes" },
        { title: "EPIs", icon: HardHat, href: "/seguranca-trabalho/epis" },
        { title: "Plano de Ação", icon: ListChecks, href: "/seguranca-trabalho/plano-acao" },
        { title: "Ações Trab.", icon: Gavel, href: "/seguranca-trabalho/acoes-trabalhistas" },
      ],
    },
    {
      title: "Saúde Ocupacional",
      icon: HeartPulse,
      subItems: [
        { title: "Indicadores", icon: Activity, href: "/saude-ocupacional/indicadores" },
        { title: "ASOs", icon: FileTextIcon, href: "/saude-ocupacional/asos" }, // Changed icon for variety
        { title: "Doenças Ocup.", icon: Stethoscope, href: "/saude-ocupacional/doencas-ocupacionais" },
      ],
    },
    {
      title: "Meio Ambiente",
      icon: Leaf,
      subItems: [
        { title: "Indicadores", icon: Activity, href: "/meio-ambiente/indicadores" },
        { title: "Inventário Químico", icon: FlaskConical, href: "/meio-ambiente/inventario-quimico" },
      ],
    },
    {
      title: "Indicadores Integrados",
      icon: Target,
      subItems: [
        { title: "Indicadores", icon: Activity, href: "/indicadores-integrados/indicadores" },
        { title: "Estatísticas", icon: BarChartBig, href: "/indicadores-integrados/estatisticas" },
      ],
    },
     {
        title: "Geral",
        icon: ClipboardList, // Using Cadastros icon for the category
        subItems: [
          { title: "Cadastros", icon: ClipboardList, href: "/geral/cadastros" },
          { title: "Treinamentos", icon: GraduationCap, href: "/geral/treinamentos" },
          { title: "Documentos", icon: Folder, href: "/geral/documentos" },
          { title: "Usuários", icon: Users, href: "/geral/usuarios" },
          { title: "Logs de Atividades", icon: FileTextIcon, href: "/geral/logs" },
        ],
    },
  ];

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="items-center gap-2 p-4 h-16 border-b border-sidebar-border">
          <ShieldCheck className="size-6 shrink-0 text-primary" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-semibold">Gestão EHS</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-1 overflow-y-auto">
          {/* Dashboard Link */}
          <SidebarMenu className="mb-2">
            <SidebarMenuItem>
              <SidebarMenuButton href="/" variant="ghost" size="sm" className="h-8 justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                 <LayoutDashboard className="size-4 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

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
                  <SidebarMenu className="gap-0.5">
                    {category.subItems.map((subItem, subIndex) => (
                      <SidebarMenuItem key={`sub-direct-${catIndex}-${subIndex}`}>
                        <SidebarMenuButton
                          href={subItem.href || '#'}
                          variant="ghost"
                          size="sm"
                          className="h-7 justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                          tooltip={subItem.title}
                        >
                          {subItem.icon && <subItem.icon className="size-3.5 shrink-0" />}
                          <span className="truncate">{subItem.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
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
            <User className="h-4 w-4" />
            <span>Você está logado como <span className="font-semibold text-foreground">{userName}</span> - IP: <span className="font-semibold text-foreground">{userIP}</span></span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}