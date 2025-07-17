
"use client";

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ListChecks,
  AlertTriangle,
  Clock,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';

// --- Tipos ---
interface ActionItem {
  id: number;
  description: string;
  origin: string | null;
  responsible_name: string | null;
  due_date: string;
  priority: string;
  status: string;
}

interface ActionPlanTableProps {
  items: ActionItem[];
}

// --- Funções Auxiliares (movidas para o componente cliente) ---
const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Alta': return <AlertTriangle className="h-4 w-4 text-destructive" title="Prioridade Alta" />;
    case 'Média': return <Clock className="h-4 w-4 text-yellow-500" title="Prioridade Média" />;
    case 'Baixa': return <ArrowDown className="h-4 w-4 text-green-600" title="Prioridade Baixa" />;
    default: return null;
  }
};

const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
   switch (status) {
       case 'Aberta': return <Clock className="h-4 w-4 text-blue-500" />;
       case 'Em Andamento': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
       case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
       case 'Atrasada': return <AlertTriangle className="h-4 w-4 text-destructive" />;
       case 'Cancelada': return <XCircle className="h-4 w-4 text-muted-foreground" />;
       default: return <Clock className="h-4 w-4 text-muted-foreground" />;
   }
};

const getStatusBadgeVariant = (status: string | null | undefined) => {
    if (!status) return 'outline';
    switch (status) {
        case 'Aberta': return 'outline';
        case 'Em Andamento': return 'secondary';
        case 'Concluída': return 'default';
        case 'Atrasada': return 'destructive';
        case 'Cancelada': return 'secondary';
        default: return 'outline';
    }
 };

 const isOverdue = (dueDateStr: string | null, status: string) => {
     if (status === 'Concluída' || status === 'Cancelada' || !dueDateStr) return false;
     try {
         const dueDate = new Date(dueDateStr + 'T00:00:00');
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         return dueDate < today;
     } catch (e) {
         console.error("Error parsing date:", dueDateStr, e);
         return false;
     }
 }

export default function ActionPlanTable({ items }: ActionPlanTableProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" /> Plano de Ação
        </CardTitle>
        <CardDescription>Ações pendentes e atrasadas, ordenadas por prioridade e prazo.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-2 flex-grow">
        <ScrollArea className="h-[300px]">
         {items.length > 0 ? (
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
                    {items.map((item) => (
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
         </ScrollArea>
      </CardContent>
       <CardFooter className="pt-2 pb-4 px-6 mt-auto">
           <Link href="/seguranca-trabalho/plano-acao" className="flex items-center justify-end w-full text-sm text-primary hover:underline">
               Ver Plano de Ação Completo <ChevronRight className="h-4 w-4 ml-1" />
           </Link>
       </CardFooter>
   </Card>
  );
}
