
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AnaliseRiscosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Análise de Riscos</h1>
          <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Análise de Riscos aqui...</p>
        {/* TODO: Add risk matrix, forms, tables etc. */}
      </div>
    </div>
  );
}
