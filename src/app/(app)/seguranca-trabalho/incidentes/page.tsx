
"use client"; // Add "use client" directive

import React from 'react';
import { FileWarning, PlusCircle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For severity and status

// Import Dialog Component
import IncidentDialog from '@/components/incidentes/IncidentDialog';

export default function IncidentesPage() {
  // State and functions for dialogs
  const [isIncidentDialogOpen, setIncidentDialogOpen] = React.useState(false);

  // Placeholder data for incident list (Fetch from DB later)
  const incidents = [
    { id: 1, date: "2024-08-17 10:30:00", type: "Acidente sem Afastamento", severity: "Leve", location_name: "Fábrica - Setor A", status: "Fechado", description: "Corte superficial no dedo ao manusear peça.", reporter_name: "Técnico SST" },
    { id: 2, date: "2024-08-18 14:00:00", type: "Acidente com Afastamento", severity: "Moderado", location_name: "Fábrica - Setor A", status: "Em Investigação", description: "Entorse no tornozelo ao descer escada da máquina.", reporter_name: "Técnico SST" },
    { id: 3, date: "2024-08-19 09:15:00", type: "Quase Acidente", severity: "N/A", location_name: "Almoxarifado Central", status: "Fechado", description: "Caixa caiu de prateleira próxima ao funcionário Carlos.", reporter_name: "Admin EHS" },
    { id: 4, date: "2024-08-22 11:00:00", type: "Incidente Ambiental", severity: "Insignificante", location_name: "Pátio Externo", status: "Aberto", description: "Pequeno vazamento de óleo contido na área de descarte.", reporter_name: "Gerente Seg" },
    { id: 5, date: "2024-08-23 16:45:00", type: "Quase Acidente", severity: "N/A", location_name: "Produção B", status: "Aguardando Ação", description: "Piso escorregadio devido a vazamento de óleo na máquina Y.", reporter_name: "Alice Silva" },
    { id: 6, date: "2024-08-24 08:00:00", type: "Acidente sem Afastamento", severity: "Leve", location_name: "Escritório - RH", status: "Aberto", description: "Colisão com mobília, resultando em hematoma.", reporter_name: "Diana Souza" },
    { id: 7, date: "2024-07-10 15:20:00", type: "Acidente com Afastamento", severity: "Grave", location_name: "Manutenção", status: "Fechado", description: "Queda de escada durante reparo.", reporter_name: "Gerente Seg"},
  ];

    const getSeverityBadgeVariant = (severity: string | null | undefined) => {
        if (!severity) return 'outline';
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

     const getStatusIcon = (status: string | null | undefined) => {
         if (!status) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        switch (status) {
            case 'Aberto': return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'Em Investigação': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'Aguardando Ação': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'Fechado': return <CheckCircle className="h-4 w-4 text-green-600" />;
            default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

     const getStatusBadgeVariant = (status: string | null | undefined) => {
        if (!status) return 'outline';
        switch (status) {
            case 'Aberto': return 'destructive';
            case 'Em Investigação': return 'secondary'; // Yellow
            case 'Aguardando Ação': return 'default'; // Blue
            case 'Fechado': return 'outline'; // Gray/Greenish done
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
                           {incident.severity || 'N/A'}
                       </Badge>
                    </TableCell>
                    <TableCell>{incident.location_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                     <TableCell>
                        <Badge variant={getStatusBadgeVariant(incident.status)} className="flex items-center gap-1 w-fit">
                         {getStatusIcon(incident.status)}
                         {incident.status || 'N/A'}
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

      {/* Dialog for reporting/editing incidents */}
       <IncidentDialog open={isIncidentDialogOpen} onOpenChange={setIncidentDialogOpen} />

    </div>
  );
}
