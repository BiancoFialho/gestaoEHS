
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
} from "@/components/ui/select" // Assuming you have Select
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addEquipment } from '@/actions/equipmentActions'; // Import server action
import { getAllLocations } from '@/lib/db'; // To fetch locations for dropdown

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Zod schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome do equipamento deve ter pelo menos 2 caracteres." }),
  type: z.string().optional(),
  locationId: z.string().optional(), // Use string initially for Select
  serialNumber: z.string().optional(),
  maintenanceSchedule: z.string().optional(),
  // lastMaintenanceDate: z.string().optional(), // Consider using a Date picker component
});

type EquipmentFormValues = z.infer<typeof formSchema>;

interface Location {
    id: number;
    name: string;
}

const EquipmentDialog: React.FC<EquipmentDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      locationId: "",
      serialNumber: "",
      maintenanceSchedule: "",
      // lastMaintenanceDate: "",
    },
  });

  // Fetch locations when the dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchLocations = async () => {
        setIsLoadingLocations(true);
        try {
          // Note: Calling db functions directly in Client Components is generally discouraged.
          // Ideally, fetch locations via an API route or Server Action if needed dynamically.
          // For simplicity here, we might fetch them once or pass them as props if static.
          // This direct call might cause issues in some environments or with edge runtime.
           const fetchedLocations = await getAllLocations(); // Direct DB call (consider implications)
           setLocations(fetchedLocations as Location[]);
        } catch (error) {
          console.error("Error fetching locations:", error);
          toast({ title: "Erro", description: "Não foi possível carregar os locais.", variant: "destructive" });
        } finally {
          setIsLoadingLocations(false);
        }
      };
      fetchLocations();
    } else {
       // Reset form and locations when dialog closes
      form.reset();
      setLocations([]);
       setIsSubmitting(false);
    }
  }, [open, form, toast]);

  const onSubmit = async (values: EquipmentFormValues) => {
    setIsSubmitting(true);
    // Convert locationId back to number before sending
    const dataToSend = {
        ...values,
        locationId: values.locationId ? parseInt(values.locationId, 10) : null,
    }

    try {
      const result = await addEquipment(dataToSend);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Equipamento adicionado com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
         toast({
            title: "Erro",
            description: result.error || "Falha ao adicionar equipamento.",
            variant: "destructive",
         });
      }
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
          <DialogDescription>
            Insira os dados do novo equipamento. Clique em salvar quando terminar.
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
                    <Input placeholder="Nome do Equipamento" {...field} />
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
                    <Input placeholder="Ex: Extintor, Máquina" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Nº Série</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Número de série único" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Local</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingLocations}
                    value={field.value ?? ""}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingLocations ? "Carregando..." : "Selecione um local"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.name}
                        </SelectItem>
                      ))}
                       {!isLoadingLocations && locations.length === 0 && (
                           <SelectItem value="no-locations" disabled>Nenhum local cadastrado</SelectItem>
                       )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maintenanceSchedule"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Plano Manut.</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Descreva a frequência ou plano (Ex: Anual, Semestral)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             {/* TODO: Add field for last_maintenance_date (potentially using a Calendar component) */}

            <DialogFooter>
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                 <Button type="submit" disabled={isSubmitting || isLoadingLocations}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentDialog;
