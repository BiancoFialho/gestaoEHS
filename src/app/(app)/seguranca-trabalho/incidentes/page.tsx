
"use client";

import React from 'react';
import { FileWarning, PlusCircle, AlertCircle, CheckCircle, Clock, Edit, Eye, Info, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import IncidentDialog from '@/components/incidentes/IncidentDialog';
import IncidentDetailsDialog from '@/components/incidentes/IncidentDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { fetchAllIncidentsAction } from '@/actions/dataFetchingActions';
import { deleteIncidentAction } from '@/actions/incidentActions'; // Importar a nova action
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface IncidentEntry {
  id: number;
  date: string;
  type: string;
  severity: string | null;
  location_name: string | null;
  status: string | null;
  description: string;
  reporter_name: string | null;
  // Add other fields that might be returned by getAllIncidents
  involved_persons_ids?: string | null;
  root_cause?: string | null;
  corrective_actions?: string | null;
  preventive_actions?: string | null;
  investigation_responsible_id?: number | null;
  investigation_responsible_name?: string | null;
  lost_days?: number | null;
  cost?: number | null;
  closure_date?: string | null; // YYYY-MM-DD format expected from DB
}


export default function IncidentesPage() {
  const [isIncidentDialogOpen, setIncidentDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedIncidentForDetails, setSelectedIncidentForDetails] = React.useState<IncidentEntry | null>(null);
  const [selectedIncidentForEdit, setSelectedIncidentForEdit] = React.useState<IncidentEntry | null>(null);
  const [deletingIncident, setDeletingIncident] = React.useState<IncidentEntry | null>(null);
  const [incidents, setIncidents] = React.useState<IncidentEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const fetchIncidents = React.useCallback(async () => {
    setIsLoading(true);
    console.log("IncidentesPage: Iniciando fetchIncidents via action.");
    try {
      const result = await fetchAllIncidentsAction();
      if (result.success && result.data) {
        console.log(`IncidentesPage: ${result.data.length} incidentes recebidos da action.`);
        setIncidents(result.data);
      } else {
        console.error("IncidentesPage: Falha ao buscar incidentes da action:", result.error);
        toast({
          title: "Erro ao Carregar Incidentes",
          description: result.error || "Não foi possível buscar os incidentes.",
          variant: "destructive",
        });
        setIncidents([]);
      }
    } catch (error) {
      console.error("IncidentesPage: Exceção ao buscar incidentes:", error);
      toast({
        title: "Erro Crítico ao Carregar Incidentes",
        description: error instanceof Error ? error.message : "Não foi possível buscar os incidentes.",
        variant: "destructive",
      });
      setIncidents([]);
    } finally {
      setIsLoading(false);
      console.log("IncidentesPage: fetchIncidents finalizado.");
    }
  }, [toast]);

  React.useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleOpenDetailsDialog = (incident: IncidentEntry) => {
    setSelectedIncidentForDetails(incident);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenEditDialog = (incident: IncidentEntry) => {
    setSelectedIncidentForEdit(incident);
    setIncidentDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIncidentDialogOpen(open);
    if (!open) {
      setSelectedIncidentForEdit(null);
      fetchIncidents();
    }
  };

  const handleDetailsDialogClose = (open: boolean) => {
    setIsDetailsDialogOpen(open);
    if (!open) {
      setSelectedIncidentForDetails(null);
    }
  };

  const openDeleteConfirmation = (incident: IncidentEntry) => {
    setDeletingIncident(incident);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingIncident) return;
    setIsLoading(true);
    const result = await deleteIncidentAction(deletingIncident.id);
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `Incidente #${deletingIncident.id} foi excluído.`,
      });
      fetchIncidents();
    } else {
      toast({
        title: "Erro ao Excluir",
        description: result.error || "Não foi possível excluir o incidente.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setDeletingIncident(null);
  };

    const getSeverityBadgeVariant = (severity: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!severity) return 'outline';
        switch (severity) {
            case 'Fatalidade':
            case 'Grave': return 'destructive';
            case 'Moderado': return 'secondary';
            case 'Leve': return 'default';
            case 'Insignificante':
            case 'N/A': return 'outline';
            default: return 'outline';
        }
    };

     const getStatusIcon = (status: string | null | undefined) => {
         if (!status) return <Info className="h-4 w-4 text-muted-foreground" />;
        switch (status) {
            case 'Aberto': return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'Em Investigação': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'Aguardando Ação': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Fechado': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Cancelado': return <CheckCircle className="h-4 w-4 text-muted-foreground" />; // Updated icon
            default: return <Info className="h-4 w-4 text-muted-foreground" />;
        }
    };

     const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Aberto': return 'destructive';
            case 'Em Investigação': return 'secondary';
            case 'Aguardando Ação': return 'default';
            case 'Fechado': return 'outline';
            case 'Cancelado': return 'secondary'; // Updated variant for canceled
            default: return 'outline';
        }
     }

    const filteredIncidents = incidents.filter(incident =>
        incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (incident.location_name && incident.location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (incident.date && new Date(incident.date).toLocaleDateString('pt-BR').includes(searchTerm))
    );

  return (
    <div>
       <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <FileWarning className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Incidentes</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
        </div>
        <Button onClick={() => { setSelectedIncidentForEdit(null); setIncidentDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Reportar Incidente
        </Button>
      </div>

       <div className="mb-4">
           <Input
            placeholder="Buscar por tipo, local, data (dd/mm/aaaa) ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Incidentes</CardTitle>
          <CardDescription>Histórico de acidentes, quase acidentes e incidentes ambientais.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Gravidade</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Descrição Breve</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Carregando incidentes...</TableCell></TableRow>
              ) : filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.date ? new Date(incident.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}</TableCell>
                    <TableCell>{incident.type}</TableCell>
                    <TableCell>
                       <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                           {incident.severity || 'N/A'}
                       </Badge>
                    </TableCell>
                    <TableCell>{incident.location_name || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                     <TableCell>
                        <Badge variant={getStatusBadgeVariant(incident.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(incident.status)}
                         {incident.status || 'N/A'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDetailsDialog(incident)} title="Ver Detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(incident)} title="Editar Incidente">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmation(incident)} title="Excluir Incidente" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum incidente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <IncidentDialog
        open={isIncidentDialogOpen}
        onOpenChange={handleDialogClose}
        initialData={selectedIncidentForEdit}
        onIncidentAddedOrUpdated={fetchIncidents}
      />
      <IncidentDetailsDialog
        incident={selectedIncidentForDetails}
        open={isDetailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
      />
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir o incidente #{deletingIncident?.id} (&quot;{deletingIncident?.description.substring(0, 30)}...&quot;)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingIncident(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
