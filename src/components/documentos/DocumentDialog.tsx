"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import { addDocument } from '@/actions/documentActions'; // Import server action

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing existing documents
}

// Zod schema for validation
const formSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres." }),
  category: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional().default('Ativo'),
  description: z.string().optional(),
  // TODO: Add file upload handling (likely separate state/logic)
  filePath: z.string().optional().describe("Campo para URL ou caminho do arquivo (upload a ser implementado)"),
  // reviewDate: z.string().optional(), // Consider using a Date picker
});

type DocumentFormValues = z.infer<typeof formSchema>;

const DocumentDialog: React.FC<DocumentDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      version: "",
      status: "Ativo",
      description: "",
      filePath: "",
      // reviewDate: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: DocumentFormValues) => {
     setIsSubmitting(true);
    console.log("Submitting Document Data:", values);
    try {
       // TODO: Implement actual file upload logic here if needed
       // For now, we just pass the values including the placeholder filePath
       // Prepare data for the server action, ensuring null for optional empty strings
        const dataToSend = {
            ...values,
            category: values.category || null,
            version: values.version || null,
            description: values.description || null,
            filePath: values.filePath || null,
        };

       const result = await addDocument(dataToSend);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Documento adicionado com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao adicionar documento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

    // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
       setIsSubmitting(false);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg"> {/* Increased width */}
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Insira as informações do documento e anexe o arquivo (upload pendente).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Título *</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Título do Documento" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Categoria</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Ex: Política, Procedimento, FDS" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Versão</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 1.0" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                            <SelectItem value="Obsoleto">Obsoleto</SelectItem>
                            </SelectContent>
                        </Select>
                         <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
            </div>
             {/* Placeholder for File Input - Needs specific implementation */}
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file-upload" className="text-right">Arquivo</Label>
                <Input id="file-upload" type="file" className="col-span-3" disabled/>
                 <span className="col-span-4 text-xs text-muted-foreground text-right">Upload de arquivo será implementado.</span>
             </div>
             {/* Temporary field for file path/URL if not uploading directly */}
              <FormField
                control={form.control}
                name="filePath"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">URL/Caminho</FormLabel>
                    <FormControl className="col-span-3">
                      <Input placeholder="URL ou caminho (temporário)" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />

             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Descrição</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Breve descrição do conteúdo do documento..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            {/* TODO: Add review date field */}

            <DialogFooter>
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
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
