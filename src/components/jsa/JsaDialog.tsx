
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
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
// Assume new server action 'addJsa' exists or will be created
// import { addJsa } from '@/actions/jsaActions';
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface JsaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation - Adapted for JSA
const formSchema = z.object({
  task: z.string().min(5, { message: "Tarefa deve ter pelo menos 5 caracteres." }),
  locationId: z.string().optional(),
  department: z.string().optional(), // Could be useful
  responsiblePersonId: z.string().optional(),
  teamMembers: z.string().optional(), // Text area for members
  steps: z.array(z.object({ // Array for JSA steps
      description: z.string().min(3, "Descreva o passo."),
      hazards: z.string().min(3, "Liste os perigos."),
      controls: z.string().min(3, "Liste as medidas de controle."),
  })).optional().default([]),
  requiredPpe: z.string().optional(),
  status: z.string().optional().default('Rascunho'),
  reviewDate: z.date().optional().nullable(),
});

type JsaFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; }

// Function to simulate adding JSA (replace with actual action call)
async function addJsa(data: any): Promise<{ success: boolean; error?: string; id?: number }> {
  console.log("Simulating JSA Add:", data);
  await new Promise(resolve => setTimeout(resolve, 500));
  // Simulate success
  return { success: true, id: Math.floor(Math.random() * 1000) };
  // Simulate error
  // return { success: false, error: "Erro simulado ao adicionar JSA." };
}

const JsaDialog: React.FC<JsaDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JsaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      locationId: "",
      department: "",
      responsiblePersonId: "",
      teamMembers: "",
      steps: [], // Initialize steps array
      requiredPpe: "",
      status: "Rascunho",
      reviewDate: null,
    },
  });

   // Fetch locations and users
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
           const [locationsResult, usersResult] = await Promise.all([
            fetchLocations(),
            fetchUsers(),
          ]);

          if (locationsResult.success && locationsResult.data) {
            setLocations(locationsResult.data);
          } else {
            console.error("Error fetching locations:", locationsResult.error);
            toast({ title: "Erro", description: "Não foi possível carregar os locais.", variant: "destructive" });
          }

          if (usersResult.success && usersResult.data) {
            setUsers(usersResult.data);
          } else {
             console.error("Error fetching users:", usersResult.error);
             toast({ title: "Erro", description: "Não foi possível carregar os usuários.", variant: "destructive" });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({ title: "Erro", description: "Não foi possível carregar locais ou usuários.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
       form.reset();
       setLocations([]);
       setUsers([]);
       setIsSubmitting(false);
    }
  }, [open, form, toast]);


  const onSubmit = async (values: JsaFormValues) => {
     setIsSubmitting(true);
     // Prepare data for the server action
     const dataToSend = {
        ...values,
        locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
        responsiblePersonId: values.responsiblePersonId ? parseInt(values.responsiblePersonId, 10) : undefined,
        reviewDate: values.reviewDate ? format(values.reviewDate, 'yyyy-MM-dd') : undefined,
        // Ensure other optional text fields are null if empty
        department: values.department || null,
        teamMembers: values.teamMembers || null,
        requiredPpe: values.requiredPpe || null,
        status: values.status || 'Rascunho',
     }
     console.log("Submitting JSA Data:", dataToSend);

    try {
      // Replace with actual call to addJsa action when created
      const result = await addJsa(dataToSend);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "JSA adicionada com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao adicionar JSA.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding JSA:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
       setIsSubmitting(false);
    }
  };

  // TODO: Add functions to manage steps (add, remove) if needed in the dialog

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Increased max-width */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Nova JSA</DialogTitle>
          <DialogDescription>
            Descreva a tarefa, identifique os passos, perigos e controles.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           {/* Scrollable form area */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Tarefa *</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Nome da Tarefa Analisada" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Local</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value ?? ""}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o local (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         <SelectItem value="">Nenhum</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.name}
                            </SelectItem>
                        ))}
                        {!isLoading && locations.length === 0 && <SelectItem value="no-loc" disabled>Nenhum local</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Departamento</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Departamento envolvido (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="responsiblePersonId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Responsável</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading} value={field.value ?? ""}>
                        <FormControl className="col-span-3">
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o responsável (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         <SelectItem value="">Nenhum</SelectItem>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                            </SelectItem>
                        ))}
                         {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário</SelectItem>}
                        </SelectContent>
                    </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamMembers"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Equipe</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Membros da equipe envolvidos (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

             {/* JSA Steps Section - Placeholder - Needs more complex UI */}
             <div className="col-span-4 border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-2">Passos da Tarefa</h4>
                {/* Placeholder: Add UI to add/edit steps (Array Field) */}
                 <div className="text-center text-muted-foreground p-4 border rounded bg-muted/50">
                    [Interface para adicionar/editar passos, perigos e controles será implementada aqui]
                 </div>
                 {/*
                 Example structure for steps rendering (using react-hook-form useFieldArray):
                 {fields.map((step, index) => (
                    <div key={step.id} className="grid grid-cols-3 gap-2 mb-2 border p-2 rounded">
                        <FormField control={form.control} name={`steps.${index}.description`} render={...} />
                        <FormField control={form.control} name={`steps.${index}.hazards`} render={...} />
                        <FormField control={form.control} name={`steps.${index}.controls`} render={...} />
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remover</Button>
                    </div>
                 ))}
                 <Button type="button" onClick={() => append({ description: "", hazards: "", controls: "" })}>Adicionar Passo</Button>
                 */}
             </div>

             <FormField
              control={form.control}
              name="requiredPpe"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">EPIs Necessários</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Liste os EPIs requeridos para a tarefa..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Rascunho">Rascunho</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Revisado">Revisado</SelectItem>
                       <SelectItem value="Obsoleto">Obsoleto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reviewDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Data Revisão</FormLabel>
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
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

            {/* Sticky footer */}
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
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

export default JsaDialog;

