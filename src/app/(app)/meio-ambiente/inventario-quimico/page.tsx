
"use client"; // Add "use client" directive

import React from 'react';
import { FlaskConical, PlusCircle, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For hazard class

// Placeholder Dialog Component (to be created)
// import ChemicalDialog from '@/components/inventario/ChemicalDialog';

export default function InventarioQuimicoPage() {
  // Placeholder state and functions for dialogs
  const [isChemicalDialogOpen, setChemicalDialogOpen] = React.useState(false);

  // Placeholder data for chemical inventory
  const chemicals = [
    { id: 1, name: "Ácido Sulfúrico 98%", cas: "7664-93-9", location: "Laboratório", quantity: 10, unit: "L", hazard: "Corrosivo", sds: true },
    { id: 2, name: "Hidróxido de Sódio", cas: "1310-73-2", location: "Almoxarifado", quantity: 25, unit: "kg", hazard: "Corrosivo", sds: true },
    { id: 3, name: "Etanol Absoluto", cas: "64-17-5", location: "Produção A", quantity: 200, unit: "L", hazard: "Inflamável", sds: true },
    { id: 4, name: "Tolueno", cas: "108-88-3", location: "Produção B", quantity: 50, unit: "L", hazard: "Inflamável, Tóxico", sds: false }, // Example without SDS linked
    { id: 5, name: "Óleo Lubrificante XYZ", cas: "N/A", location: "Manutenção", quantity: 15, unit: "gal", hazard: "N/A", sds: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
         <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Inventário Químico</h1>
              <p className="text-sm text-muted-foreground">Meio Ambiente</p>
            </div>
         </div>
         <Button onClick={() => setChemicalDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
         </Button>
      </div>

       {/* Search and Filters (Optional) */}
       <div className="mb-4">
           <Input placeholder="Buscar por nome, CAS ou local..." />
           {/* Add filter dropdowns for location, hazard, etc. */}
       </div>


      {/* Chemical Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Químicos</CardTitle>
          <CardDescription>Lista de produtos químicos armazenados e suas informações.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>CAS</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Perigo (GHS)</TableHead>
                <TableHead>FISPQ</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chemicals.length > 0 ? (
                chemicals.map((chem) => (
                  <TableRow key={chem.id}>
                    <TableCell className="font-medium">{chem.name}</TableCell>
                    <TableCell>{chem.cas}</TableCell>
                    <TableCell>{chem.location}</TableCell>
                    <TableCell>{chem.quantity} {chem.unit}</TableCell>
                    <TableCell>
                       <Badge variant={chem.hazard.includes('Inflamável') ? 'destructive' : chem.hazard.includes('Corrosivo') ? 'secondary' : 'outline'}>
                           {chem.hazard}
                       </Badge>
                    </TableCell>
                    <TableCell>
                        {chem.sds ? (
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                <FileText className="mr-1 h-4 w-4" /> Ver
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground">Pendente</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Add delete button */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum produto químico encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <ChemicalDialog open={isChemicalDialogOpen} onOpenChange={setChemicalDialogOpen} /> */}
       <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar produtos químicos será implementado aqui.</p>
       </div>
    </div>
  );
}
