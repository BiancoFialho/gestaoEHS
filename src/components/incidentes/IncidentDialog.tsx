
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from "date-fns"; // Added parseISO
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
import { addIncident, updateIncident } from '@/actions/incidentActions'; // Import updateIncident
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface IncidentData { // More comprehensive type for initialData and DB interaction
  id?: number; // Optional for new incidents
  description: string;
  date: string; // Expecting string from DB, will convert to Date for form
  type: string;
  severity?: string | null;
  locationId?: number | null;
  reportedById?: number | null;
  status?: string | null;
  // Add other fields from your incidents table that might be edited
  root_cause?: string | null;
  corrective_actions?: string | null;
  preventive_actions?: string | null;
  involved_persons_ids?: string | null; // Keep as string for now
  investigation_responsible_id?: number | null;
  lost_days?: number | null;
  cost?: number | null;
  closure_date?: string | null; // Expecting string from DB
}


interface IncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IncidentData | null; // For editing
  onIncidentAddedOrUpdated?: () => void; // Callback to refresh list
}

// Zod schema for validation
const formSchema = z.object({
  date: z.date({ required_error: "Data do incidente é obrigatória." }),
  type: z.string({ required_error: "Tipo de incidente é obrigatório." }).min(1, "Selecione o tipo."),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres." }),
  locationId: z.string().optional(),
  severity: z.string().optional(),
  reportedById: z.string().optional(), 
  status: z.string().optional().default('Aberto'),
  root_cause: z.string().optional().nullable(),
  corrective_actions: z.string().optional().nullable(),
  preventive_actions: z.string().optional().nullable(),
  involved_persons_ids: z.string().optional().nullable(),
  investigation_responsible_id: z.string().optional().nullable(),
  lost_days: z.coerce.number().int().nonnegative().optional().nullable(),
  cost: z.coerce.number().nonnegative().optional().nullable(),
  closure_date: z.date().optional().nullable(),
});

type IncidentFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; } 

const IncidentDialog: React.FC<IncidentDialogProps> = ({ open, onOpenChange, initialData, onIncidentAddedOrUpdated }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); 
  const [isClosureCalendarOpen, setIsClosureCalendarOpen] = useState(false);

  const isEditMode = !!initialData;

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined, 
      type: "",
      description: "",
      locationId: "",
      severity: "",
      reportedById: "",
      status: "Aberto",
      root_cause: "",
      corrective_actions: "",
      preventive_actions: "",
      involved_persons_ids: "",
      investigation_responsible_id: "",
      lost_days: null,
      cost: null,
      closure_date: null,
    },
  });

   useEffect(() => {
    let isMounted = true; 

    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [locationsResult, usersResult] = await Promise.all([
            fetchLocations(),
            fetchUsers(),
          ]);

           if (isMounted) {
              if (locationsResult.success && locationsResult.data) {
                setLocations(locationsResult.data);
              } else {
                console.error("Error fetching locations:", locationsResult.error);
                toast({ title: "Erro", description: locationsResult.error || "Não foi possível carregar os locais.", variant: "destructive" });
              }

              if (usersResult.success && usersResult.data) {
                setUsers(usersResult.data);
              } else {
                 console.error("Error fetching users:", usersResult.error);
                 toast({ title: "Erro", description: usersResult.error || "Não foi possível carregar os usuários.", variant: "destructive" });
              }
           }
        } catch (error) {
           if (isMounted) {
              console.error("Error fetching data:", error);
              toast({ title: "Erro", description: "Não foi possível carregar locais ou usuários.", variant: "destructive" });
           }
        } finally {
          if (isMounted) {
             setIsLoading(false);
          }
        }
      };
      fetchData();

      if (isEditMode && initialData) {
        form.reset({
          ...initialData,
          date: initialData.date ? parseISO(initialData.date) : new Date(),
          locationId: initialData.locationId?.toString() || "",
          reportedById: initialData.reportedById?.toString() || "",
          investigation_responsible_id: initialData.investigation_responsible_id?.toString() || "",
          severity: initialData.severity || "",
          status: initialData.status || "Aberto",
          closure_date: initialData.closure_date ? parseISO(initialData.closure_date) : null,
          lost_days: initialData.lost_days ?? null,
          cost: initialData.cost ?? null,
        });
      } else {
        form.reset({
            date: new Date(), // Set current date for new incidents
            type: "", description: "", locationId: "", severity: "", reportedById: "", status: "Aberto",
            root_cause: "", corrective_actions: "", preventive_actions: "",
            involved_persons_ids: "", investigation_responsible_id: "",
            lost_days: null, cost: null, closure_date: null,
        });
      }
    } else {
       setIsSubmitting(false);
       setIsLoading(false);
       setIsCalendarOpen(false); 
       setIsClosureCalendarOpen(false);
    }
     return () => { isMounted = false; };
   }, [open, form, toast, initialData, isEditMode]);

  const onSubmit = async (values: IncidentFormValues) => {
     if (!values.date) {
        toast({ title: "Erro de Validação", description: "Data do incidente é obrigatória.", variant: "destructive" });
        return;
     }

    setIsSubmitting(true);
    const dataToSend: IncidentData = { // Use the more comprehensive IncidentData type
      ...values,
      id: isEditMode ? initialData?.id : undefined,
      date: format(values.date, 'yyyy-MM-dd HH:mm:ss'), 
      locationId: values.locationId ? parseInt(values.locationId, 10) : null,
      reportedById: values.reportedById ? parseInt(values.reportedById, 10) : null,
      investigation_responsible_id: values.investigation_responsible_id ? parseInt(values.investigation_responsible_id, 10) : null,
      severity: values.severity === 'none' || values.severity === "" ? null : values.severity,
      status: values.status || 'Aberto',
      lost_days: values.lost_days ?? null,
      cost: values.cost ?? null,
      closure_date: values.closure_date ? format(values.closure_date, 'yyyy-MM-dd') : null,
      // Ensure other fields are passed correctly
      root_cause: values.root_cause || null,
      corrective_actions: values.corrective_actions || null,
      preventive_actions: values.preventive_actions || null,
      involved_persons_ids: values.involved_persons_ids || null,
    };
    console.log("Submitting Incident Data:", dataToSend);

    try {
       const result = isEditMode 
         ? await updateIncident(dataToSend) 
         : await addIncident(dataToSend);

       if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Incidente ${isEditMode ? 'atualizado' : 'reportado'} com sucesso.`,
        });
        onIncidentAddedOrUpdated?.(); // Call callback to refresh list
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'reportar'} incidente.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'reporting'} incident:`, error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const incidentTypes = [
    "Acidente com Afastamento", "Acidente sem Afastamento", "Quase Acidente",
    "Incidente Ambiental", "Condição Insegura", "Comportamento Inseguro", "Primeiros Socorros",
  ];
  const severities = [ "N/A", "Insignificante", "Leve", "Moderado", "Grave", "Fatalidade" ];
  const statuses = [ "Aberto", "Em Investigação", "Aguardando Ação", "Fechado", "Cancelado" ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl"> {/* Increased width for more fields */}
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Incidente' : 'Reportar Novo Incidente'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Atualize as informações do incidente.' : 'Descreva o ocorrido, selecione o tipo, local e data.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Data/Hora *</FormLabel>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "dd/MM/yyyy HH:mm", { locale: ptBR }) : <span>Selecione</span>}
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={(date) => { if (date) { const currentTime = field.value || new Date(); date.setHours(currentTime.getHours()); date.setMinutes(currentTime.getMinutes()); field.onChange(date); } else { field.onChange(new Date()); } }} disabled={(date) => date > new Date() } initialFocus locale={ptBR} />
                                <div className="p-2 border-t border-border">
                                    <Input type="time" value={field.value ? format(field.value, "HH:mm") : ""} onChange={(e) => { const time = e.target.value; const [hours, minutes] = time.split(':').map(Number); const newDate = field.value ? new Date(field.value) : new Date(); newDate.setHours(hours); newDate.setMinutes(minutes); field.onChange(newDate); }} className="w-full" />
                                </div>
                                <div className="p-2 flex justify-end"><Button size="sm" onClick={() => setIsCalendarOpen(false)}>Fechar</Button></div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                            <SelectContent>{incidentTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="severity" render={({ field }) => (
                    <FormItem><FormLabel>Gravidade</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="none">Nenhuma</SelectItem>{severities.map((sev) => (<SelectItem key={sev} value={sev}>{sev}</SelectItem>))}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="locationId" render={({ field }) => (
                    <FormItem><FormLabel>Local</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="none">Nenhum</SelectItem>{locations.map((loc) => (<SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>))} {!isLoading && locations.length === 0 && <SelectItem value="no-loc" disabled>Nenhum local</SelectItem>}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição *</FormLabel><FormControl><Textarea placeholder="Descreva o ocorrido..." {...field} rows={3} /></FormControl><FormMessage/></FormItem>
            )}/>

            {/* Investigation Details - Only show if editing or specific conditions met */}
             {(isEditMode || form.watch('status') !== 'Aberto') && (
              <>
                <h3 className="text-md font-semibold mt-4 pt-2 border-t">Detalhes da Investigação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="root_cause" render={({ field }) => (<FormItem><FormLabel>Causa Raiz</FormLabel><FormControl><Textarea placeholder="Análise da causa raiz..." {...field} value={field.value ?? ''} rows={2}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="corrective_actions" render={({ field }) => (<FormItem><FormLabel>Ações Corretivas</FormLabel><FormControl><Textarea placeholder="Ações imediatas e corretivas..." {...field} value={field.value ?? ''} rows={2}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="preventive_actions" render={({ field }) => (<FormItem><FormLabel>Ações Preventivas</FormLabel><FormControl><Textarea placeholder="Ações para evitar recorrência..." {...field} value={field.value ?? ''} rows={2}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="involved_persons_ids" render={({ field }) => (<FormItem><FormLabel>Pessoas Envolvidas (IDs)</FormLabel><FormControl><Input placeholder="IDs separados por vírgula" {...field} value={field.value ?? ''}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="investigation_responsible_id" render={({ field }) => (
                        <FormItem><FormLabel>Responsável Investigação</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || ""} disabled={isLoading}>
                                <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="none">Nenhum</SelectItem>{users.map((user) => (<SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>))} {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário</SelectItem>}</SelectContent>
                            </Select><FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="lost_days" render={({ field }) => (<FormItem><FormLabel>Dias Perdidos</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Custo Estimado (R$)</FormLabel><FormControl><Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="closure_date" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Data Fechamento</FormLabel>
                             <Popover open={isClosureCalendarOpen} onOpenChange={setIsClosureCalendarOpen}>
                                <PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setIsClosureCalendarOpen(false); }} initialFocus locale={ptBR} />
                                </PopoverContent>
                            </Popover>
                        <FormMessage/></FormItem>
                    )}/>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="reportedById" render={({ field }) => (
                    <FormItem><FormLabel>Reportado Por</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="none">Anônimo/Não especificado</SelectItem>{users.map((user) => (<SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>))} {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário</SelectItem>}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "Aberto"}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                            <SelectContent>{statuses.map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
            </div>
            
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                    {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar Incidente")}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;

