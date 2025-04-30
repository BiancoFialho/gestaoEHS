
import React from 'react';
import { ClipboardCheck } from 'lucide-react';

export default function AuditoriasPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Auditorias</h1>
          <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Auditorias aqui...</p>
        {/* TODO: Add audit schedule, findings, reports */}
      </div>
    </div>
  );
}
