
// Marcar como Server Component (ou usar Server Actions)
// "use client" removido pois vamos buscar dados no servidor

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart3, // Page Title
  ChevronRight,
  ListChecks, // Plano de Ação Icon
  AlertTriangle, // High Priority Icon
  Clock, // Medium Priority Icon
  ArrowDown // Low Priority Icon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getDashboardActionItems } from '@/lib/db'; // Importar função para buscar itens do plano de ação
import DashboardCharts from '@/components/dashboard/charts'; // Importar o componente cliente para gráficos

// --- Tipos ---
interface ActionItem {
  id: number;
  description: string;
  origin: string | null;
  responsible_name: string | null; // Nome do responsável vindo do JOIN
  due_date: string;
  priority: string;
  status: string;
}

// --- Dados do Banco de Dados ---
async function fetchActionItems(): Promise<ActionItem[]> {
  try {
    const items = await getDashboardActionItems(5); // Busca 5 itens para o dashboard
    console.log("Action items fetched:", items);
    return items as ActionItem[];
  } catch (error) {
    console.error("Erro ao buscar itens do plano de ação:", error);
    return []; // Retorna array vazio em caso de erro
  }
}

// Função auxiliar para ícone de prioridade
const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Alta': return <AlertTriangle className="h-4 w-4 text-destructive" title="Prioridade Alta" />;
    case 'Média': return <Clock className="h-4 w-4 text-yellow-500" title="Prioridade Média" />;
    case 'Baixa': return <ArrowDown className="h-4 w-4 text-green-600" title="Prioridade Baixa" />;
    default: return null;
  }
};

// Função auxiliar para variant da badge de status
const getStatusBadgeVariant = (status: string | null | undefined) => {
    if (!status) return 'outline';
    switch (status) {
        case 'Aberta': return 'outline'; // Blueish
        case 'Em Andamento': return 'secondary'; // Yellowish
        case 'Concluída': return 'default'; // Greenish
        case 'Atrasada': return 'destructive';
        case 'Cancelada': return 'secondary'; // Grayish
        default: return 'outline';
    }
 };

 // Função para verificar se está atrasado
 const isOverdue = (dueDateStr: string, status: string) => {
     if (status === 'Concluída' || status === 'Cancelada') return false;
     try {
         // Garante que a data esteja no formato YYYY-MM-DD para comparação correta
         const dueDate = new Date(dueDateStr + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
         const today = new Date();
         today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas a data
         return dueDate < today;
     } catch (e) {
         console.error("Error parsing date:", dueDateStr, e);
         return false; // Considera não atrasado se houver erro no parse
     }
 }


export default async function EhsDashboardPage() { // Marcar como async para usar await
  const actionItems = await fetchActionItems();

  // Dados de exemplo para gráficos (mantidos)
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

       {/* KPI Cards Row REMOVIDO */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"> ... </div> */}

      {/* Action Plan Card */}
       <Card className="shadow-md border border-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" /> Plano de Ação Pendente
            </CardTitle>
            <CardDescription>Ações abertas ou atrasadas com maior prioridade.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
             {actionItems.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Prior.</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {actionItems.map((item) => (
                            <TableRow key={item.id} className={isOverdue(item.due_date, item.status) ? 'bg-destructive/10' : ''}>
                                <TableCell className="text-center">{getPriorityIcon(item.priority)}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{item.description}</TableCell>
                                <TableCell>{item.responsible_name || 'N/A'}</TableCell>
                                <TableCell>
                                    {format(new Date(item.due_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                                    {isOverdue(item.due_date, item.status) && <AlertTriangle className="inline ml-1 h-4 w-4 text-destructive" title="Atrasado"/>}
                                </TableCell>
                                <TableCell>
                                <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação pendente encontrada.</p>
             )}
          </CardContent>
           <CardFooter className="pt-2 pb-4 px-6">
               <Link href="/seguranca-trabalho/plano-acao" className="flex items-center justify-end w-full text-sm text-primary hover:underline">
                   Ver Plano de Ação Completo <ChevronRight className="h-4 w-4 ml-1" />
               </Link>
           </CardFooter>
       </Card>


      {/* Renderizar o componente cliente para gráficos */}
      <DashboardCharts
        incidentesData={incidentesQuaseAcidentesData}
        atividadesData={atividadesSegurancaData}
      />

    </>
  );
}
