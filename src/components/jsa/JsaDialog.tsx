
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isValid, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

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
import { addJsaWithAttachment } from '@/actions/jsaActions';
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface JsaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: JsaInitialData | null; // For editing
}

interface JsaInitialData {
    id?: number;
    task: string;
    locationId?: number | null;
    department?: string | null;
    responsiblePersonId?: number | null;
    teamMembers?: string | null;
    requiredPpe?: string | null;
    status?: string | null;
    reviewDate?: string | null; // Expect YYYY-MM-DD
    attachmentPath?: string | null;
    // steps are not handled here for basic info editing
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  task: z.string().min(5, { message: "Tarefa deve ter pelo menos 5 caracteres." }),
  locationId: z.string().optional(),
  department: z.string().optional(),
  responsiblePersonId: z.string().optional(),
  teamMembers: z.string().optional(),
  requiredPpe: z.string().optional(),
  status: z.string().optional().default('Rascunho'),
  reviewDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  attachment: z.any().optional(), // For file input
});

type JsaFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; }

const NONE_SELECT_VALUE = "__NONE__";

const JsaDialog: React.FC<JsaDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = !!initialData?.id;


  const form = useForm<JsaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "", locationId: "", department: "", responsiblePersonId: "",
      teamMembers: "", requiredPpe: "", status: "Rascunho", reviewDateString: null,
      attachment: undefined,
    },
  });

  useEffect(() => {
     let isMounted = true;
    if (open) {
      const fetchData = async () => {
        if (!isMounted) return;
        setIsLoading(true);
        try {
           const [locationsResult, usersResult] = await Promise.all([ fetchLocations(), fetchUsers() ]);
           if (isMounted) {
              if (locationsResult.success && locationsResult.data) setLocations(locationsResult.data);
              else { console.error("Error fetching locations:", locationsResult.error); toast({ title: "Erro ao Carregar", description: locationsResult.error || "Não foi possível carregar os locais.", variant: "destructive" }); }
              if (usersResult.success && usersResult.data) setUsers(usersResult.data);
              else { console.error("Error fetching users:", usersResult.error); toast({ title: "Erro ao Carregar", description: usersResult.error || "Não foi possível carregar os usuários.", variant: "destructive" }); }
           }
        } catch (error) {
          if (isMounted) { console.error("Error fetching data:", error); toast({ title: "Erro ao Carregar", description: "Não foi possível carregar locais ou usuários.", variant: "destructive" }); }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchData();

      if (isEditMode && initialData) {
        form.reset({
            task: initialData.task || "",
            locationId: initialData.locationId?.toString() || "",
            department: initialData.department || "",
            responsiblePersonId: initialData.responsiblePersonId?.toString() || "",
            teamMembers: initialData.teamMembers || "",
            requiredPpe: initialData.requiredPpe || "",
            status: initialData.status || "Rascunho",
            reviewDateString: initialData.reviewDate ? format(parseISO(initialData.reviewDate), DATE_FORMAT_DISPLAY) : null,
            attachment: undefined, // Attachment is not directly editable, only re-uploadable
        });
      } else {
        form.reset({
            task: "", locationId: "", department: "", responsiblePersonId: "",
            teamMembers: "", requiredPpe: "", status: "Rascunho", reviewDateString: null,
            attachment: undefined,
        });
      }
    } else {
       setLocations([]); setUsers([]); setIsSubmitting(false); setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [open, form, toast, initialData, isEditMode]);

  const onSubmit = async (values: JsaFormValues) => {
     setIsSubmitting(true);
     if (!formRef.current) { setIsSubmitting(false); return; }

     const formData = new FormData(formRef.current);
     console.log("[JsaDialog] FormData before modification values:", Object.fromEntries(formData.entries()));


     if (values.reviewDateString && values.reviewDateString.trim() !== "") {
        try {
            const parsed = parse(values.reviewDateString, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsed)) throw new Error("Data de revisão inválida.");
            formData.set('reviewDate', format(parsed, DATE_FORMAT_DB));
        } catch (e) {
            toast({ title: "Erro de Formato de Data", description: (e as Error).message, variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
     } else {
        formData.delete('reviewDateString'); // Remove if empty/null from react-hook-form
        formData.delete('reviewDate'); // Also remove the target field if it was set by react-hook-form
     }
     
     // Ensure correct name for attachment if submitted by RHF, or it's already correct if from native input
     const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement;
     if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.set('attachment', fileInput.files[0]);
     } else {
        formData.delete('attachment');
     }

    // Handle NONE_SELECT_VALUE for dropdowns
    const locationIdValue = formData.get('locationId') as string;
    if (locationIdValue === NONE_SELECT_VALUE || !locationIdValue) {
        formData.delete('locationId');
    }
    const responsiblePersonIdValue = formData.get('responsiblePersonId') as string;
    if (responsiblePersonIdValue === NONE_SELECT_VALUE || !responsiblePersonIdValue) {
        formData.delete('responsiblePersonId');
    }

    console.log("[JsaDialog] Submitting JSA FormData to Action:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }
    
    // TODO: Implement updateJsaWithAttachment action
    try {
      const result = await addJsaWithAttachment(formData);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: `JSA ${isEditMode ? 'atualizada' : 'adicionada'} com sucesso.`,
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} JSA.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} JSA:`, error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar JSA" : "Adicionar Nova JSA"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere as informações da JSA." : "Insira as informações básicas e anexe o arquivo (opcional)."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarefa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da Tarefa Analisada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                   <Select
                      name={field.name}
                      onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)}
                      value={field.value || ''}
                      disabled={isLoading}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o local (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}> {loc.name} </SelectItem>
                        ))}
                        {!isLoading && locations.length === 0 && <SelectItem value="no-loc-disabled" disabled>Nenhum local</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Departamento (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="responsiblePersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                   <Select
                       name={field.name}
                       onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? '' : value)}
                       value={field.value || ''}
                       disabled={isLoading}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value={NONE_SELECT_VALUE}>Nenhum</SelectItem>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}> {user.name} </SelectItem>
                        ))}
                         {!isLoading && users.length === 0 && <SelectItem value="no-user-disabled" disabled>Nenhum usuário</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipe</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Membros da equipe (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="requiredPpe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EPIs Necessários</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Liste os EPIs (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="attachment"
                render={({ field: { onChange, value, ...restField }}) => (
                    <FormItem>
                        <FormLabel>Anexar JSA (Excel, PDF)</FormLabel>
                        <FormControl>
                             <Input
                                type="file"
                                accept=".xlsx, .xls, .pdf"
                                onChange={(e) => onChange(e.target.files)}
                                {...restField}
                                name="attachment"
                             />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
             />
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Inicial</FormLabel>
                  <Select name={field.name} onValueChange={field.onChange} value={field.value ?? 'Rascunho'}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Rascunho">Rascunho</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Revisado">Revisado</SelectItem>
                      <SelectItem value="Obsoleto">Obsoleto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reviewDateString"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Data Próxima Revisão ({DATE_FORMAT_DISPLAY})</FormLabel>
                    <FormControl>
                        <Input placeholder={`${DATE_FORMAT_DISPLAY} (opcional)`} {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                 {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar")}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JsaDialog;

    