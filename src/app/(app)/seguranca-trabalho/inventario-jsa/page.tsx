
"use client";

import React from 'react';
import { ClipboardList, PlusCircle, ListFilter, Edit, Paperclip, Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import JsaDialog from '@/components/jsa/JsaDialog';
import { fetchJsas, fetchJsaByIdAction, deleteJsaAction } from '@/actions/dataFetchingActions';
import { useToast } from "@/hooks/use-toast";

interface JsaEntry {
    id: number;
    task: string;
    location_name: string | null;
    responsible_person_name: string | null;
    review_date: string | null; // YYYY-MM-DD
    status: string | null;
    attachment_path: string | null;
}

// Tipo completo para edição, que o JsaDialog espera
interface JsaDataForDialog {
    id: number;
    task: string;
    locationName?: string | null;
    department?: string | null;
    responsiblePersonName?: string | null;
    teamMembers?: string | null;
    requiredPpe?: string | null;
    status?: string | null;
    reviewDate?: string | null; // YYYY-MM-DD
    attachmentPath?: string | null;
}

export default function InventarioJsaPage() {
  const [isJsaDialogOpen, setJsaDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editingJsa, setEditingJsa] = React.useState<JsaDataForDialog | null>(null);
  const [deletingJsa, setDeletingJsa] = React.useState<JsaEntry | null>(null);
  const [jsaEntries, setJsaEntries] = React.useState<JsaEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const loadJsaData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchJsas();
      if (result.success && result.data) {
        setJsaEntries(result.data as JsaEntry[]);
      } else {
        console.error("Failed to fetch JSA entries:", result.error);
        toast({
          title: "Erro ao Carregar JSAs",
          description: result.error || "Não foi possível buscar as JSAs.",
          variant: "destructive",
        });
        setJsaEntries([]);
      }
    } catch (error) {
      console.error("Exception fetching JSA entries:", error);
      toast({
          title: "Erro Crítico ao Carregar JSAs",
          description: error instanceof Error ? error.message : "Ocorreu um erro de rede ou inesperado.",
          variant: "destructive",
      });
      setJsaEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadJsaData();
  }, [loadJsaData]);

  const handleDialogClose = (open: boolean) => {
    setJsaDialogOpen(open);
    if (!open) {
      setEditingJsa(null); // Limpa os dados de edição ao fechar
      loadJsaData(); // Recarregar dados quando o diálogo é fechado
    }
  };

   const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
       if (!status) return 'outline';
       if (status === 'Rascunho') return 'secondary';
       if (status === 'Ativo') return 'default';
       if (status === 'Revisado') return 'outline';
       if (status === 'Obsoleto') return 'destructive';
       return 'outline';
   }

  const handleViewSteps = (id: number) => {
    console.log(`View Steps for JSA ${id}`);
    toast({ title: "Funcionalidade Pendente", description: "Visualizar passos da JSA ainda não implementado."});
  }

  const handleEdit = async (id: number) => {
    console.log(`[inventario-jsa] Edit JSA ${id} requested.`);
    setIsLoading(true);
    try {
        const result = await fetchJsaByIdAction(id);
        if (result.success && result.data) {
            console.log("[inventario-jsa] JSA data fetched for editing:", result.data);
            setEditingJsa(result.data as JsaDataForDialog); // Cast para o tipo completo
            setJsaDialogOpen(true);
        } else {
            console.error(`[inventario-jsa] Failed to fetch JSA ${id}:`, result.error);
            toast({ title: "Erro ao Buscar JSA", description: result.error, variant: "destructive" });
        }
    } catch (error) {
        console.error(`[inventario-jsa] Exception fetching JSA ${id}:`, error);
        toast({ title: "Erro Crítico", description: "Não foi possível carregar os dados da JSA para edição.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingJsa(null);
    setJsaDialogOpen(true);
  };

  const openDeleteConfirmation = (jsa: JsaEntry) => {
    setDeletingJsa(jsa);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingJsa) return;
    setIsLoading(true);
    const result = await deleteJsaAction(deletingJsa.id);
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `JSA "${deletingJsa.task}" foi excluída.`,
      });
      loadJsaData(); // Recarrega a lista
    } else {
      toast({
        title: "Erro ao Excluir",
        description: result.error || "Não foi possível excluir a JSA.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setDeletingJsa(null);
  };


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
         <Button onClick={handleAddNew}>
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
            <Button variant="outline" disabled>
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
                <TableHead className="text-center">Anexo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Carregando JSAs...</TableCell></TableRow>
              ) : filteredJsas.length > 0 ? (
                filteredJsas.map((jsa) => (
                  <TableRow key={jsa.id}>
                    <TableCell className="font-medium">{jsa.task}</TableCell>
                    <TableCell>{jsa.location_name || 'N/A'}</TableCell>
                    <TableCell>{jsa.responsible_person_name || 'N/A'}</TableCell>
                    <TableCell>{jsa.review_date ? new Date(jsa.review_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(jsa.status)}>{jsa.status || 'N/A'}</Badge></TableCell>
                    <TableCell className="text-center">
                        {jsa.attachment_path ? (
                             <a
                                href={jsa.attachment_path}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent"
                                title={`Baixar ${jsa.attachment_path.split('/').pop() || 'anexo'}`}
                            >
                                <Download className="h-4 w-4 text-primary" />
                            </a>
                        ) : (
                            <Paperclip className="h-4 w-4 text-muted-foreground mx-auto" title="Sem Anexo" />
                        )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewSteps(jsa.id)} title="Visualizar Passos">Ver Passos</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(jsa.id)} title="Editar JSA">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmation(jsa)} title="Excluir JSA" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma JSA encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <JsaDialog open={isJsaDialogOpen} onOpenChange={handleDialogClose} initialData={editingJsa} />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir a JSA &quot;{deletingJsa?.task}&quot;? Esta ação não pode ser desfeita e também removerá o arquivo anexado, se houver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingJsa(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
            <p className="text-muted-foreground">A visualização e edição detalhada dos passos da JSA será implementada aqui.</p>
        </div>
    </div>
  );
}
