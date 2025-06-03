
"use client";

import React, { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addTrainingRecord } from '@/actions/trainingRecordActions';
import { fetchEmployees, fetchTrainings } from '@/actions/dataFetchingActions';

interface TrainingRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TrainingRecordInitialData | null; // For editing
}

interface TrainingRecordInitialData {
    id?: number;
    employeeId: number;
    trainingId: number;
    completionDate: string; // Expect YYYY-MM-DD
    expiryDate?: string | null; // Expect YYYY-MM-DD
    score?: number | null;
    status?: string | null;
    instructorName?: string | null;
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  employeeId: z.string({ required_error: "Selecione um funcionário." }).min(1, "Selecione um funcionário."),
  trainingId: z.string({ required_error: "Selecione um curso." }).min(1, "Selecione um curso."),
  completionDateString: z.string({required_error: "Data de conclusão é obrigatória."}).refine((val) => {
    if (!val || val.trim() === "") return false; // Obrigatório
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  expiryDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  score: z.coerce.number().optional().nullable(),
  status: z.string().optional().default('Concluído'),
  instructorName: z.string().optional(),
});

type RecordFormValues = z.infer<typeof formSchema>;

interface Employee { id: number; name: string; }
interface Training { id: number; course_name: string; }

const trainingStatusOptions = ["Concluído", "Pendente", "Vencido", "Agendado", "Cancelado"];
const NONE_SELECT_VALUE = "__NONE__";

const TrainingRecordDialog: React.FC<TrainingRecordDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData?.id;

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "", trainingId: "", completionDateString: "",
      expiryDateString: null, score: null, status: "Concluído", instructorName: "",
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const fetchData = async () => {
        if (!isMounted) return;
        setIsLoading(true);
        try {
          const [employeesResult, trainingsResult] = await Promise.all([
            fetchEmployees(),
            fetchTrainings(),
          ]);
           if (isMounted) {
              if (employeesResult.success && employeesResult.data) setEmployees(employeesResult.data);
              else { console.error("Error fetching employees:", employeesResult.error); toast({ title: "Erro", description: employeesResult.error || "Não foi possível carregar funcionários.", variant: "destructive" }); setEmployees([]); }
              if (trainingsResult.success && trainingsResult.data) setTrainings(trainingsResult.data);
              else { console.error("Error fetching trainings:", trainingsResult.error); toast({ title: "Erro", description: trainingsResult.error || "Não foi possível carregar cursos.", variant: "destructive" }); setTrainings([]); }
           }
        } catch (error) {
          if (isMounted) { console.error("Error fetching data:", error); toast({ title: "Erro", description: "Não foi possível carregar funcionários ou cursos.", variant: "destructive" }); setEmployees([]); setTrainings([]);}
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchData();

      if (isEditMode && initialData) {
        form.reset({
            employeeId: initialData.employeeId?.toString() || "",
            trainingId: initialData.trainingId?.toString() || "",
            completionDateString: initialData.completionDate ? format(parseISO(initialData.completionDate), DATE_FORMAT_DISPLAY) : "",
            expiryDateString: initialData.expiryDate ? format(parseISO(initialData.expiryDate), DATE_FORMAT_DISPLAY) : null,
            score: initialData.score ?? null,
            status: initialData.status || "Concluído",
            instructorName: initialData.instructorName || "",
        });
      } else {
        form.reset({
            employeeId: "", trainingId: "", completionDateString: "",
            expiryDateString: null, score: null, status: "Concluído", instructorName: ""
        });
      }
    } else {
      setEmployees([]); setTrainings([]); setIsSubmitting(false); setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [open, form, toast, initialData, isEditMode]);

  const onSubmit = async (values: RecordFormValues) => {
    setIsSubmitting(true);
    console.log("[TrainingRecordDialog] onSubmit values:", values);

    let formattedCompletionDate: string;
    let formattedExpiryDate: string | null = null;

    try {
        const parsedCompletion = parse(values.completionDateString, DATE_FORMAT_DISPLAY, new Date());
        if (!isValid(parsedCompletion)) throw new Error("Data de conclusão inválida.");
        formattedCompletionDate = format(parsedCompletion, DATE_FORMAT_DB);

        if (values.expiryDateString && values.expiryDateString.trim() !== "") {
            const parsedExpiry = parse(values.expiryDateString, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsedExpiry)) throw new Error("Data de vencimento inválida.");
            formattedExpiryDate = format(parsedExpiry, DATE_FORMAT_DB);
        }
    } catch(e) {
        toast({ title: "Erro de Formato de Data", description: (e as Error).message, variant: "destructive"});
        setIsSubmitting(false);
        return;
    }

    const dataToSend = {
        employeeId: parseInt(values.employeeId, 10),
        trainingId: parseInt(values.trainingId, 10),
        completionDate: formattedCompletionDate,
        expiryDate: formattedExpiryDate,
        score: values.score ?? null,
        status: values.status || 'Concluído',
        instructorName: values.instructorName || null,
    };
    console.log("[TrainingRecordDialog] Submitting Record Data to Action:", dataToSend);

    // TODO: Implement updateTrainingRecord action
    try {
      const result = await addTrainingRecord(dataToSend);
      if (result.success) {
        toast({ title: "Sucesso!", description: `Registro de treinamento ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.`});
        form.reset();
        onOpenChange(false);
      } else {
         toast({ title: "Erro", description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} registro.`, variant: "destructive" });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} training record:`, error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um erro inesperado.", variant: "destructive"});
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Registro" : "Adicionar Registro de Treinamento"}</DialogTitle>
          <DialogDescription>
            Selecione o funcionário, curso e insira os detalhes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário *</FormLabel>
                   <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? "" : value)} value={field.value || ""} disabled={isLoading}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value={NONE_SELECT_VALUE} disabled>Selecione um funcionário</SelectItem>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                            </SelectItem>
                        ))}
                        {!isLoading && employees.length === 0 && <SelectItem value="no-emp" disabled>Nenhum funcionário</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="trainingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso *</FormLabel>
                   <Select onValueChange={(value) => field.onChange(value === NONE_SELECT_VALUE ? "" : value)} value={field.value || ""} disabled={isLoading}>
                        <FormControl>
                        <SelectTrigger>
                             <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value={NONE_SELECT_VALUE} disabled>Selecione um curso</SelectItem>
                        {trainings.map((trn) => (
                            <SelectItem key={trn.id} value={trn.id.toString()}>
                            {trn.course_name}
                            </SelectItem>
                        ))}
                         {!isLoading && trainings.length === 0 && <SelectItem value="no-trn" disabled>Nenhum curso</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="completionDateString"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Data Conclusão * ({DATE_FORMAT_DISPLAY})</FormLabel>
                    <FormControl>
                        <Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="expiryDateString"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Data Vencimento ({DATE_FORMAT_DISPLAY})</FormLabel>
                    <FormControl>
                        <Input placeholder={`${DATE_FORMAT_DISPLAY} (opcional)`} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nota/Score</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 8.5 (opcional)" {...field} value={field.value ?? ''} step="0.1" onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? 'Concluído'}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {trainingStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="instructorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Instrutor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome de quem ministrou (opcional)" {...field} value={field.value ?? ''} />
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

export default TrainingRecordDialog;

    