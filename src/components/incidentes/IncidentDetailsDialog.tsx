
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, FileText, MapPin, User, CalendarDays, AlertTriangleIcon, ShieldAlert, Info } from 'lucide-react';

interface Incident {
  id: number;
  date: string; // Assuming ISO string format from DB
  type: string;
  severity: string | null;
  location_name: string | null;
  status: string | null;
  description: string;
  reporter_name: string | null;
  // Optional fields from DB that might be present
  involved_persons_ids?: string | null;
  root_cause?: string | null;
  corrective_actions?: string | null;
  preventive_actions?: string | null;
  investigation_responsible_name?: string | null; // Assuming a join might provide this
  lost_days?: number | null;
  cost?: number | null;
  closure_date?: string | null;
}

interface IncidentDetailsDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getSeverityBadgeVariant = (severity: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    if (!severity) return 'outline';
    switch (severity) {
        case 'Fatalidade':
        case 'Grave': return 'destructive';
        case 'Moderado': return 'secondary';
        case 'Leve': return 'default'; // Use default for Leve for better visibility
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
        case 'Cancelado': return <ShieldAlert className="h-4 w-4 text-muted-foreground" />;
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
        case 'Cancelado': return 'secondary';
        default: return 'outline';
    }
 };


const IncidentDetailsDialog: React.FC<IncidentDetailsDialogProps> = ({ incident, open, onOpenChange }) => {
  if (!incident) {
    return null;
  }

  const formattedDate = incident.date ? new Date(incident.date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'N/A';

  const formattedClosureDate = incident.closure_date ? new Date(incident.closure_date).toLocaleDateString('pt-BR') : 'N/A';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Detalhes do Incidente #{incident.id}
          </DialogTitle>
          <DialogDescription>
            Visualização completa das informações do incidente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-4 py-4 pr-2">
            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
              <strong className="col-span-1 text-sm">ID:</strong>
              <p className="col-span-2 text-sm">{incident.id}</p>

              <strong className="col-span-1 text-sm flex items-center"><CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" /> Data:</strong>
              <p className="col-span-2 text-sm">{formattedDate}</p>

              <strong className="col-span-1 text-sm flex items-center"><FileText className="mr-1.5 h-4 w-4 text-muted-foreground" /> Tipo:</strong>
              <p className="col-span-2 text-sm">{incident.type}</p>

              <strong className="col-span-1 text-sm flex items-center"><AlertTriangleIcon className="mr-1.5 h-4 w-4 text-muted-foreground" /> Gravidade:</strong>
              <div className="col-span-2 text-sm">
                <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                  {incident.severity || 'N/A'}
                </Badge>
              </div>

              <strong className="col-span-1 text-sm flex items-center"><MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" /> Local:</strong>
              <p className="col-span-2 text-sm">{incident.location_name || 'N/A'}</p>

              <strong className="col-span-1 text-sm flex items-center"><User className="mr-1.5 h-4 w-4 text-muted-foreground" /> Reportado por:</strong>
              <p className="col-span-2 text-sm">{incident.reporter_name || 'N/A'}</p>

              <strong className="col-span-1 text-sm flex items-center">{getStatusIcon(incident.status)} Status:</strong>
              <div className="col-span-2 text-sm">
                <Badge variant={getStatusBadgeVariant(incident.status)}>
                  {incident.status || 'N/A'}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <strong className="text-sm">Descrição:</strong>
              <p className="text-sm p-2 border rounded-md bg-muted min-h-[60px]">{incident.description}</p>
            </div>
            
            {/* Optional Fields - Render if they exist */}
            {incident.root_cause && (
              <div className="space-y-1">
                <strong className="text-sm">Causa Raiz:</strong>
                <p className="text-sm p-2 border rounded-md bg-muted">{incident.root_cause}</p>
              </div>
            )}
            {incident.corrective_actions && (
              <div className="space-y-1">
                <strong className="text-sm">Ações Corretivas:</strong>
                <p className="text-sm p-2 border rounded-md bg-muted">{incident.corrective_actions}</p>
              </div>
            )}
             {incident.preventive_actions && (
              <div className="space-y-1">
                <strong className="text-sm">Ações Preventivas:</strong>
                <p className="text-sm p-2 border rounded-md bg-muted">{incident.preventive_actions}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {incident.investigation_responsible_name && (
                    <>
                        <strong className="col-span-1 text-sm">Responsável Investigação:</strong>
                        <p className="col-span-2 text-sm">{incident.investigation_responsible_name}</p>
                    </>
                )}
                 {(incident.lost_days !== null && incident.lost_days !== undefined) && (
                    <>
                        <strong className="col-span-1 text-sm">Dias Perdidos:</strong>
                        <p className="col-span-2 text-sm">{incident.lost_days}</p>
                    </>
                )}
                {(incident.cost !== null && incident.cost !== undefined) && (
                     <>
                        <strong className="col-span-1 text-sm">Custo Estimado:</strong>
                        <p className="col-span-2 text-sm">{incident.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </>
                )}
                {incident.closure_date && (
                    <>
                        <strong className="col-span-1 text-sm">Data Fechamento:</strong>
                        <p className="col-span-2 text-sm">{formattedClosureDate}</p>
                    </>
                )}
                 {incident.involved_persons_ids && ( // This likely needs better display, e.g. fetching names
                    <>
                        <strong className="col-span-1 text-sm">Pessoas Envolvidas (IDs):</strong>
                        <p className="col-span-2 text-sm">{incident.involved_persons_ids}</p>
                    </>
                )}
            </div>

          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailsDialog;
