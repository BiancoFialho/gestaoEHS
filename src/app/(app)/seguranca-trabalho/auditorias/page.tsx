
"use client"; // Add "use client" directive

import React from 'react';
import { ClipboardCheck, PlusCircle, FileSearch, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status

// Placeholder Dialog Component (to be created)
// import AuditDialog from '@/components/auditorias/AuditDialog';

export default function AuditoriasPage() {
  // Placeholder state and functions for dialogs
  const [isAuditDialogOpen, setAuditDialogOpen] = React.useState(false);

  // Placeholder data for audit list
  const audits = [
    { id: 1, type: "Interna", scope: "Processo de Produção A", date: "2024-09-15", auditor: "Equipe Interna", findings_summary: "3 NC Menores, 5 Observações", non_conformities: 3, status: "Planejada" },
    { id: 2, type: "Comportamental", scope: "Setor de Montagem", date: "2024-07-20", auditor: "Consultoria XYZ", findings_summary: "10 Observações Comportamentais", non_conformities: 0, status: "Concluída" },
    { id: 3, type: "Externa (ISO 45001)", scope: "Sistema de Gestão SST", date: "2024-06-05", auditor: "Certificadora ABC", findings_summary: "1 NC Maior, 2 NC Menores", non_conformities: 3, status: "Concluída" },
    { id: 4, type: "Interna", scope: "Almoxarifado", date: "2024-05-10", auditor: "Equipe Interna", findings_summary: "Nenhuma NC encontrada", non_conformities: 0, status: "Concluída" },
    { id: 5, type: "Interna", scope: "Manutenção", date: "2024-08-28", auditor: "Equipe Interna", findings_summary: "", non_conformities: 0, status: "Em Andamento" },
     { id: 6, type: "Externa (Cliente)", scope: "Requisitos Cliente X", date: "2024-04-15", auditor: "Cliente X", findings_summary: "Cancelada pelo cliente", non_conformities: 0, status: "Cancelada" },
  ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Planejada': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Em Andamento': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
            case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Cancelada': return <XCircle className="h-4 w-4 text-muted-foreground" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

     const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Planejada': return 'outline';
            case 'Em Andamento': return 'secondary'; // Yellowish
            case 'Concluída': return 'default'; // Greenish
            case 'Cancelada': return 'secondary'; // Grayish
            default: return 'outline';
        }
     }


  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Auditorias</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
        </div>
         <Button onClick={() => setAuditDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Agendar Auditoria
         </Button>
      </div>

      {/* Search and Filters (Optional) */}
       <div className="mb-4">
           <Input placeholder="Buscar por tipo, escopo, auditor ou data..." />
           {/* Add filter dropdowns for status, type, year */}
       </div>


      {/* Audit List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda e Histórico de Auditorias</CardTitle>
          <CardDescription>Auditorias internas, externas e comportamentais.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Auditor(es)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Não Conf.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.length > 0 ? (
                audits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{audit.scope}</TableCell>
                    <TableCell>{audit.date}</TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(audit.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(audit.status)}
                         {audit.status}
                        </Badge>
                    </TableCell>
                     <TableCell className="text-center">
                         <Badge variant={audit.non_conformities > 0 ? 'destructive' : 'default'} className={audit.non_conformities == 0 ? 'bg-green-600 hover:bg-green-700' : ''}>
                            {audit.non_conformities}
                         </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                         <FileSearch className="mr-1 h-4 w-4" /> Ver Relatório
                      </Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Link to findings/action plans */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma auditoria encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* TODO: Add pagination */}
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <AuditDialog open={isAuditDialogOpen} onOpenChange={setAuditDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para agendar/editar auditorias e visualizar relatórios será implementado aqui.</p>
      </div>
    </div>
  );
}
