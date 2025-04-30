
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns"; // For date formatting
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
import { getAllEmployees, getAllTrainings } from '@/lib/db'; // To fetch employees/trainings

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
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);


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

  // Fetch employees and trainings when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Direct DB calls (consider implications - API/Server Action preferred)
          const [fetchedEmployees, fetchedTrainings] = await Promise.all([
            getAllEmployees(),
            getAllTrainings(),
          ]);
          setEmployees(fetchedEmployees as Employee[]);
          setTrainings(fetchedTrainings as Training[]);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({ title: "Erro", description: "Não foi possível carregar funcionários ou cursos.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      // Reset form and data when dialog closes
      form.reset();
      setEmployees([]);
      setTrainings([]);
      setIsSubmitting(false);
    }
  }, [open, form, toast]);

  const onSubmit = async (values: RecordFormValues) => {
    setIsSubmitting(true);
    // Convert IDs to numbers and format dates
    const dataToSend = {
        ...values,
        employeeId: parseInt(values.employeeId, 10),
        trainingId: parseInt(values.trainingId, 10),
        completionDate: format(values.completionDate, 'yyyy-MM-dd'), // Format for DB
        expiryDate: values.expiryDate ? format(values.expiryDate, 'yyyy-MM-dd') : null,
    };
    console.log("Submitting Record Data:", dataToSend);

    try {
      const result = await addTrainingRecord(dataToSend);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Registro de treinamento adicionado com sucesso.",
        });
        form.reset();
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value ?? ""}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                            </SelectItem>
                        ))}
                        {!isLoading && employees.length === 0 && <SelectItem value="no-emp" disabled>Nenhum funcionário</SelectItem>}
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value ?? ""}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                             <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {trainings.map((trn) => (
                            <SelectItem key={trn.id} value={trn.id.toString()}>
                            {trn.course_name}
                            </SelectItem>
                        ))}
                         {!isLoading && trainings.length === 0 && <SelectItem value="no-trn" disabled>Nenhum curso</SelectItem>}
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
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione data</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
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
                             disabled={(date) => date < new Date("1900-01-01")} // Allow future dates
                            initialFocus
                        />
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
                    <Input type="number" placeholder="Ex: 8.5 (opcional)" {...field} value={field.value ?? ''} step="0.1"/>
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
