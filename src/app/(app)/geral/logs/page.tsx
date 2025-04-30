
import React from 'react';
import { FileText as FileTextIcon } from 'lucide-react';

export default function LogsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FileTextIcon className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Logs de Atividades</h1>
          <p className="text-sm text-muted-foreground">Geral</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Logs de Atividades aqui...</p>
        {/* TODO: Add activity log viewer/browser */}
      </div>
    </div>
  );
}
