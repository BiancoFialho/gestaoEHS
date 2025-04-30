
import React from 'react';
import { FileWarning, PlusCircle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For severity and status

// Placeholder Dialog Component (to be created)
// import IncidentDialog from '@/components/incidentes/IncidentDialog';

export default function IncidentesPage() {
  // Placeholder state and functions for dialogs
  const [isIncidentDialogOpen, setIncidentDialogOpen] = React.useState(false);

  // Placeholder data for incident list
  const incidents = [
    { id: 1, date: "2024-08-17", type: "Acidente sem Afastamento", severity: "Leve", location: "Produção A", status: "Fechado", description: "Corte superficial no dedo." },
    { id: 2, date: "2024-08-18", type: "Acidente com Afastamento", severity: "Moderado", location: "Manutenção", status: "Em Investigação", description: "Entorse no tornozelo ao descer escada." },
    { id: 3, date: "2024-08-18", type: "Quase Acidente", severity: "N/A", location: "Armazém", status: "Fechado", description: "Caixa caiu de prateleira próxima ao funcionário." },
    { id: 4, date: "2024-08-19", type: "Quase Acidente", severity: "N/A", location: "Produção B", status: "Aguardando Ação", description: "Piso escorregadio devido a vazamento." },
    { id: 5, date: "2024-08-22", type: "Incidente Ambiental", severity: "Insignificante", location: "Pátio Externo", status: "Aberto", description: "Pequeno vazamento de óleo contido." },
     { id: 6, date: "2024-08-23", type: "Acidente sem Afastamento", severity: "Leve", location: "Escritório", status: "Aberto", description: "Colisão com mobília." },
  ];

    const getSeverityBadgeVariant = (severity: string) => {
        switch (severity) {
            case 'Fatalidade':
            case 'Grave': return 'destructive';
            case 'Moderado': return 'secondary'; // Yellowish
            case 'Leve': return 'outline'; // Default or blueish
            case 'Insignificante':
            case 'N/A': return 'outline';
            default: return 'outline';
        }
    };

     const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Aberto': return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'Em Investigação': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'Aguardando Ação': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Fechado': return <CheckCircle className="h-4 w-4 text-green-600" />;
            default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

     const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Aberto': return 'destructive';
            case 'Em Investigação': return 'secondary'; // Yellow
            case 'Aguardando Ação': return 'default'; // Blue
            case 'Fechado': return 'outline'; // Gray/Greenish
            default: return 'outline';
        }
     }

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
        <Button onClick={() => setIncidentDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Reportar Incidente
        </Button>
      </div>

       {/* Search and Filters (Optional) */}
       <div className="mb-4">
           <Input placeholder="Buscar por tipo, local, data ou descrição..." />
           {/* Add filter dropdowns for status, severity, type, date range */}
       </div>


      {/* Incident List Table */}
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
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.date}</TableCell>
                    <TableCell>{incident.type}</TableCell>
                    <TableCell>
                       <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                           {incident.severity}
                       </Badge>
                    </TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                     <TableCell>
                        <Badge variant={getStatusBadgeVariant(incident.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(incident.status)}
                         {incident.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Detalhes</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Link to investigation/action plan */}
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
          {/* TODO: Add pagination */}
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <IncidentDialog open={isIncidentDialogOpen} onOpenChange={setIncidentDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para reportar/editar incidentes será implementado aqui.</p>
      </div>
    </div>
  );
}