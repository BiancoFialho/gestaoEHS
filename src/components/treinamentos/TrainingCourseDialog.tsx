"use client";

import React, { useState } from 'react';
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
import { addTraining } from '@/actions/trainingActions';

interface TrainingCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  courseName: z.string().min(3, { message: "Nome do curso deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  provider: z.string().optional(),
  durationHours: z.coerce.number().int().positive().optional().nullable(),
  frequencyMonths: z.coerce.number().int().nonnegative().optional().nullable(),
  targetAudience: z.string().optional(),
  contentOutline: z.string().optional(),
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
      targetAudience: "",
      contentOutline: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
            ...values,
            description: values.description || null,
            provider: values.provider || null,
            durationHours: values.durationHours || null,
            frequencyMonths: values.frequencyMonths === 0 ? 0 : (values.frequencyMonths || null),
            targetAudience: values.targetAudience || null,
            contentOutline: values.contentOutline || null,
        };
      const result = await addTraining(dataToSend);
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

  React.useEffect(() => {
    if (!open) {
      form.reset();
      setIsSubmitting(false);
    }
  }, [open, form]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Curso</DialogTitle>
          <DialogDescription>
            Insira os detalhes do curso de treinamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Curso *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: NR-35 Trabalho em Altura" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descrição do curso..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Interno, Consultoria XYZ" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duração (horas)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 8" {...field} value={field.value ?? ''} min="1" onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="frequencyMonths"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Periodicidade (meses)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 12 (0 para N/A)" {...field} value={field.value ?? ''} min="0" onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Público Alvo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Todos os Colaboradores, Líderes" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="contentOutline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo Programático</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Principais tópicos abordados no curso..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
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
