
"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import { addJsaWithAttachment } from '@/actions/jsaActions';
// fetchLocations e fetchUsers não são mais necessários para os campos de texto livre
// import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface JsaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: JsaInitialData | null; // For editing
}

interface JsaInitialData {
    id?: number;
    task: string;
    locationName?: string | null; // Alterado de locationId
    department?: string | null;
    responsiblePersonName?: string | null; // Alterado de responsiblePersonId
    teamMembers?: string | null;
    requiredPpe?: string | null;
    status?: string | null;
    reviewDate?: string | null; // Expect YYYY-MM-DD
    attachmentPath?: string | null;
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  task: z.string().min(5, { message: "Tarefa deve ter pelo menos 5 caracteres." }),
  locationName: z.string().optional(), // Novo campo de texto
  department: z.string().optional(),
  responsiblePersonName: z.string().optional(), // Novo campo de texto
  teamMembers: z.string().optional(),
  requiredPpe: z.string().optional(),
  status: z.string().optional().default('Rascunho'),
  reviewDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  attachment: z.any().optional(),
});

type JsaFormValues = z.infer<typeof formSchema>;

// Não precisamos mais de Location e User aqui se os campos são texto livre
// interface Location { id: number; name: string; }
// interface User { id: number; name: string; }

const JsaDialog: React.FC<JsaDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  // Não precisamos mais de states para locations e users
  // const [locations, setLocations] = useState<Location[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Mantido para consistência, pode ser removido se não houver mais chamadas async no useEffect
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = !!initialData?.id;

  const form = useForm<JsaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      locationName: "", // Inicializar novo campo
      department: "",
      responsiblePersonName: "", // Inicializar novo campo
      teamMembers: "",
      requiredPpe: "",
      status: "Rascunho",
      reviewDateString: null,
      attachment: undefined,
    },
  });

  useEffect(() => {
     let isMounted = true;
    if (open) {
      // fetchData para locations e users não é mais necessário para os campos de texto
      // setIsLoading(true); // Se não houver fetchData, não precisa de isLoading
      // try { ... } finally { setIsLoading(false); }

      if (isEditMode && initialData) {
        form.reset({
            task: initialData.task || "",
            locationName: initialData.locationName || "", // Usar o novo campo
            department: initialData.department || "",
            responsiblePersonName: initialData.responsiblePersonName || "", // Usar o novo campo
            teamMembers: initialData.teamMembers || "",
            requiredPpe: initialData.requiredPpe || "",
            status: initialData.status || "Rascunho",
            reviewDateString: initialData.reviewDate ? format(parseISO(initialData.reviewDate), DATE_FORMAT_DISPLAY) : null,
            attachment: undefined,
        });
      } else {
        form.reset({
            task: "", locationName: "", department: "", responsiblePersonName: "",
            teamMembers: "", requiredPpe: "", status: "Rascunho", reviewDateString: null,
            attachment: undefined,
        });
      }
    } else {
       setIsSubmitting(false);
       // setIsLoading(false); // Resetar se ainda estiver em uso
    }
    return () => { isMounted = false; };
  }, [open, form, initialData, isEditMode]);

  const onSubmit = async (values: JsaFormValues) => {
     setIsSubmitting(true);
     if (!formRef.current) {
        console.error("[JsaDialog] Erro: formRef.current é nulo.");
        toast({ title: "Erro no Formulário", description: "Não foi possível submeter os dados.", variant: "destructive" });
        setIsSubmitting(false);
        return;
     }

     const formData = new FormData(formRef.current);
     console.log("[JsaDialog] FormData original:", Object.fromEntries(formData.entries()));

     // Adicionar locationName e responsiblePersonName manualmente se não estiverem sendo pegos corretamente
     // (react-hook-form pode não atualizar FormData para campos não registrados diretamente com 'name' no input)
     // No entanto, como os campos agora são inputs normais, eles devem ser incluídos pelo FormData.
     // Apenas garantindo que sejam enviados como strings.
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
            formData.set('reviewDate', format(parsed, DATE_FORMAT_DB)); // Nome correto para a action
            formData.delete('reviewDateString'); // Remover o string original se existir
        } catch (e) {
            toast({ title: "Erro de Formato de Data", description: (e as Error).message, variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
     } else {
        formData.delete('reviewDateString');
        formData.set('reviewDate', ''); // Enviar string vazia se não houver data
     }
     
     const fileInput = formRef.current.querySelector('input[type="file"][name="attachment"]') as HTMLInputElement;
     if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.set('attachment', fileInput.files[0]);
     } else {
        // Se não houver arquivo, garantir que o campo 'attachment' não seja enviado ou seja enviado como vazio
        // dependendo de como a action trata isso. Se a action espera 'null' para ausência,
        // não se pode enviar via FormData diretamente. Uma string vazia pode ser interpretada como "sem arquivo".
        formData.delete('attachment'); // Remove para não enviar um File vazio
     }

    console.log("[JsaDialog] Submitting JSA FormData to Action:");
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`);
    }
    
    try {
      const result = await addJsaWithAttachment(formData);
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
          description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} JSA. Verifique os logs do servidor.`,
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
              name="locationName" // Alterado de locationId
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do local (opcional)" {...field} value={field.value ?? ''} />
                  </FormControl>
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
              name="responsiblePersonName" // Alterado de responsiblePersonId
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do responsável (opcional)" {...field} value={field.value ?? ''} />
                  </FormControl>
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
                render={({ field: { onChange, value, ...restField }}) => ( // value e onChange não são usados diretamente para input file com FormData
                    <FormItem>
                        <FormLabel>Anexar JSA (Excel, PDF)</FormLabel>
                        <FormControl>
                             <Input
                                type="file"
                                accept=".xlsx, .xls, .pdf"
                                // onChange={(e) => field.onChange(e.target.files)} // react-hook-form lida com isso
                                {...restField} // Passar o resto das props do field
                                name="attachment" // Crucial para FormData
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

    