
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isValid, parseISO } from "date-fns";
import { PlusCircle, Trash2 } from 'lucide-react';

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
import { addJsaWithAttachment, updateJsaAction } from '@/actions/jsaActions';
import type { JsaStep as JsaStepType } from '@/actions/dataFetchingActions';

interface JsaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: JsaInitialData | null;
}

interface JsaInitialData {
    id: number;
    task: string;
    locationName?: string | null;
    department?: string | null;
    responsiblePersonName?: string | null;
    teamMembers?: string | null;
    requiredPpe?: string | null;
    status?: string | null;
    reviewDate?: string | null;
    attachmentPath?: string | null;
    steps?: JsaStepType[];
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const stepSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória.'),
  hazards: z.string().min(1, 'Perigos são obrigatórios.'),
  controls: z.string().min(1, 'Controles são obrigatórios.'),
});

const formSchema = z.object({
  task: z.string().min(5, { message: "Tarefa deve ter pelo menos 5 caracteres." }),
  locationName: z.string().optional(),
  department: z.string().optional(),
  responsiblePersonName: z.string().optional(),
  teamMembers: z.string().optional(),
  requiredPpe: z.string().optional(),
  status: z.string().optional().default('Rascunho'),
  reviewDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  attachment: z.any().optional(),
  steps: z.array(stepSchema).optional(),
});

type JsaFormValues = z.infer<typeof formSchema>;

const JsaDialog: React.FC<JsaDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = !!initialData?.id;

  const form = useForm<JsaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      locationName: "",
      department: "",
      responsiblePersonName: "",
      teamMembers: "",
      requiredPpe: "",
      status: "Rascunho",
      reviewDateString: null,
      attachment: undefined,
      steps: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        console.log("JsaDialog: Setting form with initialData:", initialData);
        form.reset({
            task: initialData.task || "",
            locationName: initialData.locationName || "",
            department: initialData.department || "",
            responsiblePersonName: initialData.responsiblePersonName || "",
            teamMembers: initialData.teamMembers || "",
            requiredPpe: initialData.requiredPpe || "",
            status: initialData.status || "Rascunho",
            reviewDateString: initialData.reviewDate ? format(parseISO(initialData.reviewDate), DATE_FORMAT_DISPLAY) : null,
            attachment: undefined,
            steps: initialData.steps || [],
        });
      } else {
        form.reset({
            task: "", locationName: "", department: "", responsiblePersonName: "",
            teamMembers: "", requiredPpe: "", status: "Rascunho", reviewDateString: null,
            attachment: undefined,
            steps: [],
        });
      }
    } else {
       setIsSubmitting(false);
    }
  }, [open, form, initialData, isEditMode]);

  const onSubmit = async (values: JsaFormValues) => {
     setIsSubmitting(true);
     if (!formRef.current) {
        toast({ title: "Erro no Formulário", description: "Não foi possível submeter os dados.", variant: "destructive" });
        setIsSubmitting(false);
        return;
     }

     const formData = new FormData(formRef.current);
     
     if (isEditMode && initialData?.id) {
         formData.append('id', initialData.id.toString());
     }
     
     // Append main fields from react-hook-form values to ensure they are correct
     formData.set('task', values.task || "");
     formData.set('locationName', values.locationName || "");
     formData.set('department', values.department || "");
     formData.set('responsiblePersonName', values.responsiblePersonName || "");
     formData.set('teamMembers', values.teamMembers || "");
     formData.set('requiredPpe', values.requiredPpe || "");
     formData.set('status', values.status || "Rascunho");

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
        formData.set('reviewDate', '');
     }
     formData.delete('reviewDateString');
     
     // Handle attachment file
     const fileInput = formRef.current.querySelector('input[type="file"][name="attachment"]') as HTMLInputElement;
     if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.set('attachment', fileInput.files[0]);
     } else {
        formData.delete('attachment');
     }

     // Handle steps array by serializing it
     if (values.steps && values.steps.length > 0) {
        formData.set('steps', JSON.stringify(values.steps));
     } else {
        formData.delete('steps');
     }
    
    try {
      const action = isEditMode ? updateJsaAction : addJsaWithAttachment;
      const result = await action(formData);

       if (result.success) {
        toast({
          title: "Sucesso!",
          description: `JSA ${isEditMode ? 'atualizada' : 'adicionada'} com sucesso. ID: ${result.id}`,
        });
        form.reset();
        onOpenChange(false);
      } else {
        console.error("[JsaDialog] Erro da Action:", result.error);
        toast({
          title: "Erro ao Salvar JSA",
          description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} JSA.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`[JsaDialog] Erro catastrófico ${isEditMode ? 'atualizando' : 'adicionando'} JSA:`, error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao processar a JSA.",
        variant: "destructive",
      });
    } finally {
       setIsSubmitting(false);
    }
  };
  
  const currentAttachmentName = initialData?.attachmentPath?.split('/').pop();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? `Editar JSA #${initialData?.id}` : "Adicionar Nova JSA"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere as informações e etapas da JSA." : "Insira as informações básicas, adicione as etapas e anexe o arquivo (opcional)."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Gerais</h3>
             <FormField control={form.control} name="task" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarefa *</FormLabel>
                  <FormControl><Input placeholder="Nome da Tarefa Analisada" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="locationName" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl><Input placeholder="Digite o nome do local (opcional)" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl><Input placeholder="Departamento (opcional)" {...field} value={field.value ?? ''}/></FormControl>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="responsiblePersonName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl><Input placeholder="Digite o nome do responsável (opcional)" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="teamMembers" render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipe</FormLabel>
                  <FormControl><Textarea placeholder="Membros da equipe (opcional)" {...field} value={field.value ?? ''}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="requiredPpe" render={({ field }) => (
                <FormItem>
                  <FormLabel>EPIs Necessários</FormLabel>
                  <FormControl><Textarea placeholder="Liste os EPIs (opcional)" {...field} value={field.value ?? ''}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
             />
             <FormField control={form.control} name="attachment" render={({ field }) => (
                <FormItem>
                    <FormLabel>Anexar JSA (Excel, PDF)</FormLabel>
                    <FormControl>
                         <Input type="file" accept=".xlsx, .xls, .pdf" name="attachment" />
                    </FormControl>
                    {isEditMode && currentAttachmentName && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Anexo atual: {currentAttachmentName}. Enviar um novo arquivo irá substituí-lo.
                        </p>
                    )}
                    <FormMessage />
                </FormItem>
              )}
             />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select name={field.name} onValueChange={field.onChange} value={field.value ?? 'Rascunho'}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                        <SelectContent>
                        <SelectItem value="Rascunho">Rascunho</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Revisado">Revisado</SelectItem>
                        <SelectItem value="Obsoleto">Obsoleto</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="reviewDateString" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Data Próxima Revisão ({DATE_FORMAT_DISPLAY})</FormLabel>
                        <FormControl><Input placeholder={`${DATE_FORMAT_DISPLAY} (opcional)`} {...field} value={field.value ?? ''}/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <div className="pt-4 border-t">
                 <h3 className="text-lg font-semibold pb-2">Etapas da Tarefa</h3>
                 <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md relative space-y-2 bg-muted/50">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remover Etapa</span>
                            </Button>
                            <h4 className="font-semibold">Etapa {index + 1}</h4>
                            <FormField
                                control={form.control}
                                name={`steps.${index}.description`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Descrição da Etapa</FormLabel>
                                    <FormControl><Textarea placeholder="Descreva a etapa" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`steps.${index}.hazards`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Perigos</FormLabel>
                                    <FormControl><Textarea placeholder="Liste os perigos" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`steps.${index}.controls`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Controles</FormLabel>
                                    <FormControl><Textarea placeholder="Liste as medidas de controle" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ description: '', hazards: '', controls: '' })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Etapa
                    </Button>
                 </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
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
