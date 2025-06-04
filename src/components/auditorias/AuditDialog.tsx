
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
import { Textarea } from "@/components/ui/textarea"; // Embora não usado no form atual, pode ser útil
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addAudit } from '@/actions/auditActions';
import type { AuditInput as AuditActionInputType } from '@/actions/auditActions';
import { fetchUsers } from '@/actions/dataFetchingActions';

interface AuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AuditInitialData | null;
  onAuditAdded?: () => void; // Callback para notificar que uma auditoria foi adicionada
}

interface AuditInitialData {
    id?: number;
    type: string;
    scope: string;
    auditDate: string; // YYYY-MM-DD
    auditor: string;
    leadAuditorId?: number | null;
    status?: string | null;
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd"; // Não usado diretamente no form, mas para referência

const formSchema = z.object({
  type: z.string().min(1, "Tipo é obrigatório."),
  scope: z.string().min(3, { message: "Escopo deve ter pelo menos 3 caracteres." }),
  auditDateString: z.string({ required_error: "Data da auditoria é obrigatória."}).refine((val) => {
    if (!val || val.trim() === "") return false;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  auditor: z.string().min(2, { message: "Auditor(es) deve ter pelo menos 2 caracteres." }),
  leadAuditorId: z.string().optional(), // Será string do select value
  status: z.string().optional().default('Planejada'),
});

type AuditFormValues = z.infer<typeof formSchema>;

interface User { id: number; name: string; }
const auditTypes = ["Interna", "Externa (Certificação)", "Externa (Cliente)", "Comportamental", "Legal", "Fornecedor"];
const auditStatusOptions = ["Planejada", "Em Andamento", "Concluída", "Cancelada", "Atrasada"];
const NONE_SELECT_VALUE = "__NONE__";

const AuditDialog: React.FC<AuditDialogProps> = ({ open, onOpenChange, initialData, onAuditAdded }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData?.id;

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "", scope: "", auditDateString: "", auditor: "",
      leadAuditorId: "", status: "Planejada",
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const loadUsers = async () => {
        if (!isMounted) return;
        setIsLoadingUsers(true);
        try {
           const result = await fetchUsers();
           if (isMounted) {
               if (result.success && result.data) setUsers(result.data as User[]); // Cast
               else { toast({ title: "Erro", description: result.error || "Não foi possível carregar usuários.", variant: "destructive" }); setUsers([]); }
           }
        } catch (error) {
           if (isMounted) { toast({ title: "Erro", description: "Não foi possível carregar usuários.", variant: "destructive" }); setUsers([]); }
        } finally {
          if (isMounted) setIsLoadingUsers(false);
        }
      };
      loadUsers();

      if (isEditMode && initialData) {
        form.reset({
            type: initialData.type || "",
            scope: initialData.scope || "",
            auditDateString: initialData.auditDate ? format(parseISO(initialData.auditDate), DATE_FORMAT_DISPLAY) : "",
            auditor: initialData.auditor || "",
            leadAuditorId: initialData.leadAuditorId?.toString() || "",
            status: initialData.status || "Planejada",
        });
      } else {
        form.reset({
            type: "", scope: "", auditDateString: "", auditor: "",
            leadAuditorId: "", status: "Planejada",
        });
      }
    } else {
      setUsers([]); setIsSubmitting(false); setIsLoadingUsers(false);
    }
    return () => { isMounted = false; };
  }, [open, form, toast, initialData, isEditMode]);

  const onSubmit = async (values: AuditFormValues) => {
    setIsSubmitting(true);
    console.log("[AuditDialog] onSubmit values:", values);

    // A data já está como string no formato dd/MM/yyyy (auditDateString)
    // A action cuidará de converter para YYYY-MM-DD
    const dataToSend: AuditActionInputType = {
        type: values.type,
        scope: values.scope,
        auditDateString: values.auditDateString, // Enviando a string como está
        auditor: values.auditor,
        leadAuditorId: values.leadAuditorId, // string vazia se "Nenhum" ou não selecionado
        status: values.status,
    };
    console.log("[AuditDialog] Submitting to Action:", dataToSend);

    try {
      const result = await addAudit(dataToSend); // Assumindo que addAudit fará a conversão de data
      console.log("[AuditDialog] Result from addAudit action:", result);
      if (result.success) {
        toast({ title: "Sucesso!", description: `Auditoria ${isEditMode ? 'atualizada' : 'agendada'} com sucesso.` });
        onAuditAdded?.(); // Chamar o callback para atualizar a lista
        onOpenChange(false); // Fechar o diálogo
      } else {
         toast({ title: "Erro ao Salvar", description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'agendar'} auditoria.`, variant: "destructive" });
      }
    } catch (error) {
      console.error(`[AuditDialog] Catch error ${isEditMode ? 'updating' : 'adding'} audit:`, error);
      toast({ title: "Erro Inesperado no Formulário", description: "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Auditoria" : "Agendar Nova Auditoria"}</DialogTitle>
          <DialogDescription>Insira as informações da auditoria.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingUsers /* Pode manter desabilitado se o tipo depender de algo carregado */}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo de auditoria" /></SelectTrigger></FormControl>
                    <SelectContent>{auditTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="scope" render={({ field }) => (
                <FormItem><FormLabel>Escopo *</FormLabel><FormControl><Textarea placeholder="Descreva o escopo da auditoria" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="auditDateString" render={({ field }) => (
                    <FormItem><FormLabel>Data da Auditoria * ({DATE_FORMAT_DISPLAY})</FormLabel><FormControl><Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="auditor" render={({ field }) => (
                    <FormItem><FormLabel>Auditor(es) *</FormLabel><FormControl><Input placeholder="Nome(s) do(s) auditor(es)" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="leadAuditorId" render={({ field }) => (
                <FormItem><FormLabel>Auditor Líder</FormLabel>
                   <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)} value={field.value || ""} disabled={isLoadingUsers}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingUsers ? "Carregando..." : "Selecione (opcional)"} /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>
                        {users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>)}
                        {!isLoadingUsers && users.length === 0 && <SelectItem value="no-users" disabled>Nenhum usuário</SelectItem>}
                        </SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? 'Planejada'}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                    <SelectContent>{auditStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                 <Button type="submit" disabled={isLoadingUsers || isSubmitting}>{isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AuditDialog;
