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
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for description
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addLocation } from '@/actions/locationActions'; // Import server action

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Zod schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome do local deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  type: z.string().optional(), // e.g., 'Escritório', 'Fábrica'
});

type LocationFormValues = z.infer<typeof formSchema>;

const LocationDialog: React.FC<LocationDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
    },
  });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: LocationFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addLocation(values);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Local adicionado com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
            title: "Erro",
            description: result.error || "Falha ao adicionar local.",
            variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding location:", error);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Local</DialogTitle>
          <DialogDescription>
            Insira os dados do novo local ou área. Clique em salvar quando terminar.
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
                    <Input placeholder="Nome do Local (Ex: Almoxarifado)" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Tipo</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Ex: Fábrica, Escritório" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2"> {/* items-start for textarea */}
                  <FormLabel className="text-right pt-2">Descrição</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Detalhes adicionais sobre o local..." {...field} value={field.value ?? ''} />
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

export default LocationDialog;
