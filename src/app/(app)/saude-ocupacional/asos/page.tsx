
import React from 'react';
import { HeartPulse } from 'lucide-react'; // Using parent icon

export default function AsosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <HeartPulse className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">ASOs (Atestados de Saúde Ocupacional)</h1>
          <p className="text-sm text-muted-foreground">Saúde Ocupacional</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página ASOs aqui...</p>
        {/* TODO: Add ASO listing, management, expiration tracking */}
      </div>
    </div>
  );
}
