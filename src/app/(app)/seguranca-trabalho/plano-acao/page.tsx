
import React from 'react';
import { ListChecks, PlusCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react'; // Re-using ListChecks icon and adding others
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status and priority

// Placeholder Dialog Component (to be created)
// import ActionPlanDialog from '@/components/plano-acao/ActionPlanDialog';

export default function PlanoAcaoPage() {
  // Placeholder state and functions for dialogs
  const [isActionDialogOpen, setActionDialogOpen] = React.useState(false);

  // Placeholder data for action plan items
  const actions = [
    { id: 1, description: "Instalar guarda-corpo na plataforma X", origin: "Risco ID 1", responsible: "Manutenção", due_date: "2024-09-15", priority: "Alta", status: "Aberta" },
    { id: 2, description: "Revisar procedimento de bloqueio e etiquetagem", origin: "Auditoria ID 3 (NC Maior)", responsible: "Engenharia Seg.", due_date: "2024-08-30", priority: "Alta", status: "Em Andamento" },
    { id: 3, description: "Realizar treinamento de primeiros socorros", origin: "Obrigação Legal", responsible: "RH/Segurança", due_date: "2024-10-31", priority: "Média", status: "Aberta" },
    { id: 4, description: "Sinalizar área de tráfego de empilhadeiras", origin: "Incidente ID 3 (Quase Acidente)", responsible: "Logística", due_date: "2024-07-31", priority: "Média", status: "Concluída", completion_date: "2024-07-28" },
    { id: 5, description: "Adquirir novos protetores auriculares", origin: "Monitoramento Agentes", responsible: "Compras/Segurança", due_date: "2024-08-20", priority: "Baixa", status: "Atrasada" },
  ];

   const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'Alta': return 'destructive';
            case 'Média': return 'secondary'; // Yellowish
            case 'Baixa': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Aberta': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Em Andamento': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
            case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Atrasada': return <AlertTriangle className="h-4 w-4 text-destructive" />;
            case 'Cancelada': return <XCircle className="h-4 w-4 text-muted-foreground" />; // Assuming XCircle exists
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

     const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Aberta': return 'outline'; // Blueish
            case 'Em Andamento': return 'secondary'; // Yellowish
            case 'Concluída': return 'default'; // Greenish
            case 'Atrasada': return 'destructive';
            case 'Cancelada': return 'secondary'; // Grayish
            default: return 'outline';
        }
     }

     const isOverdue = (dueDateStr: string, status: string) => {
         if (status === 'Concluída' || status === 'Cancelada') return false;
         return new Date(dueDateStr) < new Date();
     }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
         <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Plano de Ação</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
         </div>
         <Button onClick={() => setActionDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ação
         </Button>
      </div>

       {/* Search and Filters (Optional) */}
       <div className="mb-4">
           <Input placeholder="Buscar por descrição, origem, responsável ou status..." />
           {/* Add filter dropdowns for status, priority, responsible, due date range */}
       </div>


      {/* Action Plan Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Plano de Ação</CardTitle>
          <CardDescription>Ações corretivas e preventivas originadas de diversas fontes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição da Ação</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.length > 0 ? (
                actions.map((action) => (
                  <TableRow key={action.id} className={isOverdue(action.due_date, action.status) ? 'bg-destructive/10' : ''}>
                    <TableCell className="font-medium max-w-sm truncate">{action.description}</TableCell>
                    <TableCell>{action.origin}</TableCell>
                    <TableCell>{action.responsible}</TableCell>
                    <TableCell>
                        {action.due_date}
                        {isOverdue(action.due_date, action.status) && <AlertTriangle className="inline ml-1 h-4 w-4 text-destructive" title="Atrasado"/>}
                    </TableCell>
                     <TableCell>
                        <Badge variant={getPriorityBadgeVariant(action.priority)}>{action.priority}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(action.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(action.status)}
                         {action.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Detalhes</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Add complete/reopen buttons based on status */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum item de ação encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           {/* TODO: Add pagination */}
        </CardContent>
      </Card>


      {/* Placeholder for Dialog */}
      {/* <ActionPlanDialog open={isActionDialogOpen} onOpenChange={setActionDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar itens do plano de ação será implementado aqui.</p>
      </div>
    </div>
  );
}