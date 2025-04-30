
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
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import { addRisk } from '@/actions/riskActions'; // Import server action
// Import server actions for fetching data
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface RiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation
const formSchema = z.object({
  description: z.string().min(5, { message: "Descrição deve ter pelo menos 5 caracteres." }),
  locationId: z.string().optional(),
  activity: z.string().optional(),
  hazardType: z.string().optional(),
  probability: z.coerce.number().int().min(1).max(5).optional().nullable(),
  severity: z.coerce.number().int().min(1).max(5).optional().nullable(),
  controlMeasures: z.string().optional(),
  responsiblePersonId: z.string().optional(),
  status: z.string().optional().default('Aberto'),
  reviewDate: z.date().optional().nullable(),
});

type RiskFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; }

const RiskDialog: React.FC<RiskDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RiskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      locationId: "",
      activity: "",
      hazardType: "",
      probability: null,
      severity: null,
      controlMeasures: "",
      responsiblePersonId: "",
      status: "Aberto",
      reviewDate: null,
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
       form.reset();
       setLocations([]);
       setUsers([]);
       setIsSubmitting(false);
    }
  }, [open, form, toast]);


  const onSubmit = async (values: RiskFormValues) => {
    if (!values.probability || !values.severity) {
        toast({
            title: "Erro de Validação",
            description: "Probabilidade e Severidade são obrigatórias para calcular o nível de risco.",
            variant: "destructive",
        });
        return;
    }
     setIsSubmitting(true);
    const dataToSend = {
        ...values,
        locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
        responsiblePersonId: values.responsiblePersonId ? parseInt(values.responsiblePersonId, 10) : undefined,
        probability: values.probability, // Already coerced to number
        severity: values.severity,      // Already coerced to number
        reviewDate: values.reviewDate ? format(values.reviewDate, 'yyyy-MM-dd') : undefined,
        activity: values.activity || null,
        hazardType: values.hazardType || null,
        controlMeasures: values.controlMeasures || null,
        status: values.status || 'Aberto',
    }
    console.log("Submitting Risk Data:", dataToSend);

    try {
      const result = await addRisk(dataToSend);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Risco adicionado com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao adicionar risco.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding risk:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
       setIsSubmitting(false);
    }
  };

  // Watch probability and severity to calculate risk level
  const probability = form.watch('probability');
  const severity = form.watch('severity');
  const calculatedRiskLevel = (probability && severity) ? (probability * severity) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Risco</DialogTitle>
          <DialogDescription>
            Descreva o risco, avalie-o e defina controles.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4"> {/* Scrollable form */}
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Descrição *</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Descreva o risco potencial..." {...field} />
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value ?? ""}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o local (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         <SelectItem value="">Nenhum</SelectItem> {/* Option for no location */}
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
              name="activity"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Atividade</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Atividade relacionada (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="hazardType"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Tipo Perigo</FormLabel>
                  <FormControl className="col-span-3">
                     <Input placeholder="Físico, Químico, Ergonômico..." {...field} value={field.value ?? ''}/>
                     {/* Could be a Select if types are predefined */}
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Probab.* (1-5)</FormLabel>
                        <FormControl>
                           <Input type="number" min="1" max="5" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}/>
                        </FormControl>
                        <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Severid.* (1-5)</FormLabel>
                         <FormControl>
                           <Input type="number" min="1" max="5" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}/>
                         </FormControl>
                         <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
            </div>

            {/* Display calculated risk level */}
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Nível Risco</Label>
                <div className="col-span-3 text-sm font-medium">
                    {calculatedRiskLevel !== null
                        ? calculatedRiskLevel
                        : <span className="text-muted-foreground">N/A</span>
                    }
                </div>
            </div>

             <FormField
              control={form.control}
              name="controlMeasures"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Controles</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Medidas de controle existentes ou propostas..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="responsiblePersonId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Responsável</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value ?? ""}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o responsável (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         <SelectItem value="">Nenhum</SelectItem>
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
                  <FormLabel className="text-right">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Controlado">Controlado</SelectItem>
                       <SelectItem value="Mitigado">Mitigado</SelectItem>
                       <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reviewDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Data Revisão</FormLabel>
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
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione data (opcional)</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t"> {/* Sticky footer */}
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

export default RiskDialog;
