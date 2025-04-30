
"use client";

import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns"; // For date formatting
import { ptBR } from 'date-fns/locale'; // Import locale pt-BR
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { addTrainingRecord } from '@/actions/trainingRecordActions'; // Server action for records
// Import server actions for fetching data
import { fetchEmployees, fetchTrainings } from '@/actions/dataFetchingActions';

interface TrainingRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation
const formSchema = z.object({
  employeeId: z.string({ required_error: "Selecione um funcionário." }).min(1, "Selecione um funcionário."),
  trainingId: z.string({ required_error: "Selecione um curso." }).min(1, "Selecione um curso."),
  completionDate: z.date({ required_error: "Data de conclusão é obrigatória." }),
  expiryDate: z.date().optional().nullable(),
  score: z.coerce.number().optional().nullable(),
  // certificatePath: z.string().optional(), // For file upload later
});

type RecordFormValues = z.infer<typeof formSchema>;

interface Employee {
    id: number;
    name: string;
}
interface Training {
    id: number;
    course_name: string;
}


const TrainingRecordDialog: React.FC<TrainingRecordDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletionCalendarOpen, setIsCompletionCalendarOpen] = useState(false); // State for completion date calendar
  const [isExpiryCalendarOpen, setIsExpiryCalendarOpen] = useState(false); // State for expiry date calendar


  const form = useForm<RecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
      trainingId: "",
      completionDate: undefined, // Start with undefined date
      expiryDate: null,
      score: null,
    },
  });

  // Fetch employees and trainings using Server Actions within useEffect
  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [employeesResult, trainingsResult] = await Promise.all([
            fetchEmployees(),
            fetchTrainings(),
          ]);

           if (isMounted) {
              if (employeesResult.success && employeesResult.data) {
                setEmployees(employeesResult.data);
              } else {
                 console.error("Error fetching employees:", employeesResult.error);
                 toast({ title: "Erro", description: employeesResult.error || "Não foi possível carregar funcionários.", variant: "destructive" });
                 setEmployees([]);
              }

              if (trainingsResult.success && trainingsResult.data) {
                setTrainings(trainingsResult.data);
              } else {
                 console.error("Error fetching trainings:", trainingsResult.error);
                 toast({ title: "Erro", description: trainingsResult.error || "Não foi possível carregar cursos.", variant: "destructive" });
                 setTrainings([]);
              }
           }

        } catch (error) {
          if (isMounted) {
             console.error("Error fetching data:", error);
             toast({ title: "Erro", description: "Não foi possível carregar funcionários ou cursos.", variant: "destructive" });
             setEmployees([]);
             setTrainings([]);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      fetchData();
    } else {
      // Reset form and data when dialog closes
      form.reset({
          employeeId: "",
          trainingId: "",
          completionDate: undefined,
          expiryDate: null,
          score: null,
      });
      setEmployees([]);
      setTrainings([]);
      setIsSubmitting(false);
      setIsLoading(false);
      setIsCompletionCalendarOpen(false);
      setIsExpiryCalendarOpen(false);
    }

    return () => {
      isMounted = false;
    };
  }, [open, form, toast]);

  const onSubmit = async (values: RecordFormValues) => {
    if (!values.completionDate) {
        toast({
            title: "Erro de Validação",
            description: "Data de conclusão é obrigatória.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    // Convert IDs to numbers and format dates
    const dataToSend = {
        ...values,
        employeeId: parseInt(values.employeeId, 10),
        trainingId: parseInt(values.trainingId, 10),
        completionDate: format(values.completionDate, 'yyyy-MM-dd'), // Format for DB
        expiryDate: values.expiryDate ? format(values.expiryDate, 'yyyy-MM-dd') : null,
        score: values.score ?? null, // Ensure null if empty
    };
    console.log("Submitting Record Data:", dataToSend);

    try {
      const result = await addTrainingRecord(dataToSend);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Registro de treinamento adicionado com sucesso.",
        });
        form.reset({ employeeId: "", trainingId: "", completionDate: undefined, expiryDate: null, score: null });
        onOpenChange(false);
      } else {
         toast({
            title: "Erro",
            description: result.error || "Falha ao adicionar registro.",
            variant: "destructive",
         });
      }
    } catch (error) {
      console.error("Error adding training record:", error);
      toast({
        title: "Erro",
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
          <DialogTitle>Adicionar Registro de Treinamento</DialogTitle>
          <DialogDescription>
            Selecione o funcionário, curso e insira os detalhes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Funcionário *</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value || undefined}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {employees && employees.length > 0 && employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                            </SelectItem>
                        ))}
                        {!isLoading && (!employees || employees.length === 0) && <SelectItem value="no-emp" disabled>Nenhum funcionário cadastrado</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="trainingId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Curso *</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value || undefined}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                             <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {trainings && trainings.length > 0 && trainings.map((trn) => (
                            <SelectItem key={trn.id} value={trn.id.toString()}>
                            {trn.course_name}
                            </SelectItem>
                        ))}
                         {!isLoading && (!trainings || trainings.length === 0) && <SelectItem value="no-trn" disabled>Nenhum curso cadastrado</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="completionDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Data Conclusão *</FormLabel>
                    <Popover open={isCompletionCalendarOpen} onOpenChange={setIsCompletionCalendarOpen}>
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
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione data</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                field.onChange(date || new Date());
                                // Não fecha o calendário ao selecionar: setIsCompletionCalendarOpen(false);
                            }}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            locale={ptBR} // Use ptBR locale for calendar display
                        />
                        <div className="p-2 flex justify-end">
                            <Button size="sm" onClick={() => setIsCompletionCalendarOpen(false)}>Fechar</Button>
                         </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Data Vencimento</FormLabel>
                     <Popover open={isExpiryCalendarOpen} onOpenChange={setIsExpiryCalendarOpen}>
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
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione data (opcional)</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                             onSelect={(date) => {
                                field.onChange(date || null); // Set to null if cleared
                                // Não fecha o calendário ao selecionar: setIsExpiryCalendarOpen(false);
                            }}
                             disabled={(date) => date < new Date("1900-01-01")} // Allow future dates
                            initialFocus
                             locale={ptBR} // Use ptBR locale for calendar display
                        />
                         <div className="p-2 flex justify-end">
                            <Button size="sm" onClick={() => setIsExpiryCalendarOpen(false)}>Fechar</Button>
                         </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Nota/Score</FormLabel>
                  <FormControl className="col-span-3">
                    <Input type="number" placeholder="Ex: 8.5 (opcional)" {...field} value={field.value ?? ''} step="0.1" onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             {/* TODO: Add certificate upload field */}

            <DialogFooter>
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

export default TrainingRecordDialog;
