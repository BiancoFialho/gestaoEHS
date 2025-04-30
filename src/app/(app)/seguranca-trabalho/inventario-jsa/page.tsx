
"use client"; // Add "use client" directive

import React from 'react';
import { ClipboardList, PlusCircle, ListFilter } from 'lucide-react'; // Updated icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status

// Import Dialog Component (renamed)
import JsaDialog from '@/components/jsa/JsaDialog';

export default function InventarioJsaPage() {
  // State and functions for dialogs
  const [isJsaDialogOpen, setJsaDialogOpen] = React.useState(false);

  // Placeholder data for JSA list (Fetch from DB later, adjust fields)
  const jsaEntries = [
    { id: 1, task: "Manutenção de Telhado", location_name: "Fábrica - Telhado", status: "Revisado", responsible_person_name: "Gerente Seg", review_date: "2024-05-10" },
    { id: 2, task: "Operação da Prensa P-10", location_name: "Fábrica - Setor A", status: "Ativo", responsible_person_name: "Técnico SST", review_date: "2024-06-20" },
    { id: 3, task: "Manuseio de Ácido Sulfúrico", location_name: "Laboratório Químico", status: "Ativo", responsible_person_name: "Técnico SST", review_date: "2024-07-01" },
    { id: 4, task: "Trabalho em Escritório (Digitação)", location_name: "Escritório - RH", status: "Rascunho", responsible_person_name: "Admin EHS", review_date: null },
    { id: 5, task: "Operação de Empilhadeira", location_name: "Almoxarifado Central", status: "Ativo", responsible_person_name: "Gerente Seg", review_date: "2023-12-15" },
    { id: 6, task: "Manutenção Elétrica Painel X", location_name: "Fábrica - Setor A", status: "Revisado", responsible_person_name: "Técnico SST", review_date: "2024-08-01" },
  ];

   const getStatusBadgeVariant = (status: string | null | undefined) => {
       if (!status) return 'outline';
       if (status === 'Rascunho') return 'secondary';
       if (status === 'Ativo') return 'default'; // Greenish
       if (status === 'Revisado') return 'outline'; // Or default
       if (status === 'Obsoleto') return 'destructive';
       return 'outline';
   }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
         <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-foreground" /> {/* Updated icon */}
            <div>
              <h1 className="text-2xl font-semibold ">Inventário JSA</h1> {/* Updated Title */}
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
         </div>
         <Button onClick={() => setJsaDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar JSA
         </Button>
      </div>

        {/* Search and Filters (Optional) */}
       <div className="flex gap-2 mb-4">
           <Input placeholder="Buscar por tarefa, local ou responsável..." className="flex-grow" />
            <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
           {/* Add specific filter dropdowns: location, status */}
       </div>

      {/* JSA List Table */}
       <Card>
        <CardHeader>
          <CardTitle>Lista de Análises de Segurança da Tarefa (JSA)</CardTitle> {/* Updated Title */}
          <CardDescription>Inventário de JSAs elaboradas.</CardDescription> {/* Updated Description */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa Analisada</TableHead> {/* Updated Header */}
                <TableHead>Local</TableHead>
                <TableHead>Responsável</TableHead> {/* Added Header */}
                <TableHead>Última Revisão</TableHead> {/* Added Header */}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jsaEntries.length > 0 ? (
                jsaEntries.map((jsa) => (
                  <TableRow key={jsa.id}>
                    <TableCell className="font-medium max-w-xs truncate">{jsa.task}</TableCell> {/* Updated field */}
                    <TableCell>{jsa.location_name}</TableCell>
                    <TableCell>{jsa.responsible_person_name || 'N/A'}</TableCell> {/* Added field */}
                    <TableCell>{jsa.review_date || 'N/A'}</TableCell> {/* Added field */}
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(jsa.status)}>{jsa.status || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm">Visualizar</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                      {/* Add review/revise button */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground"> {/* Adjusted colspan */}
                    Nenhuma JSA encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           {/* TODO: Add pagination */}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing JSAs */}
       <JsaDialog open={isJsaDialogOpen} onOpenChange={setJsaDialogOpen} />

    </div>
  );
}
