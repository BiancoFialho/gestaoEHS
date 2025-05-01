
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
  ArrowDown, // Low Priority Icon
  CheckCircle, // Completed Icon
  XCircle // Cancelled Icon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
// Importar nova função para buscar todos os itens ordenados
import { getAllActionItemsSortedByDueDate } from '@/lib/db';
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
async function fetchAllActionItems(): Promise<ActionItem[]> {
  try {
    const items = await getAllActionItemsSortedByDueDate(); // Busca todos os itens
    console.log("All action items fetched:", items);
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

// Função auxiliar para ícone de status
const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
   switch (status) {
       case 'Aberta': return <Clock className="h-4 w-4 text-blue-500" />;
       case 'Em Andamento': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
       case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
       case 'Atrasada': return <AlertTriangle className="h-4 w-4 text-destructive" />;
       case 'Cancelada': return <XCircle className="h-4 w-4 text-muted-foreground" />; // Assuming XCircle exists
       default: return <Clock className="h-4 w-4 text-muted-foreground" />;
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
 const isOverdue = (dueDateStr: string | null, status: string) => {
     if (status === 'Concluída' || status === 'Cancelada' || !dueDateStr) return false;
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
  const allActionItems = await fetchAllActionItems(); // Buscar todos os itens

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

      {/* Renderizar o componente cliente para gráficos */}
      <DashboardCharts
        incidentesData={incidentesQuaseAcidentesData}
        atividadesData={atividadesSegurancaData}
      />

      {/* Action Plan Card - Moved below charts */}
       <Card className="shadow-md border border-border mt-6"> {/* Added mt-6 for spacing */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" /> Plano de Ação Completo
            </CardTitle>
            <CardDescription>Lista de todas as ações, ordenadas por data de vencimento.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
             {allActionItems.length > 0 ? (
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
                        {allActionItems.map((item) => (
                            <TableRow key={item.id} className={isOverdue(item.due_date, item.status) && item.status !== 'Concluída' && item.status !== 'Cancelada' ? 'bg-destructive/10' : ''}>
                                <TableCell className="text-center">{getPriorityIcon(item.priority)}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{item.description}</TableCell>
                                <TableCell>{item.responsible_name || 'N/A'}</TableCell>
                                <TableCell>
                                    {item.due_date ? format(new Date(item.due_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                                    {isOverdue(item.due_date, item.status) && item.status !== 'Concluída' && item.status !== 'Cancelada' && <AlertTriangle className="inline ml-1 h-4 w-4 text-destructive" title="Atrasado"/>}
                                </TableCell>
                                <TableCell>
                                <Badge variant={getStatusBadgeVariant(item.status)} className="flex items-center gap-1 w-fit">
                                    {getStatusIcon(item.status)}
                                    {item.status}
                                </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ação encontrada.</p>
             )}
          </CardContent>
           {/* Footer removed as it linked to the full page */}
           {/* <CardFooter className="pt-2 pb-4 px-6">
               <Link href="/seguranca-trabalho/plano-acao" className="flex items-center justify-end w-full text-sm text-primary hover:underline">
                   Ver Plano de Ação Completo <ChevronRight className="h-4 w-4 ml-1" />
               </Link>
           </CardFooter> */}
       </Card>


    </>
  );
}

