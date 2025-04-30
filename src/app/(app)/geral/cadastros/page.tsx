
import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function CadastrosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Cadastros</h1>
          <p className="text-sm text-muted-foreground">Geral</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Cadastros aqui...</p>
        {/* TODO: Add forms and lists for various EHS entities (employees, locations, equipment etc.) */}
      </div>
    </div>
  );
}
