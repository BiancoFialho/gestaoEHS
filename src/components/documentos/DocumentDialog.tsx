
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isValid, parseISO } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addDocument } from '@/actions/documentActions';
import { fetchUsers, fetchJsas } from '@/actions/dataFetchingActions';

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DocumentInitialData | null;
}

interface DocumentInitialData {
    id?: number;
    title: string;
    category?: string | null;
    version?: string | null;
    status?: string | null;
    description?: string | null;
    filePath?: string | null;
    reviewDate?: string | null; // YYYY-MM-DD
    authorId?: number | null;
    ownerDepartment?: string | null;
    jsaId?: number | null;
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres." }),
  category: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional().default('Ativo'),
  description: z.string().optional(),
  filePath: z.string().optional(),
  reviewDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  authorId: z.string().optional(),
  ownerDepartment: z.string().optional(),
  jsaId: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof formSchema>;

interface User { id: number; name: string; }
interface Jsa { id: number; task: string; }

const documentStatusOptions = ["Ativo", "Em Revisão", "Obsoleto", "Rascunho"];
const documentCategories = ["Política", "Procedimento", "Manual", "FDS", "Relatório", "PGR/PPRA", "Plano", "Outro"];
const NONE_SELECT_VALUE = "__NONE__";

const DocumentDialog: React.FC<DocumentDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [jsas, setJsas] = useState<Jsa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData?.id;

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", category: "", version: "", status: "Ativo", description: "",
      filePath: "", reviewDateString: null, authorId: "", ownerDepartment: "", jsaId: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const fetchData = async () => {
        if (!isMounted) return;
        setIsLoading(true);
        try {
          const [usersResult, jsasResult] = await Promise.all([ fetchUsers(), fetchJsas() ]);
          if (isMounted) {
            if (usersResult.success && usersResult.data) setUsers(usersResult.data);
            else { toast({ title: "Erro", description: usersResult.error || "Não foi possível carregar usuários.", variant: "destructive" }); }
            if (jsasResult.success && jsasResult.data) setJsas(jsasResult.data as Jsa[]); // Cast
            else { toast({ title: "Erro", description: jsasResult.error || "Não foi possível carregar JSAs.", variant: "destructive" });}
          }
        } catch (error) {
          if (isMounted) toast({ title: "Erro", description: "Falha ao carregar dados para o formulário.", variant: "destructive" });
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchData();

      if (isEditMode && initialData) {
        form.reset({
            title: initialData.title || "", category: initialData.category || "", version: initialData.version || "",
            status: initialData.status || "Ativo", description: initialData.description || "", filePath: initialData.filePath || "",
            reviewDateString: initialData.reviewDate ? format(parseISO(initialData.reviewDate), DATE_FORMAT_DISPLAY) : null,
            authorId: initialData.authorId?.toString() || "", ownerDepartment: initialData.ownerDepartment || "",
            jsaId: initialData.jsaId?.toString() || "",
        });
      } else {
        form.reset({
            title: "", category: "", version: "", status: "Ativo", description: "",
            filePath: "", reviewDateString: null, authorId: "", ownerDepartment: "", jsaId: "",
        });
      }
    } else {
      setUsers([]); setJsas([]); setIsSubmitting(false); setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [open, form, toast, initialData, isEditMode]);

  const onSubmit = async (values: DocumentFormValues) => {
    setIsSubmitting(true);
    console.log("[DocumentDialog] onSubmit values antes da formatação:", values);

    let formattedReviewDate: string | null = null;
    if (values.reviewDateString && values.reviewDateString.trim() !== "") {
        try {
            const parsed = parse(values.reviewDateString, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsed)) throw new Error("Data de revisão inválida.");
            formattedReviewDate = format(parsed, DATE_FORMAT_DB);
        } catch(e) {
            toast({ title: "Erro de Formato de Data", description: (e as Error).message, variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
    }

    const dataToSend = {
      title: values.title, description: values.description || null, category: values.category || null,
      filePath: values.filePath || null, version: values.version || null, reviewDate: formattedReviewDate,
      status: values.status || 'Ativo',
      jsaId: values.jsaId && values.jsaId !== NONE_SELECT_VALUE ? parseInt(values.jsaId, 10) : null,
      authorId: values.authorId && values.authorId !== NONE_SELECT_VALUE ? parseInt(values.authorId, 10) : null,
      ownerDepartment: values.ownerDepartment || null,
    };
    console.log("[DocumentDialog] Submitting to Action:", dataToSend);

    try {
      const result = await addDocument(dataToSend);
      if (result.success) {
        toast({ title: "Sucesso!", description: `Documento ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.` });
        form.reset(); onOpenChange(false);
      } else {
        toast({ title: "Erro ao Salvar", description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} documento.`, variant: "destructive" });
      }
    } catch (error) {
      console.error(`[DocumentDialog] Catch error ${isEditMode ? 'updating' : 'adding'} document:`, error);
      toast({ title: "Erro Inesperado no Formulário", description: "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Documento" : "Adicionar Novo Documento"}</DialogTitle>
          <DialogDescription>Insira as informações do documento. O upload de arquivo será implementado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Título *</FormLabel><FormControl><Input placeholder="Título do Documento" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Categoria</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? "" : value)} value={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhuma</SelectItem>{documentCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="version" render={({ field }) => (
                    <FormItem><FormLabel>Versão</FormLabel><FormControl><Input placeholder="Ex: 1.0, 2.1b" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? 'Ativo'}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                        <SelectContent>{documentStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="reviewDateString" render={({ field }) => (
                    <FormItem><FormLabel>Data Próxima Revisão ({DATE_FORMAT_DISPLAY})</FormLabel><FormControl><Input placeholder={`${DATE_FORMAT_DISPLAY} (opcional)`} {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Breve descrição do conteúdo..." {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="authorId" render={({ field }) => (
                    <FormItem><FormLabel>Autor</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o autor"} /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>{users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="ownerDepartment" render={({ field }) => (
                    <FormItem><FormLabel>Departamento Proprietário</FormLabel><FormControl><Input placeholder="Ex: Engenharia, Qualidade" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <FormField control={form.control} name="jsaId" render={({ field }) => (
                    <FormItem><FormLabel>JSA Associada (Opcional)</FormLabel>
                     <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione a JSA"} /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhuma</SelectItem>{jsas.map(jsa => <SelectItem key={jsa.id} value={jsa.id.toString()}>{jsa.task}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file-upload" className="text-right col-span-1">Arquivo</Label>
                <Input id="file-upload" type="file" className="col-span-3" disabled/>
                <span className="col-span-4 text-xs text-muted-foreground text-right">Upload de arquivo será implementado.</span>
            </div>
            <FormField control={form.control} name="filePath" render={({ field }) => (
                <FormItem><FormLabel>URL/Caminho do Arquivo (Entrada Manual)</FormLabel><FormControl><Input placeholder="Cole a URL ou caminho do arquivo aqui" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
            )}/>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting || isLoading}>{isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDialog;

    