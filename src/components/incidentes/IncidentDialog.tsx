"use client";

import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
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
import { addIncident } from '@/actions/incidentActions'; // Import server action
// Import server actions for fetching data
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface IncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation
const formSchema = z.object({
  date: z.date({ required_error: "Data do incidente é obrigatória." }),
  type: z.string({ required_error: "Tipo de incidente é obrigatório." }).min(1, "Selecione o tipo."),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres." }),
  locationId: z.string().optional(),
  severity: z.string().optional(),
  reportedById: z.string().optional(), // Who reported it
  status: z.string().optional().default('Aberto'),
   // Add fields for investigation details later if needed
  // rootCause: z.string().optional(),
  // correctiveActions: z.string().optional(),
  // involvedPersonsIds: z.string().optional(), // Maybe use multi-select later
  // lostDays: z.coerce.number().int().nonnegative().optional(),
  // cost: z.coerce.number().nonnegative().optional(),
});

type IncidentFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; } // Assuming User type

const IncidentDialog: React.FC<IncidentDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]); // For reporter dropdown
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined, // Start with undefined date
      type: "",
      description: "",
      locationId: "",
      severity: "",
      reportedById: "",
      status: "Aberto",
    },
  });

   // Fetch locations and users using Server Actions within useEffect
   useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [locationsResult, usersResult] = await Promise.all([
            fetchLocations(),
            fetchUsers(),
          ]);

          if (locationsResult.success && locationsResult.data) {
            setLocations(locationsResult.data);
          } else {
            console.error("Error fetching locations:", locationsResult.error);
            toast({ title: "Erro", description: "Não foi possível carregar os locais.", variant: "destructive" });
          }

          if (usersResult.success && usersResult.data) {
            setUsers(usersResult.data);
          } else {
             console.error("Error fetching users:", usersResult.error);
             toast({ title: "Erro", description: "Não foi possível carregar os usuários.", variant: "destructive" });
          }

        } catch (error) {
          console.error("Error fetching data:", error);
          toast({ title: "Erro", description: "Não foi possível carregar locais ou usuários.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
       form.reset({
           date: undefined, // Explicitly reset date field
            type: "",
            description: "",
            locationId: "",
            severity: "",
            reportedById: "",
            status: "Aberto",
        });
       setLocations([]);
       setUsers([]);
       setIsSubmitting(false);
    }
   }, [open, form, toast]);

  const onSubmit = async (values: IncidentFormValues) => {
     if (!values.date) {
        toast({
            title: "Erro de Validação",
            description: "Data do incidente é obrigatória.",
            variant: "destructive",
        });
        return;
     }

    setIsSubmitting(true);
    const dataToSend = {
      ...values,
      date: format(values.date, 'yyyy-MM-dd HH:mm:ss'), // Format date with time for DB
      locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
      reportedById: values.reportedById ? parseInt(values.reportedById, 10) : undefined,
      severity: values.severity || undefined, // Ensure undefined if empty string
      status: values.status || 'Aberto', // Ensure default status if needed
    };
    console.log("Submitting Incident Data:", dataToSend);

    try {
       const result = await addIncident(dataToSend);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Incidente reportado com sucesso.",
        });
        form.reset({ date: undefined, type: "", description: "", locationId: "", severity: "", reportedById: "", status: "Aberto" });
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao reportar incidente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reporting incident:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  // Predefined options
  const incidentTypes = [
    "Acidente com Afastamento",
    "Acidente sem Afastamento",
    "Quase Acidente",
    "Incidente Ambiental",
    "Condição Insegura", // Added option
    "Comportamento Inseguro", // Added option
    "Primeiros Socorros", // Added option
  ];

  const severities = [
    "N/A",
    "Insignificante",
    "Leve",
    "Moderado",
    "Grave",
    "Fatalidade",
  ];

  const statuses = [
    "Aberto",
    "Em Investigação",
    "Aguardando Ação",
    "Fechado",
    "Cancelado",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reportar Novo Incidente</DialogTitle>
          <DialogDescription>
            Descreva o ocorrido, selecione o tipo, local e data.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Data/Hora *</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl className="col-span-3">
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                             {/* Format date and potentially time */}
                            {field.value ? format(field.value, "dd/MM/yyyy HH:mm") : <span>Selecione data/hora</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date || new Date())} // Ensure a date is always set
                            disabled={(date) => date > new Date() } // Prevent future dates
                            initialFocus
                        />
                         {/* Basic Time Input (Consider a dedicated time picker component) */}
                        <div className="p-2 border-t border-border">
                             <Input
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const [hours, minutes] = time.split(':').map(Number);
                                    const newDate = field.value ? new Date(field.value) : new Date();
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    field.onChange(newDate);
                                }}
                                className="w-full"
                            />
                        </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de incidente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Gravidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a gravidade (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {/* <SelectItem value="">Nenhuma</SelectItem> - Removed: Causes hydration error */}
                      {severities.map((sev) => (
                        <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o local (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         {/* <SelectItem value="">Nenhum</SelectItem> - Removed: Causes hydration error */}
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.name}
                            </SelectItem>
                        ))}
                        {!isLoading && locations.length === 0 && <SelectItem value="no-loc" disabled>Nenhum local</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Descrição *</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Descreva detalhadamente o que aconteceu..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reportedById"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Reportado Por</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione quem reportou (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         {/* <SelectItem value="">Anônimo/Não especificado</SelectItem> - Removed: Causes hydration error */}
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                            </SelectItem>
                        ))}
                         {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Status Inicial</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Status inicial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            {/* TODO: Add fields for root cause, actions, involved persons, cost, lost days */}


            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;
