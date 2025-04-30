
import React from 'react';
import { Folder } from 'lucide-react';

export default function DocumentosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Folder className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Documentos</h1>
          <p className="text-sm text-muted-foreground">Geral</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Documentos aqui...</p>
        {/* TODO: Add document management system (upload, versioning, access control) */}
      </div>
    </div>
  );
}
