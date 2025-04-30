
"use client"; // Add "use client" directive

import React from 'react';
import { Folder, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // For potential search
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // For listing documents

// Placeholder Dialog Component (to be created)
// import DocumentDialog from '@/components/documentos/DocumentDialog';

export default function DocumentosPage() {
  // Placeholder state and functions for dialogs (replace with actual implementation)
  const [isDocumentDialogOpen, setDocumentDialogOpen] = React.useState(false);

  // Placeholder data for document list
  const documents = [
    { id: 1, title: "Política de Segurança", category: "Política", version: "1.2", upload_date: "2024-07-15", status: "Ativo" },
    { id: 2, title: "FDS - Produto X", category: "FDS", version: "3.0", upload_date: "2024-06-01", status: "Ativo" }, // Changed FISPQ to FDS
    { id: 3, title: "Plano de Emergência", category: "Procedimento", version: "2.1", upload_date: "2023-11-20", status: "Ativo" },
    { id: 4, title: "Manual Operacional Y", category: "Manual", version: "1.0", upload_date: "2024-01-10", status: "Em Revisão" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Folder className="h-6 w-6 text-foreground" />
          <div>
            <h1 className="text-2xl font-semibold ">Documentos</h1>
            <p className="text-sm text-muted-foreground">Geral</p>
          </div>
        </div>
        <Button onClick={() => setDocumentDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Adicionar Documento
        </Button>
      </div>

      {/* Search and Filters (Optional) */}
      <div className="mb-4">
        <Input placeholder="Buscar documentos..." />
        {/* Add filter dropdowns if needed */}
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>Documentos cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Data Upload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.upload_date}</TableCell>
                    <TableCell>{doc.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Ver</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Add download/delete buttons */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum documento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <DocumentDialog open={isDocumentDialogOpen} onOpenChange={setDocumentDialogOpen} /> */}
       <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar documentos será implementado aqui.</p>
       </div>
    </div>
  );
}

