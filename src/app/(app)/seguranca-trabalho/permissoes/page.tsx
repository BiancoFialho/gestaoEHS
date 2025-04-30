
"use client"; // Add "use client" directive

import React from 'react';
import { FileCheck2, PlusCircle, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status

// Placeholder Dialog Component (to be created)
// import PermitDialog from '@/components/permissoes/PermitDialog';

export default function PermissoesPage() {
  // Placeholder state and functions for dialogs
  const [isPermitDialogOpen, setPermitDialogOpen] = React.useState(false);

  // Placeholder data for permit list
  const permits = [
    { id: 1, type: "Trabalho a Quente", location: "Oficina", start_datetime: "2024-08-26 09:00", end_datetime: "2024-08-26 17:00", requester: "João Silva", approver: "Admin EHS", status: "Aprovada" },
    { id: 2, type: "Espaço Confinado", location: "Tanque T-101", start_datetime: "2024-08-27 08:00", end_datetime: "2024-08-27 12:00", requester: "Maria Costa", approver: "Gerente Seg", status: "Solicitada" },
    { id: 3, type: "Trabalho em Altura", location: "Telhado Bloco B", start_datetime: "2024-08-25 13:00", end_datetime: "2024-08-25 16:00", requester: "Pedro Alves", approver: "Admin EHS", status: "Concluída" },
    { id: 4, type: "Trabalho a Quente", location: "Produção C", start_datetime: "2024-08-20 10:00", end_datetime: "2024-08-20 11:00", requester: "Ana Souza", approver: "Admin EHS", status: "Expirada" },
    { id: 5, type: "Içamento de Carga", location: "Pátio", start_datetime: "2024-09-01 14:00", end_datetime: "2024-09-01 15:00", requester: "Carlos Lima", approver: null, status: "Rejeitada" },
     { id: 6, type: "Espaço Confinado", location: "Caixa D'água", start_datetime: "2024-08-28 09:00", end_datetime: "2024-08-28 11:00", requester: "Fernanda Dias", approver: "Gerente Seg", status: "Em Andamento" },
  ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Solicitada': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Aprovada': return <CheckCircle className="h-4 w-4 text-yellow-500" />; // Yellow for Approved but not started/ongoing
            case 'Em Andamento': return <Clock className="h-4 w-4 text-green-600 animate-pulse" />;
            case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Rejeitada': return <XCircle className="h-4 w-4 text-destructive" />;
            case 'Expirada': return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Solicitada': return 'outline'; // Blueish or default
            case 'Aprovada': return 'secondary'; // Yellowish
            case 'Em Andamento': return 'default'; // Greenish pulsing?
            case 'Concluída': return 'outline'; // Gray/Greenish done
            case 'Rejeitada': return 'destructive';
            case 'Expirada': return 'secondary'; // Grayish
            default: return 'outline';
        }
     }


  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Permissões de Trabalho</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
        </div>
         <Button onClick={() => setPermitDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Solicitar Permissão
         </Button>
      </div>

      {/* Search and Filters (Optional) */}
       <div className="mb-4">
           <Input placeholder="Buscar por tipo, local, solicitante ou data..." />
           {/* Add filter dropdowns for status, type, date range */}
       </div>


      {/* Permit List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões de Trabalho (PTs)</CardTitle>
          <CardDescription>Gerenciamento de permissões para atividades de risco.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.length > 0 ? (
                permits.map((permit) => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-medium">{permit.type}</TableCell>
                    <TableCell>{permit.location}</TableCell>
                    <TableCell>{permit.start_datetime}</TableCell>
                    <TableCell>{permit.end_datetime}</TableCell>
                    <TableCell>{permit.requester}</TableCell>
                     <TableCell>
                        <Badge variant={getStatusBadgeVariant(permit.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(permit.status)}
                         {permit.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Ver</Button>
                      {/* Conditional buttons based on status */}
                      {(permit.status === 'Solicitada') && <Button variant="ghost" size="sm">Aprovar/Rej.</Button>}
                      {(permit.status === 'Aprovada' || permit.status === 'Em Andamento') && <Button variant="ghost" size="sm">Encerrar</Button>}
                      {(permit.status === 'Solicitada' || permit.status === 'Rejeitada') && <Button variant="ghost" size="sm">Editar</Button>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma permissão encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           {/* TODO: Add pagination */}
        </CardContent>
      </Card>


      {/* Placeholder for Dialog */}
      {/* <PermitDialog open={isPermitDialogOpen} onOpenChange={setPermitDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para solicitar/gerenciar permissões de trabalho será implementado aqui.</p>
      </div>
    </div>
  );
}
