"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addDocument } from '@/actions/documentActions';
import { fetchUsers, fetchJsas } from '@/actions/dataFetchingActions'; // Assuming fetchJsas exists

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres." }),
  category: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional().default('Ativo'),
  description: z.string().optional(),
  filePath: z.string().optional(),
  reviewDate: z.date().optional().nullable(),
  authorId: z.string().optional(), // string for select value
  ownerDepartment: z.string().optional(),
  jsaId: z.string().optional(), // string for select value
});

type DocumentFormValues = z.infer<typeof formSchema>;

interface User { id: number; name: string; }
interface Jsa { id: number; task: string; } // Basic JSA type

const documentStatusOptions = ["Ativo", "Em Revisão", "Obsoleto", "Rascunho"];
const documentCategories = ["Política", "Procedimento", "Manual", "FDS", "Relatório", "PGR/PPRA", "Plano", "Outro"];


const DocumentDialog: React.FC<DocumentDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [jsas, setJsas] = useState<Jsa[]>([]); // State for JSAs
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewDateCalendarOpen, setIsReviewDateCalendarOpen] = useState(false);


  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      version: "",
      status: "Ativo",
      description: "",
      filePath: "",
      reviewDate: null,
      authorId: "",
      ownerDepartment: "",
      jsaId: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [usersResult, jsasResult] = await Promise.all([
            fetchUsers(),
            fetchJsas() // Assuming fetchJsas exists and returns { success: boolean, data?: Jsa[], error?: string }
          ]);
          if (isMounted) {
            if (usersResult.success && usersResult.data) {
              setUsers(usersResult.data);
            } else {
              toast({ title: "Erro", description: usersResult.error || "Não foi possível carregar usuários.", variant: "destructive" });
            }
            if (jsasResult.success && jsasResult.data) {
              setJsas(jsasResult.data);
            } else {
              toast({ title: "Erro", description: jsasResult.error || "Não foi possível carregar JSAs.", variant: "destructive" });
            }
          }
        } catch (error) {
          if (isMounted) {
            toast({ title: "Erro", description: "Falha ao carregar dados para o formulário.", variant: "destructive" });
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchData();
    } else {
      form.reset();
      setUsers([]);
      setJsas([]);
      setIsSubmitting(false);
      setIsLoading(false);
      setIsReviewDateCalendarOpen(false);
    }
    return () => { isMounted = false; };
  }, [open, form, toast]);


  const onSubmit = async (values: DocumentFormValues) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...values,
        category: values.category || null,
        version: values.version || null,
        description: values.description || null,
        filePath: values.filePath || null,
        reviewDate: values.reviewDate ? format(values.reviewDate, 'yyyy-MM-dd') : null,
        authorId: values.authorId ? parseInt(values.authorId, 10) : null,
        ownerDepartment: values.ownerDepartment || null,
        jsaId: values.jsaId ? parseInt(values.jsaId, 10) : null,
      };
      const result = await addDocument(dataToSend);
      if (result.success) {
        toast({ title: "Sucesso!", description: "Documento adicionado com sucesso." });
        form.reset();
        onOpenChange(false);
      } else {
        toast({ title: "Erro", description: result.error || "Falha ao adicionar documento.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding document:", error);
      toast({ title: "Erro", description: "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Insira as informações do documento. O upload do arquivo será implementado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do Documento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {documentCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 1.0, 2.1b" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {documentStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="reviewDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data Próxima Revisão</FormLabel>
                    <Popover open={isReviewDateCalendarOpen} onOpenChange={setIsReviewDateCalendarOpen}>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setIsReviewDateCalendarOpen(false); }} initialFocus locale={ptBR}/>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descrição do conteúdo do documento..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="authorId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || undefined} disabled={isLoading}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o autor"} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="ownerDepartment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Departamento Proprietário</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Engenharia, Qualidade" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="jsaId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>JSA Associada (Opcional)</FormLabel>
                     <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || undefined} disabled={isLoading}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione a JSA"} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {jsas.map(jsa => <SelectItem key={jsa.id} value={jsa.id.toString()}>{jsa.task}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file-upload" className="text-right col-span-1">Arquivo</Label>
                <Input id="file-upload" type="file" className="col-span-3" disabled/>
                <span className="col-span-4 text-xs text-muted-foreground text-right">Upload de arquivo será implementado.</span>
            </div>
            <FormField
                control={form.control}
                name="filePath"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>URL/Caminho do Arquivo (Temporário)</FormLabel>
                    <FormControl>
                        <Input placeholder="Cole a URL ou caminho do arquivo aqui" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDialog;
