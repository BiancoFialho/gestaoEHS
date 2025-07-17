
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck, 
  BarChart3, 
  FileWarning, 
  ClipboardCheck, 
  FileCheck2, 
  GraduationCap, 
  Users, 
  FileText as FileTextIcon, 
  LogOut, 
  User, 
  ClipboardList, 
  HardHat, 
  HeartPulse, 
  FlaskConical, 
  Folder, 
  ListChecks, 
  Stethoscope, 
  BarChartBig, 
  Gavel, 
  Shield, 
  Leaf, 
  Target, 
  Activity, 
  LayoutDashboard, 
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
import { useToast } from '@/hooks/use-toast';

const ehsMenu = [
    {
      title: "Segurança do Trabalho",
      icon: Shield,
      basePath: "/seguranca-trabalho",
      subItems: [
        { title: "Indicadores Desempenho", icon: BarChartBig, href: "/seguranca-trabalho/indicadores-desempenho" },
        { title: "Indicadores Prevenção", icon: Activity, href: "/seguranca-trabalho/indicadores-prevencao" },
        { title: "Inventário JSA", icon: ClipboardList, href: "/seguranca-trabalho/inventario-jsa" },
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
      basePath: "/saude-ocupacional",
      subItems: [
        { title: "Indicadores", icon: Activity, href: "/saude-ocupacional/indicadores" },
        { title: "ASOs", icon: FileTextIcon, href: "/saude-ocupacional/asos" }, 
        { title: "Doenças Ocup.", icon: Stethoscope, href: "/saude-ocupacional/doencas-ocupacionais" },
      ],
    },
    {
      title: "Meio Ambiente",
      icon: Leaf,
      basePath: "/meio-ambiente",
      subItems: [
        { title: "Indicadores", icon: Activity, href: "/meio-ambiente/indicadores" },
        { title: "Inventário Químico", icon: FlaskConical, href: "/meio-ambiente/inventario-quimico" },
      ],
    },
    {
      title: "Indicadores Integrados",
      icon: Target,
      basePath: "/indicadores-integrados",
      subItems: [
        { title: "Indicadores", icon: Activity, href: "/indicadores-integrados/indicadores" },
        { title: "Estatísticas", icon: BarChartBig, href: "/indicadores-integrados/estatisticas" },
      ],
    },
     {
        title: "Geral",
        icon: ClipboardList, 
        basePath: "/geral",
        subItems: [
          { title: "Cadastros", icon: ClipboardList, href: "/geral/cadastros" },
          { title: "Treinamentos", icon: GraduationCap, href: "/geral/treinamentos" },
          { title: "Documentos", icon: Folder, href: "/geral/documentos" },
          { title: "Usuários", icon: Users, href: "/geral/usuarios" },
          { title: "Logs de Atividades", icon: FileTextIcon, href: "/geral/logs" },
        ],
    },
  ];

const getActiveCategory = (pathname: string) => {
    const activeCategory = ehsMenu.find(category => pathname.startsWith(category.basePath));
    return activeCategory ? activeCategory.basePath : null;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    const activeCategory = getActiveCategory(pathname);
    if (activeCategory) {
        setOpenAccordionItems([`category-${ehsMenu.findIndex(c => c.basePath === activeCategory)}`]);
    } else {
        setOpenAccordionItems([]);
    }
  }, [pathname]);

  const userName = "Usuário (Login Desabilitado)";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="items-center gap-2 p-4 h-16 border-b border-sidebar-border">
          <ShieldCheck className="size-6 shrink-0 text-primary" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-semibold">Gestão EHS</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-1 overflow-y-auto">
          <SidebarMenu className="mb-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" size="sm" className="h-8 justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Link href="/">
                 <LayoutDashboard className="size-4 shrink-0" />
                 <span className="truncate group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <Accordion 
            type="multiple" 
            className="w-full"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
          >
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
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
                          tooltip={subItem.title}
                          data-active={pathname === subItem.href}
                        >
                          <Link href={subItem.href || '#'}>
                            {subItem.icon && <subItem.icon className="size-3.5 shrink-0" />}
                            <span className="truncate">{subItem.title}</span>
                          </Link>
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
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between border-b bg-background p-4 h-16">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" /> 
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>
              {userName}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
