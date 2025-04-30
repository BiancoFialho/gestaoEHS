
"use client"; // Add "use client" directive

import React from 'react';
import { HeartPulse, PlusCircle, CalendarCheck, AlertCircle } from 'lucide-react'; // Using parent icon and others
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For result status

// Placeholder Dialog Component (to be created)
// import AsoDialog from '@/components/asos/AsoDialog';

export default function AsosPage() {
   // Placeholder state and functions for dialogs
  const [isAsoDialogOpen, setAsoDialogOpen] = React.useState(false);

  // Placeholder data for ASO list
  const asos = [
    { id: 1, employee: "Alice Silva", type: "Periódico", exam_date: "2024-05-10", result: "Apto", next_due_date: "2025-05-10" },
    { id: 2, employee: "Bruno Costa", type: "Admissional", exam_date: "2024-01-15", result: "Apto", next_due_date: "2025-01-15" },
    { id: 3, employee: "Carlos Dias", type: "Mudança de Função", exam_date: "2024-07-01", result: "Apto com Restrições", restrictions: "Evitar levantar peso > 15kg", next_due_date: "2025-07-01" },
    { id: 4, employee: "Diana Souza", type: "Periódico", exam_date: "2023-11-20", result: "Apto", next_due_date: "2024-11-20" },
    { id: 5, employee: "Eduardo Lima", type: "Demissional", exam_date: "2024-08-05", result: "Apto", next_due_date: null },
     { id: 6, employee: "Fernanda Alves", type: "Periódico", exam_date: "2023-06-30", result: "Apto", next_due_date: "2024-06-30" }, // Example Expired
  ];

   const getResultBadgeVariant = (result: string) => {
    if (result.includes('Inapto')) return 'destructive';
    if (result.includes('Restrições')) return 'secondary';
    return 'default'; // Apto
  };

   const isExpired = (dateStr: string | null) => {
       if (!dateStr) return false;
       return new Date(dateStr) < new Date();
   }

  return (
    <div>
       <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">ASOs (Atestados de Saúde Ocupacional)</h1>
              <p className="text-sm text-muted-foreground">Saúde Ocupacional</p>
            </div>
        </div>
         <Button onClick={() => setAsoDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar ASO
         </Button>
      </div>

      {/* Search and Filters (Optional) */}
      <div className="mb-4">
        <Input placeholder="Buscar por funcionário, tipo ou data..." />
        {/* Add filter dropdowns for result, status (due/expired) */}
      </div>

       {/* ASO List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de ASO</CardTitle>
          <CardDescription>Atestados de Saúde Ocupacional emitidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Exame</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Próximo Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asos.length > 0 ? (
                asos.map((aso) => (
                  <TableRow key={aso.id} className={isExpired(aso.next_due_date) ? 'bg-destructive/10' : ''}>
                    <TableCell className="font-medium">{aso.employee}</TableCell>
                    <TableCell>{aso.type}</TableCell>
                    <TableCell>{aso.exam_date}</TableCell>
                    <TableCell>
                       <Badge variant={getResultBadgeVariant(aso.result)} className={aso.result === 'Apto' ? 'bg-green-600 hover:bg-green-700' : ''}>
                            {aso.result}
                       </Badge>
                       {aso.restrictions && <p className="text-xs text-muted-foreground mt-1">{aso.restrictions}</p>}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                        {aso.next_due_date || "N/A"}
                        {isExpired(aso.next_due_date) && <AlertCircle className="h-4 w-4 text-destructive" title="Vencido"/>}
                        {!isExpired(aso.next_due_date) && aso.next_due_date && <CalendarCheck className="h-4 w-4 text-green-600" title="Válido"/> }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Ver</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Add upload/view certificate button */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum ASO encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* TODO: Add pagination */}
        </CardContent>
      </Card>


      {/* Placeholder for Dialog */}
      {/* <AsoDialog open={isAsoDialogOpen} onOpenChange={setAsoDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar ASOs será implementado aqui.</p>
      </div>
    </div>
  );
}
