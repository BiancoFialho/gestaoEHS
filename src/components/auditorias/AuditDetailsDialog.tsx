
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
import { ClipboardCheck, CheckCircle, Clock, XCircle, User, CalendarDays, Star, FileText, FileSearch, ShieldAlert, Info } from 'lucide-react';

interface Audit {
  id: number;
  type: string;
  scope: string;
  audit_date: string; // YYYY-MM-DD
  auditor: string;
  lead_auditor_name?: string | null;
  status: string | null;
  non_conformities_count?: number;
  score?: number | null;
}

interface AuditDetailsDialogProps {
  audit: Audit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusIcon = (status: string | null) => {
    if (!status) return <Info className="h-4 w-4 text-muted-foreground" />;
    switch (status) {
        case 'Planejada': return <Clock className="h-4 w-4 text-blue-500" />;
        case 'Em Andamento': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Concluída': return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'Cancelada': return <XCircle className="h-4 w-4 text-muted-foreground" />;
        case 'Atrasada': return <ShieldAlert className="h-4 w-4 text-destructive" />;
        default: return <Info className="h-4 w-4 text-muted-foreground" />;
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

const AuditDetailsDialog: React.FC<AuditDetailsDialogProps> = ({ audit, open, onOpenChange }) => {
  if (!audit) {
    return null;
  }

  const formattedDate = audit.audit_date ? new Date(audit.audit_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ClipboardCheck className="mr-2 h-5 w-5" /> Detalhes da Auditoria #{audit.id}
          </DialogTitle>
          <DialogDescription>
            Visualização completa das informações da auditoria.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-4 py-4 pr-2">
            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
              <strong className="col-span-1 text-sm">ID:</strong>
              <p className="col-span-2 text-sm">{audit.id}</p>

              <strong className="col-span-1 text-sm flex items-center"><FileSearch className="mr-1.5 h-4 w-4 text-muted-foreground" /> Tipo:</strong>
              <p className="col-span-2 text-sm">{audit.type}</p>

              <strong className="col-span-1 text-sm flex items-center"><CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" /> Data:</strong>
              <p className="col-span-2 text-sm">{formattedDate}</p>

              <strong className="col-span-1 text-sm flex items-center">{getStatusIcon(audit.status)} Status:</strong>
              <div className="col-span-2 text-sm">
                <Badge variant={getStatusBadgeVariant(audit.status)}>
                  {audit.status || 'N/A'}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <strong className="text-sm">Escopo:</strong>
              <p className="text-sm p-2 border rounded-md bg-muted min-h-[60px] whitespace-pre-wrap">{audit.scope}</p>
            </div>
            
            <h4 className="text-md font-semibold mt-3 border-t pt-3">Equipe de Auditoria</h4>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
              <strong className="col-span-1 text-sm flex items-center"><User className="mr-1.5 h-4 w-4 text-muted-foreground" /> Auditor(es):</strong>
              <p className="col-span-2 text-sm">{audit.auditor}</p>

              <strong className="col-span-1 text-sm flex items-center"><User className="mr-1.5 h-4 w-4 text-muted-foreground" /> Auditor Líder:</strong>
              <p className="col-span-2 text-sm">{audit.lead_auditor_name || 'N/A'}</p>
            </div>

            <h4 className="text-md font-semibold mt-3 border-t pt-3">Resultados</h4>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <strong className="col-span-1 text-sm flex items-center"><FileText className="mr-1.5 h-4 w-4 text-muted-foreground" /> Não Conformidades:</strong>
                <div className="col-span-2 text-sm">
                  <Badge variant={audit.non_conformities_count && audit.non_conformities_count > 0 ? 'destructive' : 'default'} className={audit.non_conformities_count === 0 ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {audit.non_conformities_count ?? 0}
                  </Badge>
                </div>

                <strong className="col-span-1 text-sm flex items-center"><Star className="mr-1.5 h-4 w-4 text-muted-foreground" /> Nota / Score:</strong>
                 <div className="col-span-2 text-sm">
                    {audit.score !== null && audit.score !== undefined ? (
                        <div className="flex items-center gap-1 font-semibold">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                            {audit.score}
                        </div>
                    ) : 'N/A'}
                 </div>
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

export default AuditDetailsDialog;
