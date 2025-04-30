
import React from 'react';
import { ListChecks } from 'lucide-react'; // Re-using ListChecks icon

export default function PlanoAcaoPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ListChecks className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Plano de Ação</h1>
          <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Plano de Ação aqui...</p>
        {/* TODO: Add action plan items, assignments, tracking */}
      </div>
    </div>
  );
}
