
"use client"; // Add "use client" directive

import React from 'react';
import { ClipboardList, UserPlus, MapPin, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Placeholder Dialog Components (to be created)
// import EmployeeDialog from '@/components/cadastros/EmployeeDialog';
// import LocationDialog from '@/components/cadastros/LocationDialog';
// import EquipmentDialog from '@/components/cadastros/EquipmentDialog';

export default function CadastrosPage() {
  // Placeholder state and functions for dialogs (replace with actual implementation)
  const [isEmployeeDialogOpen, setEmployeeDialogOpen] = React.useState(false);
  const [isLocationDialogOpen, setLocationDialogOpen] = React.useState(false);
  const [isEquipmentDialogOpen, setEquipmentDialogOpen] = React.useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-6 w-6 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold ">Cadastros</h1>
          <p className="text-sm text-muted-foreground">Geral</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card para Funcionários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Funcionários
            </CardTitle>
            <CardDescription>Gerencie os dados dos colaboradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setEmployeeDialogOpen(true)} className="w-full">
              Gerenciar Funcionários
            </Button>
             {/* TODO: Add list preview or count */}
             <p className="text-xs text-muted-foreground mt-2 text-center">Ex: Listar ou contar funcionários.</p>
          </CardContent>
        </Card>

        {/* Card para Locais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Locais
            </CardTitle>
            <CardDescription>Gerencie os locais e áreas da empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocationDialogOpen(true)} className="w-full">
              Gerenciar Locais
            </Button>
             {/* TODO: Add list preview or count */}
             <p className="text-xs text-muted-foreground mt-2 text-center">Ex: Listar ou contar locais.</p>
          </CardContent>
        </Card>

        {/* Card para Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Equipamentos
            </CardTitle>
            <CardDescription>Gerencie os equipamentos e suas manutenções.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setEquipmentDialogOpen(true)} className="w-full">
              Gerenciar Equipamentos
            </Button>
             {/* TODO: Add list preview or count */}
             <p className="text-xs text-muted-foreground mt-2 text-center">Ex: Listar ou contar equipamentos.</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Dialogs */}
      {/* <EmployeeDialog open={isEmployeeDialogOpen} onOpenChange={setEmployeeDialogOpen} /> */}
      {/* <LocationDialog open={isLocationDialogOpen} onOpenChange={setLocationDialogOpen} /> */}
      {/* <EquipmentDialog open={isEquipmentDialogOpen} onOpenChange={setEquipmentDialogOpen} /> */}
       <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialogs para gerenciamento (Funcionários, Locais, Equipamentos) serão implementados aqui.</p>
       </div>
    </div>
  );
}
