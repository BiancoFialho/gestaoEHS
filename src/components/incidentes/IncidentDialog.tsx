
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isValid, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

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
import { useToast } from "@/hooks/use-toast";
import { addIncident, updateIncident } from '@/actions/incidentActions';
import type { IncidentInput as IncidentActionInputType } from '@/actions/incidentActions';
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface IncidentInitialData {
  id?: number;
  description: string;
  date: string;
  type: string;
  severity?: string | null;
  locationId?: number | null;
  reportedById?: number | null;
  status?: string | null;
  root_cause?: string | null;
  corrective_actions?: string | null;
  preventive_actions?: string | null;
  involved_persons_ids?: string | null;
  investigation_responsible_id?: number | null;
  lost_days?: number | null;
  cost?: number | null;
  closure_date?: string | null;
}

interface IncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IncidentInitialData | null;
  onIncidentAddedOrUpdated?: () => void;
}

const DATE_TIME_FORMAT_DISPLAY = "dd/MM/yyyy HH:mm";
const DATE_TIME_FORMAT_DB = "yyyy-MM-dd HH:mm:ss";
const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  dateString: z.string().refine((val) => {
    const parsed = parse(val, DATE_TIME_FORMAT_DISPLAY, new Date());
    return isValid(parsed);
  }, { message: `Data/Hora inválida. Use o formato ${DATE_TIME_FORMAT_DISPLAY}` }),
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
  closureDateString: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    const parsed = parse(val, DATE_FORMAT_DISPLAY, new Date());
    return isValid(parsed);
  }, { message: `Data inválida. Use o formato ${DATE_FORMAT_DISPLAY}` }),
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

  const isEditMode = !!initialData?.id;

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateString: format(new Date(), DATE_TIME_FORMAT_DISPLAY),
      type: "",
      description: "",
      locationId: "",
      severity: "",
      reportedById: "",
      status: "Aberto",
      root_cause: null,
      corrective_actions: null,
      preventive_actions: null,
      involved_persons_ids: null,
      investigation_responsible_id: null,
      lost_days: null,
      cost: null,
      closureDateString: null,
    },
  });

   useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
        if (!isMounted) return;
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

    if (open) {
      fetchData();
      if (isEditMode && initialData) {
        form.reset({
          dateString: initialData.date ? format(parseISO(initialData.date), DATE_TIME_FORMAT_DISPLAY) : format(new Date(), DATE_TIME_FORMAT_DISPLAY),
          type: initialData.type || "",
          description: initialData.description || "",
          locationId: initialData.locationId?.toString() || "",
          severity: initialData.severity || "",
          reportedById: initialData.reportedById?.toString() || "",
          status: initialData.status || "Aberto",
          root_cause: initialData.root_cause ?? null,
          corrective_actions: initialData.corrective_actions ?? null,
          preventive_actions: initialData.preventive_actions ?? null,
          involved_persons_ids: initialData.involved_persons_ids ?? null,
          investigation_responsible_id: initialData.investigation_responsible_id?.toString() || "",
          lost_days: initialData.lost_days ?? null,
          cost: initialData.cost ?? null,
          closureDateString: initialData.closure_date ? format(parseISO(initialData.closure_date), DATE_FORMAT_DISPLAY) : null,
        });
      } else {
        form.reset({
            dateString: format(new Date(), DATE_TIME_FORMAT_DISPLAY),
            type: "", description: "", locationId: "", severity: "", reportedById: "", status: "Aberto",
            root_cause: null, corrective_actions: null, preventive_actions: null, involved_persons_ids: null,
            investigation_responsible_id: "", lost_days: null, cost: null, closureDateString: null,
        });
      }
    } else {
       setIsSubmitting(false);
       setIsLoading(false);
    }
     return () => { isMounted = false; };
   }, [open, form, toast, initialData, isEditMode]);


  const onSubmit = async (values: IncidentFormValues) => {
    setIsSubmitting(true);
    console.log("IncidentDialog onSubmit values:", values);

    let formattedDate: string;
    try {
        const parsedDate = parse(values.dateString, DATE_TIME_FORMAT_DISPLAY, new Date());
        if (!isValid(parsedDate)) throw new Error("Data/Hora do incidente inválida.");
        formattedDate = format(parsedDate, DATE_TIME_FORMAT_DB);
    } catch (e) {
        toast({ title: "Erro de Formato", description: (e as Error).message, variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    let formattedClosureDate: string | null = null;
    if (values.closureDateString) {
        try {
            const parsedClosureDate = parse(values.closureDateString, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsedClosureDate)) throw new Error("Data de fechamento inválida.");
            formattedClosureDate = format(parsedClosureDate, DATE_FORMAT_DB);
        } catch (e) {
            toast({ title: "Erro de Formato", description: (e as Error).message, variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
    }

    const dataToSend: IncidentActionInputType = {
      id: isEditMode ? initialData?.id : undefined,
      description: values.description,
      date: formattedDate,
      type: values.type,
      severity: values.severity === 'none' || values.severity === "" ? null : values.severity,
      locationId: values.locationId ? parseInt(values.locationId, 10) : null,
      reportedById: values.reportedById ? parseInt(values.reportedById, 10) : null,
      status: values.status || 'Aberto',
      root_cause: values.root_cause || null,
      corrective_actions: values.corrective_actions || null,
      preventive_actions: values.preventive_actions || null,
      involved_persons_ids: values.involved_persons_ids || null,
      investigation_responsible_id: values.investigation_responsible_id ? parseInt(values.investigation_responsible_id, 10) : null,
      lost_days: values.lost_days ?? null,
      cost: values.cost ?? null,
      closure_date: formattedClosureDate,
    };
    console.log("Submitting Incident Data to Action:", dataToSend);

    try {
       const result = isEditMode && dataToSend.id
         ? await updateIncident(dataToSend as Required<IncidentActionInputType>)
         : await addIncident(dataToSend);

       if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Incidente ${isEditMode ? 'atualizado' : 'reportado'} com sucesso. ID: ${result.id}`,
        });
        onIncidentAddedOrUpdated?.();
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
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao processar a solicitação.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const incidentTypes = [
    "Acidente com Afastamento", "Acidente sem Afastamento", "Quase Acidente",
    "Incidente Ambiental", "Condição Insegura", "Comportamento Inseguro", "Primeiros Socorros",
    "Dano à Propriedade", "Observação de Segurança", "Vazamento / Derrame"
  ];
  const severities = [ "N/A", "Insignificante", "Leve", "Moderado", "Grave", "Fatalidade" ];
  const statuses = [ "Aberto", "Em Investigação", "Aguardando Ação", "Fechado", "Cancelado" ];
  const NONE_SELECT_VALUE = "__NONE__";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? `Editar Incidente #${initialData?.id}` : 'Reportar Novo Incidente'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Atualize as informações do incidente.' : 'Descreva o ocorrido, selecione o tipo, local e data.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="dateString" render={({ field }) => (
                    <FormItem><FormLabel>Data/Hora * (dd/mm/aaaa HH:mm)</FormLabel><FormControl><Input placeholder={DATE_TIME_FORMAT_DISPLAY} {...field} /></FormControl><FormMessage/></FormItem>
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
                        <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhuma</SelectItem>{severities.map((sev) => (<SelectItem key={sev} value={sev}>{sev}</SelectItem>))}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="locationId" render={({ field }) => (
                    <FormItem><FormLabel>Local</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>{locations.map((loc) => (<SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>))} {!isLoading && locations.length === 0 && <SelectItem value="no-loc" disabled>Nenhum local</SelectItem>}</SelectContent>
                        </Select><FormMessage/>
                    </FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição *</FormLabel><FormControl><Textarea placeholder="Descreva o ocorrido..." {...field} rows={3} /></FormControl><FormMessage/></FormItem>
            )}/>

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
                            <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoading}>
                                <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>{users.map((user) => (<SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>))} {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário</SelectItem>}</SelectContent>
                            </Select><FormMessage/>
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="lost_days" render={({ field }) => (<FormItem><FormLabel>Dias Perdidos</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Custo Estimado (R$)</FormLabel><FormControl><Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}/></FormControl><FormMessage/></FormItem>)}/>
                    <FormField control={form.control} name="closureDateString" render={({ field }) => (
                        <FormItem><FormLabel>Data Fechamento (dd/mm/aaaa)</FormLabel><FormControl><Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} /></FormControl><FormMessage/></FormItem>
                    )}/>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="reportedById" render={({ field }) => (
                    <FormItem><FormLabel>Reportado Por</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Anônimo/Não especificado</SelectItem>{users.map((user) => (<SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>))} {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário</SelectItem>}</SelectContent>
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
