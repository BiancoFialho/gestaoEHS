"use client";

import React from 'react';
import { ClipboardList, PlusCircle, ListFilter, Edit, Paperclip, Download } from 'lucide-react'; // Added Download
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status

// Import Dialog Component (renamed)
import JsaDialog from '@/components/jsa/JsaDialog';

// Placeholder function to fetch data (replace with actual DB fetch)
async function fetchJsaEntries() {
    // Simulate DB fetch
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 1, task: "Manutenção de Telhado", location_name: "Fábrica - Telhado", status: "Revisado", responsible_person_name: "Gerente Seg", review_date: "2024-05-10", attachment_path: "/uploads/jsa_telhado_v1.xlsx" },
        { id: 2, task: "Operação da Prensa P-10", location_name: "Fábrica - Setor A", status: "Ativo", responsible_person_name: "Técnico SST", review_date: "2024-06-20", attachment_path: null },
        { id: 3, task: "Manuseio de Ácido Sulfúrico", location_name: "Laboratório Químico", status: "Ativo", responsible_person_name: "Técnico SST", review_date: "2024-07-01", attachment_path: null },
        { id: 4, task: "Trabalho em Escritório (Digitação)", location_name: "Escritório - RH", status: "Rascunho", responsible_person_name: "Admin EHS", review_date: null, attachment_path: null },
        { id: 5, task: "Operação de Empilhadeira", location_name: "Almoxarifado Central", status: "Ativo", responsible_person_name: "Gerente Seg", review_date: "2023-12-15", attachment_path: null },
        { id: 6, task: "Manutenção Elétrica Painel X", location_name: "Fábrica - Setor A", status: "Revisado", responsible_person_name: "Técnico SST", review_date: "2024-08-01", attachment_path: "/uploads/jsa_painel_eletrico.pdf" },
    ];
}

export default function InventarioJsaPage() {
  // State and functions for dialogs
  const [isJsaDialogOpen, setJsaDialogOpen] = React.useState(false);
  const [jsaEntries, setJsaEntries] = React.useState<any[]>([]); // State to hold fetched data
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch data on component mount
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchJsaEntries();
        setJsaEntries(data);
      } catch (error) {
        console.error("Failed to fetch JSA entries:", error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []); // Empty dependency array ensures this runs only once on mount

   const getStatusBadgeVariant = (status: string | null | undefined) => {
       if (!status) return 'outline';
       if (status === 'Rascunho') return 'secondary';
       if (status === 'Ativo') return 'default'; // Greenish
       if (status === 'Revisado') return 'outline'; // Or default
       if (status === 'Obsoleto') return 'destructive';
       return 'outline';
   }

  // Placeholder functions for actions
  const handleViewSteps = (id: number) => console.log(`View Steps for JSA ${id}`); // Placeholder
  const handleEdit = (id: number) => console.log(`Edit JSA ${id}`); // Placeholder - TODO: Implement edit dialog
  const handleDownload = (filePath: string) => {
      console.log(`Download file: ${filePath}`);
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = filePath; // Use the public path stored in DB
      link.download = filePath.split('/').pop() || 'download'; // Extract filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
         <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Inventário JSA</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
         </div>
         <Button onClick={() => setJsaDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar JSA
         </Button>
      </div>

       <div className="flex gap-2 mb-4">
           <Input placeholder="Buscar por tarefa, local ou responsável..." className="flex-grow" />
            <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
       </div>

       <Card>
        <CardHeader>
          <CardTitle>Lista de Análises de Segurança da Tarefa (JSA)</CardTitle>
          <CardDescription>Inventário de JSAs elaboradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Tarefa Analisada</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Última Revisão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Anexo</TableHead> {/* Added Header */}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                     <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                         Carregando JSAs...
                     </TableCell>
                 </TableRow>
              ) : jsaEntries.length > 0 ? (
                jsaEntries.map((jsa) => (
                  <TableRow key={jsa.id}>
                    <TableCell className="font-medium">{jsa.task}</TableCell>
                    <TableCell>{jsa.location_name || 'N/A'}</TableCell>
                    <TableCell>{jsa.responsible_person_name || 'N/A'}</TableCell>
                    <TableCell>{jsa.review_date || 'N/A'}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(jsa.status)}>{jsa.status || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        {jsa.attachment_path ? (
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(jsa.attachment_path)} title="Baixar Anexo">
                                <Download className="h-4 w-4 text-blue-600" />
                            </Button>
                        ) : (
                             <Paperclip className="h-4 w-4 text-muted-foreground mx-auto" title="Sem Anexo" />
                        )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="sm" onClick={() => handleViewSteps(jsa.id)} title="Visualizar Passos">
                           Ver Passos
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(jsa.id)} title="Editar JSA" disabled> {/* Disable edit for now */}
                            <Edit className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground"> {/* Adjusted colspan */}
                    Nenhuma JSA encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <JsaDialog open={isJsaDialogOpen} onOpenChange={setJsaDialogOpen} />

       {/* Placeholder for displaying JSA Steps */}
        <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
            <p className="text-muted-foreground">A visualização e edição detalhada dos passos da JSA será implementada aqui.</p>
        </div>

    </div>
  );
}
