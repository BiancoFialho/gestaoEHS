
import React from 'react';
import { HardHat } from 'lucide-react';

export default function EpisPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <HardHat className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">EPIs</h1>
          <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página EPIs aqui...</p>
        {/* TODO: Add EPI inventory, distribution tracking, expiration dates */}
      </div>
    </div>
  );
}
