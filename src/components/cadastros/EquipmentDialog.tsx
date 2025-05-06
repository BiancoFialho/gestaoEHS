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
import { useToast } from "@/hooks/use-toast";
import { addEquipment } from '@/actions/equipmentActions';
import { fetchLocations } from '@/actions/dataFetchingActions';

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome do equipamento deve ter pelo menos 2 caracteres." }),
  type: z.string().optional(),
  locationId: z.string().optional(),
  serialNumber: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  acquisitionDate: z.date().optional().nullable(),
  status: z.string().optional().default('Operacional'),
  maintenanceSchedule: z.string().optional(),
  lastMaintenanceDate: z.date().optional().nullable(),
  nextMaintenanceDate: z.date().optional().nullable(),
});

type EquipmentFormValues = z.infer<typeof formSchema>;

interface Location {
    id: number;
    name: string;
}

const EquipmentDialog: React.FC<EquipmentDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAcquisitionCalendarOpen, setIsAcquisitionCalendarOpen] = useState(false);
  const [isLastMaintenanceCalendarOpen, setIsLastMaintenanceCalendarOpen] = useState(false);
  const [isNextMaintenanceCalendarOpen, setIsNextMaintenanceCalendarOpen] = useState(false);


  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      locationId: "",
      serialNumber: "",
      brand: "",
      model: "",
      acquisitionDate: null,
      status: "Operacional",
      maintenanceSchedule: "",
      lastMaintenanceDate: null,
      nextMaintenanceDate: null,
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const loadLocations = async () => {
        setIsLoadingLocations(true);
        try {
           const result = await fetchLocations();
           if (isMounted) {
               if (result.success && result.data) {
                   setLocations(result.data);
               } else {
                   console.error("Error fetching locations:", result.error);
                   toast({ title: "Erro", description: result.error || "Não foi possível carregar os locais.", variant: "destructive" });
                   setLocations([]);
               }
           }
        } catch (error) {
           if (isMounted) {
              console.error("Error fetching locations:", error);
              toast({ title: "Erro", description: "Não foi possível carregar os locais.", variant: "destructive" });
              setLocations([]);
           }
        } finally {
          if (isMounted) {
             setIsLoadingLocations(false);
          }
        }
      };
      loadLocations();
    } else {
      form.reset();
      setLocations([]);
      setIsSubmitting(false);
      setIsLoadingLocations(false);
      setIsAcquisitionCalendarOpen(false);
      setIsLastMaintenanceCalendarOpen(false);
      setIsNextMaintenanceCalendarOpen(false);
    }
    return () => {
      isMounted = false;
    };
  }, [open, form, toast]);

  const onSubmit = async (values: EquipmentFormValues) => {
    setIsSubmitting(true);
    const dataToSend = {
        ...values,
        locationId: values.locationId ? parseInt(values.locationId, 10) : null,
        serialNumber: values.serialNumber || null,
        type: values.type || null,
        brand: values.brand || null,
        model: values.model || null,
        acquisitionDate: values.acquisitionDate ? format(values.acquisitionDate, 'yyyy-MM-dd') : null,
        status: values.status || 'Operacional',
        maintenanceSchedule: values.maintenanceSchedule || null,
        lastMaintenanceDate: values.lastMaintenanceDate ? format(values.lastMaintenanceDate, 'yyyy-MM-dd') : null,
        nextMaintenanceDate: values.nextMaintenanceDate ? format(values.nextMaintenanceDate, 'yyyy-MM-dd') : null,
    };

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

  const equipmentStatusOptions = ["Operacional", "Em Manutenção", "Fora de Uso", "Aguardando Peças", "Descartado"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
          <DialogDescription>
            Insira os dados do novo equipamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Equipamento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Extintor PQS ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Extintor, Máquina, Ferramenta" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nº de Série</FormLabel>
                    <FormControl>
                        <Input placeholder="Número de série único" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Kidde, Bosch" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: ABC 4kg, GSB 13 RE" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

             <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    value={field.value || undefined}
                    disabled={isLoadingLocations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingLocations ? "Carregando..." : "Selecione um local"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value="none">Nenhum</SelectItem>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="acquisitionDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data Aquisição</FormLabel>
                    <Popover open={isAcquisitionCalendarOpen} onOpenChange={setIsAcquisitionCalendarOpen}>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single" selected={field.value}
                            onSelect={(date) => { field.onChange(date); setIsAcquisitionCalendarOpen(false); }}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus locale={ptBR}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {equipmentStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="maintenanceSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de Manutenção</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a frequência ou plano (Ex: Inspeção mensal, lubrificação semestral)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="lastMaintenanceDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Última Manutenção</FormLabel>
                     <Popover open={isLastMaintenanceCalendarOpen} onOpenChange={setIsLastMaintenanceCalendarOpen}>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setIsLastMaintenanceCalendarOpen(false); }} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus locale={ptBR}/>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="nextMaintenanceDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Próxima Manutenção</FormLabel>
                    <Popover open={isNextMaintenanceCalendarOpen} onOpenChange={setIsNextMaintenanceCalendarOpen}>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setIsNextMaintenanceCalendarOpen(false); }} initialFocus locale={ptBR}/>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>


            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
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
