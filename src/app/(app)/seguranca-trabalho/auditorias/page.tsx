
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, PlusCircle, FileSearch, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import AuditDialog from '@/components/auditorias/AuditDialog'; // Importar o novo dialog
import { useToast } from '@/hooks/use-toast';
import { fetchAllAuditsAction } from '@/actions/dataFetchingActions';

interface AuditEntry {
  id: number;
  type: string;
  scope: string;
  audit_date: string; // YYYY-MM-DD
  auditor: string;
  lead_auditor_id: number | null;
  lead_auditor_name?: string | null; // Nome do auditor líder vindo do JOIN
  status: string | null;
  non_conformities_count?: number; // Adicionado para a coluna "Não Conf."
  // Adicione outros campos que podem vir do DB, como 'findings', 'report_path', etc.
}

export default function AuditoriasPage() {
  const [isAuditDialogOpen, setAuditDialogOpen] = useState(false);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchAudits = useCallback(async () => {
    console.log("[AuditoriasPage] Iniciando fetchAudits.");
    setIsLoading(true);
    try {
      const result = await fetchAllAuditsAction();
      if (result.success && result.data) {
        console.log(`[AuditoriasPage] ${result.data.length} auditorias recebidas.`);
        setAudits(result.data as AuditEntry[]);
      } else {
        console.error("[AuditoriasPage] Falha ao buscar auditorias:", result.error);
        toast({
          title: "Erro ao Carregar Auditorias",
          description: result.error || "Não foi possível buscar as auditorias.",
          variant: "destructive",
        });
        setAudits([]);
      }
    } catch (error) {
      console.error("[AuditoriasPage] Exceção ao buscar auditorias:", error);
      toast({
        title: "Erro Crítico ao Carregar Auditorias",
        description: error instanceof Error ? error.message : "Não foi possível buscar auditorias.",
        variant: "destructive",
      });
      setAudits([]);
    } finally {
      setIsLoading(false);
      console.log("[AuditoriasPage] fetchAudits finalizado.");
    }
  }, [toast]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const handleDialogClose = (open: boolean) => {
    setAuditDialogOpen(open);
    // Não precisa recarregar aqui se o callback onAuditAdded for usado
  };

  const handleAuditAdded = () => {
    console.log("[AuditoriasPage] handleAuditAdded chamado, recarregando auditorias.");
    fetchAudits(); // Recarrega a lista após uma auditoria ser adicionada
  };

    const getStatusIcon = (status: string | null) => {
        if (!status) return <Clock className="h-4 w-4 text-muted-foreground" />;
        switch (status) {
            case 'Planejada': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Em Andamento': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
            case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Cancelada': return <XCircle className="h-4 w-4 text-muted-foreground" />;
            case 'Atrasada': return <Clock className="h-4 w-4 text-destructive" />; // Exemplo para status atrasado
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

     const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Planejada': return 'outline';
            case 'Em Andamento': return 'secondary';
            case 'Concluída': return 'default';
            case 'Cancelada': return 'secondary';
            case 'Atrasada': return 'destructive';
            default: return 'outline';
        }
     };

  const filteredAudits = audits.filter(audit =>
    audit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (audit.audit_date && new Date(audit.audit_date + 'T00:00:00').toLocaleDateString('pt-BR').includes(searchTerm)) ||
    (audit.lead_auditor_name && audit.lead_auditor_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditAudit = (auditId: number) => {
    // Lógica para abrir o diálogo em modo de edição (não implementado neste commit)
    console.log(`Editar auditoria ID: ${auditId}`);
    toast({ title: "Pendente", description: "Edição de auditoria ainda não implementada." });
  };

  const handleViewReport = (auditId: number) => {
    // Lógica para visualizar relatório (não implementado neste commit)
    console.log(`Visualizar relatório da auditoria ID: ${auditId}`);
    toast({ title: "Pendente", description: "Visualização de relatório ainda não implementada." });
  };


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

       <div className="mb-4">
           <Input
            placeholder="Buscar por tipo, escopo, auditor, data (dd/mm/aaaa) ou auditor líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
       </div>

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
                <TableHead>Auditor Líder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Não Conf.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Carregando auditorias...</TableCell></TableRow>
              ) : filteredAudits.length > 0 ? (
                filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{audit.scope}</TableCell>
                    <TableCell>{audit.audit_date ? new Date(audit.audit_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>{audit.lead_auditor_name || 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(audit.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(audit.status)}
                         {audit.status || 'N/A'}
                        </Badge>
                    </TableCell>
                     <TableCell className="text-center">
                         <Badge variant={audit.non_conformities_count && audit.non_conformities_count > 0 ? 'destructive' : 'default'} className={audit.non_conformities_count === 0 ? 'bg-green-600 hover:bg-green-700' : ''}>
                            {audit.non_conformities_count ?? 0}
                         </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewReport(audit.id)}>
                         <FileSearch className="mr-1 h-4 w-4" /> Ver Relatório
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditAudit(audit.id)}>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhuma auditoria encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AuditDialog
        open={isAuditDialogOpen}
        onOpenChange={handleDialogClose}
        onAuditAdded={handleAuditAdded} // Passar o callback
      />
    </div>
  );
}
