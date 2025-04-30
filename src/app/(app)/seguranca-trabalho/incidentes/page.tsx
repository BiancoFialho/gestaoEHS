
import React from 'react';
import { FileWarning } from 'lucide-react';

export default function IncidentesPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FileWarning className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Incidentes</h1>
          <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Incidentes aqui...</p>
        {/* TODO: Add incident listing, forms, reporting features */}
      </div>
    </div>
  );
}
