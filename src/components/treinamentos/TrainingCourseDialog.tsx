
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addTraining } from '@/actions/trainingActions'; // Server action for courses

interface TrainingCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation
const formSchema = z.object({
  courseName: z.string().min(3, { message: "Nome do curso deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  provider: z.string().optional(),
  durationHours: z.coerce.number().int().positive().optional().nullable(), // Coerce to number, allow optional null
  frequencyMonths: z.coerce.number().int().nonnegative().optional().nullable(), // Allow 0 or positive, optional null
});

type CourseFormValues = z.infer<typeof formSchema>;

const TrainingCourseDialog: React.FC<TrainingCourseDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      description: "",
      provider: "",
      durationHours: null,
      frequencyMonths: null,
    },
  });
   const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting Course Data:", values);
    try {
      const result = await addTraining(values); // Use the server action
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Curso de treinamento adicionado com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao adicionar curso.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding training course:", error);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Curso</DialogTitle>
          <DialogDescription>
            Insira os detalhes do curso de treinamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Nome *</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Nome do Curso" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Fornecedor</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Ex: Interno, Consultoria XYZ" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="durationHours"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Duração (h)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ex: 8" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="frequencyMonths"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Periodic. (m)</FormLabel>
                         <FormControl>
                           <Input type="number" placeholder="Ex: 12 (0=N/A)" {...field} value={field.value ?? ''} min="0"/>
                         </FormControl>
                         <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
            </div>
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Descrição</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Conteúdo ou objetivos do curso..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

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

export default TrainingCourseDialog;
