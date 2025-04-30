
"use client"; // Add "use client" directive

import React from 'react';
import { Users, UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // To show roles/status

// Placeholder Dialog Component (to be created)
// import UserDialog from '@/components/usuarios/UserDialog';

export default function UsuariosPage() {
  // Placeholder state and functions for dialogs
  const [isUserDialogOpen, setUserDialogOpen] = React.useState(false);

  // Placeholder data for user list
  const users = [
    { id: 1, name: "Admin EHS", email: "admin@ehscontrol.com", role: "admin", is_active: true },
    { id: 2, name: "Gerente Seg", email: "gerente.seg@company.com", role: "manager", is_active: true },
    { id: 3, name: "Técnico SST", email: "tecnico.sst@company.com", role: "user", is_active: true },
    { id: 4, name: "Analista Amb", email: "analista.amb@company.com", role: "user", is_active: true },
    { id: 5, name: "Usuário Inativo", email: "inativo@company.com", role: "user", is_active: false },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div>
       <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Usuários</h1>
              <p className="text-sm text-muted-foreground">Geral</p>
            </div>
        </div>
         <Button onClick={() => setUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
         </Button>
      </div>

       {/* Search Input */}
       <div className="mb-4">
           <Input placeholder="Buscar por nome ou e-mail..." />
       </div>

      {/* User List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Gerenciamento de usuários, roles e permissões.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Role (Permissão)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                       <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'} className={user.is_active ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {user.is_active ? <ShieldCheck className="mr-1 h-3 w-3"/> : <ShieldAlert className="mr-1 h-3 w-3"/>}
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Add activate/deactivate/reset password buttons */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <UserDialog open={isUserDialogOpen} onOpenChange={setUserDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar usuários será implementado aqui.</p>
      </div>
    </div>
  );
}
