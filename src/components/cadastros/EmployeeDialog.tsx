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
  DialogClose, // Import DialogClose
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addEmployee } from '@/actions/employeeActions'; // Import server action

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Zod schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  role: z.string().optional(),
  department: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof formSchema>;

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      department: "",
    },
  });
    const [isSubmitting, setIsSubmitting] = React.useState(false);


  const onSubmit = async (values: EmployeeFormValues) => {
     setIsSubmitting(true);
    try {
      const result = await addEmployee(values);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Funcionário adicionado com sucesso.",
        });
        form.reset(); // Reset form after successful submission
        onOpenChange(false); // Close dialog
      } else {
         toast({
            title: "Erro",
            description: result.error || "Falha ao adicionar funcionário.",
            variant: "destructive",
         });
      }
    } catch (error) {
      console.error("Error adding employee:", error);
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
       setIsSubmitting(false); // Reset submitting state on close
    }
  }, [open, form]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
          <DialogDescription>
            Insira os dados do novo funcionário. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Nome *</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Nome Completo" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Cargo</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Ex: Técnico de Segurança" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Departamento</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Ex: Produção" {...field} value={field.value ?? ''}/>
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

export default EmployeeDialog;
