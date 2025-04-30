
import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function TreinamentosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Treinamentos</h1>
          <p className="text-sm text-muted-foreground">Geral</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Treinamentos aqui...</p>
        {/* TODO: Add training records, scheduling, compliance tracking */}
      </div>
    </div>
  );
}
