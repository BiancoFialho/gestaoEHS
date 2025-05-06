
"use client";

import React from 'react';
import { ClipboardList, PlusCircle, ListFilter, Edit, Paperclip, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

import JsaDialog from '@/components/jsa/JsaDialog';
import { getAllJsas } from '@/lib/db'; // Assuming this function is correctly implemented to fetch data

interface JsaEntry {
    id: number;
    task: string;
    location_name: string | null;
    responsible_person_name: string | null;
    review_date: string | null;
    status: string | null;
    attachment_path: string | null;
}

export default function InventarioJsaPage() {
  const [isJsaDialogOpen, setJsaDialogOpen] = React.useState(false);
  const [jsaEntries, setJsaEntries] = React.useState<JsaEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState(""); // For search functionality

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getAllJsas(); // Fetch data from DB
        setJsaEntries(data as JsaEntry[]);
      } catch (error) {
        console.error("Failed to fetch JSA entries:", error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [isJsaDialogOpen]); // Reload data when dialog closes (after potential add/edit)

   const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
       if (!status) return 'outline';
       if (status === 'Rascunho') return 'secondary';
       if (status === 'Ativo') return 'default';
       if (status === 'Revisado') return 'outline';
       if (status === 'Obsoleto') return 'destructive';
       return 'outline';
   }

  const handleViewSteps = (id: number) => console.log(`View Steps for JSA ${id}`);
  const handleEdit = (id: number) => {
      console.log(`Edit JSA ${id}`);
      // TODO: Implement opening dialog with JSA data for editing
      // const jsaToEdit = jsaEntries.find(jsa => jsa.id === id);
      // if (jsaToEdit) {
      // setJsaDialogOpen(true); // Need to pass data to dialog
      // }
  };
  const handleDownload = (filePath: string | null) => {
      if (!filePath) {
          console.warn("No file path provided for download.");
          return;
      }
      console.log(`Download file: ${filePath}`);
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const filteredJsas = jsaEntries.filter(jsa =>
    jsa.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (jsa.location_name && jsa.location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (jsa.responsible_person_name && jsa.responsible_person_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );


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
           <Input
            placeholder="Buscar por tarefa, local ou responsável..."
            className="flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
            <Button variant="outline" disabled> {/* Filter button disabled for now */}
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
              <TableRow><TableHead className="w-[30%]">Tarefa Analisada</TableHead><TableHead>Local</TableHead><TableHead>Responsável</TableHead><TableHead>Última Revisão</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Anexo</TableHead><TableHead className="text-right">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Carregando JSAs...</TableCell></TableRow>
              ) : filteredJsas.length > 0 ? (
                filteredJsas.map((jsa) => (
                  <TableRow key={jsa.id}><TableCell className="font-medium">{jsa.task}</TableCell><TableCell>{jsa.location_name || 'N/A'}</TableCell><TableCell>{jsa.responsible_person_name || 'N/A'}</TableCell><TableCell>{jsa.review_date || 'N/A'}</TableCell><TableCell><Badge variant={getStatusBadgeVariant(jsa.status)}>{jsa.status || 'N/A'}</Badge></TableCell><TableCell className="text-center">{jsa.attachment_path ? (<Button variant="ghost" size="icon" onClick={() => handleDownload(jsa.attachment_path)} title="Baixar Anexo"><Download className="h-4 w-4 text-blue-600" /></Button>) : (<Paperclip className="h-4 w-4 text-muted-foreground mx-auto" title="Sem Anexo" />)}</TableCell><TableCell className="text-right space-x-1"><Button variant="ghost" size="sm" onClick={() => handleViewSteps(jsa.id)} title="Visualizar Passos" disabled>Ver Passos</Button><Button variant="ghost" size="icon" onClick={() => handleEdit(jsa.id)} title="Editar JSA" disabled><Edit className="h-4 w-4" /></Button></TableCell></TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma JSA encontrada.</TableCell></TableRow>
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
