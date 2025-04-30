
import React from 'react';
import { Users } from 'lucide-react';

export default function UsuariosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Usuários</h1>
          <p className="text-sm text-muted-foreground">Geral</p>
        </div>
      </div>
      {/* Placeholder Content */}
      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p>Conteúdo da página Usuários aqui...</p>
        {/* TODO: Add user management (roles, permissions) */}
      </div>
    </div>
  );
}
