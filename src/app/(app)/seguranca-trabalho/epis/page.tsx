
import React from 'react';
import { HardHat, List, CheckSquare, PlusCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // To switch between Types and Records
import { Badge } from '@/components/ui/badge';

// Placeholder Dialog Components (to be created)
// import PpeTypeDialog from '@/components/epis/PpeTypeDialog';
// import PpeRecordDialog from '@/components/epis/PpeRecordDialog';

export default function EpisPage() {
   // Placeholder state and functions for dialogs
  const [isTypeDialogOpen, setTypeDialogOpen] = React.useState(false);
  const [isRecordDialogOpen, setRecordDialogOpen] = React.useState(false);

  // Placeholder data
  const ppeTypes = [
    { id: 1, name: "Capacete de Segurança Classe B", specification: "Com jugular", lifespan_months: 24 },
    { id: 2, name: "Luva Nitrílica Descartável", specification: "Tam M/G", lifespan_months: 0 }, // Uso único
    { id: 3, name: "Óculos de Segurança Ampla Visão", specification: "Anti-embaçante", lifespan_months: 12 },
    { id: 4, name: "Protetor Auricular Plug Silicone", specification: "Com cordão", lifespan_months: 6 },
    { id: 5, name: "Botina de Segurança Couro", specification: "Bico de aço, CA 12345", lifespan_months: 12 },
  ];

  const ppeRecords = [
    { id: 101, employee: "Alice Silva", ppe_type: "Capacete de Segurança Classe B", delivery_date: "2024-01-15", quantity: 1, ca_number: "98765", due_date: "2026-01-15" },
    { id: 102, employee: "Bruno Costa", ppe_type: "Luva Nitrílica Descartável", delivery_date: "2024-08-01", quantity: 100, ca_number: "N/A", due_date: null },
    { id: 103, employee: "Alice Silva", ppe_type: "Óculos de Segurança Ampla Visão", delivery_date: "2024-03-20", quantity: 1, ca_number: "54321", due_date: "2025-03-20" },
    { id: 104, employee: "Carlos Dias", ppe_type: "Botina de Segurança Couro", delivery_date: "2023-07-10", quantity: 1, ca_number: "12345", due_date: "2024-07-10" }, // Exemplo Vencido
    { id: 105, employee: "Bruno Costa", ppe_type: "Protetor Auricular Plug Silicone", delivery_date: "2024-05-01", quantity: 1, ca_number: "67890", due_date: "2024-11-01" },
  ];

   const isExpired = (dateStr: string | null) => {
       if (!dateStr) return false;
       return new Date(dateStr) < new Date();
   }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <HardHat className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">EPIs</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
        </div>
        <div className="flex gap-2">
             <Button onClick={() => setTypeDialogOpen(true)} variant="outline">
                <List className="mr-2 h-4 w-4" /> Gerenciar Tipos de EPI
            </Button>
             <Button onClick={() => setRecordDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Entrega
             </Button>
        </div>
      </div>

      <Tabs defaultValue="registros" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="registros"><CheckSquare className="mr-2 h-4 w-4" /> Registros de Entrega</TabsTrigger>
          <TabsTrigger value="tipos"><List className="mr-2 h-4 w-4" /> Tipos de EPI</TabsTrigger>
        </TabsList>

         {/* Tab de Registros de Entrega */}
        <TabsContent value="registros">
           <Card>
            <CardHeader>
              <CardTitle>Registros de Entrega</CardTitle>
              <CardDescription>Controle de EPIs entregues aos funcionários e seus vencimentos.</CardDescription>
               <Input placeholder="Buscar por funcionário, EPI ou CA..." className="mt-2" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Tipo de EPI</TableHead>
                    <TableHead>Data Entrega</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Vencimento Troca</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ppeRecords.length > 0 ? (
                    ppeRecords.map((record) => (
                      <TableRow key={record.id} className={isExpired(record.due_date) ? 'bg-destructive/10' : ''}>
                        <TableCell className="font-medium">{record.employee}</TableCell>
                        <TableCell>{record.ppe_type}</TableCell>
                        <TableCell>{record.delivery_date}</TableCell>
                        <TableCell>{record.ca_number}</TableCell>
                        <TableCell className="flex items-center gap-1">
                           {record.due_date || "N/A"}
                           {isExpired(record.due_date) && <AlertCircle className="h-4 w-4 text-destructive" title="Troca Vencida"/>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                           {/* Add view receipt button */}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum registro de entrega encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

         {/* Tab de Tipos de EPI */}
        <TabsContent value="tipos">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de EPI</CardTitle>
              <CardDescription>Catálogo de Equipamentos de Proteção Individual disponíveis.</CardDescription>
               <Input placeholder="Buscar por nome do EPI..." className="mt-2" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do EPI</TableHead>
                    <TableHead>Especificação</TableHead>
                    <TableHead>Vida Útil (Meses)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ppeTypes.length > 0 ? (
                    ppeTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.specification}</TableCell>
                        <TableCell>{type.lifespan_months > 0 ? type.lifespan_months : "Uso Único"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                          {/* Add delete button */}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum tipo de EPI encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>


      {/* Placeholder for Dialogs */}
      {/* <PpeTypeDialog open={isTypeDialogOpen} onOpenChange={setTypeDialogOpen} /> */}
      {/* <PpeRecordDialog open={isRecordDialogOpen} onOpenChange={setRecordDialogOpen} /> */}
       <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialogs para gerenciar tipos e registros de EPIs serão implementados aqui.</p>
       </div>
    </div>
  );
}