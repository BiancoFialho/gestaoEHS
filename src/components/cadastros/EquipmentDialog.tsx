
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isValid, parseISO } from "date-fns";

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
import { addEquipment } from '@/actions/equipmentActions';
import { fetchLocations } from '@/actions/dataFetchingActions';

interface EquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EquipmentInitialData | null;
}

interface EquipmentInitialData {
    id?: number;
    name: string;
    type?: string | null;
    locationId?: number | null;
    serialNumber?: string | null;
    brand?: string | null;
    model?: string | null;
    acquisitionDate?: string | null; // YYYY-MM-DD
    status?: string | null;
    maintenanceSchedule?: string | null;
    lastMaintenanceDate?: string | null; // YYYY-MM-DD
    nextMaintenanceDate?: string | null; // YYYY-MM-DD
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome do equipamento deve ter pelo menos 2 caracteres." }),
  type: z.string().optional(),
  locationId: z.string().optional(),
  serialNumber: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  acquisitionDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  status: z.string().optional().default('Operacional'),
  maintenanceSchedule: z.string().optional(),
  lastMaintenanceDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  nextMaintenanceDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
});

type EquipmentFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }

const EquipmentDialog: React.FC<EquipmentDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData?.id;
  const NONE_SELECT_VALUE = "__NONE__";

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", type: "", locationId: "", serialNumber: "", brand: "", model: "",
      acquisitionDateString: null, status: "Operacional", maintenanceSchedule: "",
      lastMaintenanceDateString: null, nextMaintenanceDateString: null,
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const loadLocations = async () => {
        if (!isMounted) return;
        setIsLoadingLocations(true);
        try {
           const result = await fetchLocations();
           if (isMounted) {
               if (result.success && result.data) setLocations(result.data);
               else { toast({ title: "Erro", description: result.error || "Não foi possível carregar os locais.", variant: "destructive" }); setLocations([]); }
           }
        } catch (error) {
           if (isMounted) { toast({ title: "Erro", description: "Não foi possível carregar os locais.", variant: "destructive" }); setLocations([]); }
        } finally {
          if (isMounted) setIsLoadingLocations(false);
        }
      };
      loadLocations();

      if (isEditMode && initialData) {
        form.reset({
            name: initialData.name || "", type: initialData.type || "",
            locationId: initialData.locationId?.toString() || "",
            serialNumber: initialData.serialNumber || "", brand: initialData.brand || "", model: initialData.model || "",
            acquisitionDateString: initialData.acquisitionDate ? format(parseISO(initialData.acquisitionDate), DATE_FORMAT_DISPLAY) : null,
            status: initialData.status || "Operacional", maintenanceSchedule: initialData.maintenanceSchedule || "",
            lastMaintenanceDateString: initialData.lastMaintenanceDate ? format(parseISO(initialData.lastMaintenanceDate), DATE_FORMAT_DISPLAY) : null,
            nextMaintenanceDateString: initialData.nextMaintenanceDate ? format(parseISO(initialData.nextMaintenanceDate), DATE_FORMAT_DISPLAY) : null,
        });
      } else {
        form.reset({
            name: "", type: "", locationId: "", serialNumber: "", brand: "", model: "",
            acquisitionDateString: null, status: "Operacional", maintenanceSchedule: "",
            lastMaintenanceDateString: null, nextMaintenanceDateString: null,
        });
      }
    } else {
      setLocations([]); setIsSubmitting(false); setIsLoadingLocations(false);
    }
    return () => { isMounted = false; };
  }, [open, form, toast, initialData, isEditMode]);

  const onSubmit = async (values: EquipmentFormValues) => {
    setIsSubmitting(true);
    console.log("[EquipmentDialog] onSubmit values antes da formatação:", values);

    const parseDateString = (dateStr: string | null | undefined, fieldName: string): string | null => {
        if (!dateStr || dateStr.trim() === "") return null;
        try {
            const parsed = parse(dateStr, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsed)) throw new Error(`Data de ${fieldName} inválida.`);
            return format(parsed, DATE_FORMAT_DB);
        } catch (e) { throw e; }
    };

    let formattedAcquisitionDate: string | null = null;
    let formattedLastMaintenanceDate: string | null = null;
    let formattedNextMaintenanceDate: string | null = null;

    try {
        formattedAcquisitionDate = parseDateString(values.acquisitionDateString, "aquisição");
        formattedLastMaintenanceDate = parseDateString(values.lastMaintenanceDateString, "última manutenção");
        formattedNextMaintenanceDate = parseDateString(values.nextMaintenanceDateString, "próxima manutenção");
    } catch (e) {
        toast({ title: "Erro de Formato de Data", description: (e as Error).message, variant: "destructive"});
        setIsSubmitting(false);
        return;
    }

    const dataToSend = {
        name: values.name, type: values.type || null,
        locationId: values.locationId && values.locationId !== NONE_SELECT_VALUE ? parseInt(values.locationId, 10) : null,
        serialNumber: values.serialNumber || null, brand: values.brand || null, model: values.model || null,
        acquisitionDate: formattedAcquisitionDate, status: values.status || 'Operacional',
        maintenanceSchedule: values.maintenanceSchedule || null,
        lastMaintenanceDate: formattedLastMaintenanceDate, nextMaintenanceDate: formattedNextMaintenanceDate,
    };
    console.log("[EquipmentDialog] Submitting to Action:", dataToSend);

    try {
      const result = await addEquipment(dataToSend);
      if (result.success) {
        toast({ title: "Sucesso!", description: `Equipamento ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.` });
        form.reset(); onOpenChange(false);
      } else {
         toast({ title: "Erro ao Salvar", description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} equipamento.`, variant: "destructive" });
      }
    } catch (error) {
      console.error(`[EquipmentDialog] Catch error ${isEditMode ? 'updating' : 'adding'} equipment:`, error);
      toast({ title: "Erro Inesperado no Formulário", description: "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const equipmentStatusOptions = ["Operacional", "Em Manutenção", "Fora de Uso", "Aguardando Peças", "Descartado"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Equipamento" : "Adicionar Novo Equipamento"}</DialogTitle>
          <DialogDescription>{isEditMode ? "Altere os dados do equipamento." : "Insira os dados do novo equipamento."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome do Equipamento *</FormLabel><FormControl><Input placeholder="Ex: Extintor PQS ABC" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Tipo</FormLabel><FormControl><Input placeholder="Ex: Extintor, Máquina" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="serialNumber" render={({ field }) => (
                    <FormItem><FormLabel>Nº de Série</FormLabel><FormControl><Input placeholder="Número de série único" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ex: Kidde, Bosch" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ex: ABC 4kg, GSB 13 RE" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <FormField control={form.control} name="locationId" render={({ field }) => (
                <FormItem><FormLabel>Local</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoadingLocations}>
                    <FormControl><SelectTrigger><SelectValue placeholder={isLoadingLocations ? "Carregando..." : "Selecione um local"} /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>{locations.map((loc) => (<SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>))}
                       {!isLoadingLocations && locations.length === 0 && (<SelectItem value="no-locations" disabled>Nenhum local</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="acquisitionDateString" render={({ field }) => (
                    <FormItem><FormLabel>Data Aquisição ({DATE_FORMAT_DISPLAY})</FormLabel><FormControl><Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? 'Operacional'}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                        <SelectContent>{equipmentStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="maintenanceSchedule" render={({ field }) => (
                <FormItem><FormLabel>Plano de Manutenção</FormLabel><FormControl><Textarea placeholder="Descreva a frequência ou plano..." {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="lastMaintenanceDateString" render={({ field }) => (
                    <FormItem><FormLabel>Última Manutenção ({DATE_FORMAT_DISPLAY})</FormLabel><FormControl><Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="nextMaintenanceDateString" render={({ field }) => (
                    <FormItem><FormLabel>Próxima Manutenção ({DATE_FORMAT_DISPLAY})</FormLabel><FormControl><Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                 <Button type="submit" disabled={isSubmitting || isLoadingLocations}>{isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentDialog;

    