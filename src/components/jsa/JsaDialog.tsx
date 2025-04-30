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
// Import the actual server action
import { addJsa } from '@/actions/jsaActions';
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';

interface JsaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation - Adapted for JSA, Steps removed from initial dialog
const formSchema = z.object({
  task: z.string().min(5, { message: "Tarefa deve ter pelo menos 5 caracteres." }),
  locationId: z.string().optional(),
  department: z.string().optional(), // Could be useful
  responsiblePersonId: z.string().optional(),
  teamMembers: z.string().optional(), // Text area for members
  // steps removed for initial creation simplification
  requiredPpe: z.string().optional(),
  status: z.string().optional().default('Rascunho'),
  reviewDate: z.date().optional().nullable(),
});

type JsaFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; }


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
      // steps: [], // No longer needed in defaultValues for this simplified dialog
      requiredPpe: "",
      status: "Rascunho",
      reviewDate: null,
    },
  });

   // Fetch locations and users
  useEffect(() => {
     let isMounted = true; // Track if component is mounted

    if (open) {
      const fetchData = async () => {
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
                setLocations([]);
              }

              if (usersResult.success && usersResult.data) {
                setUsers(usersResult.data);
              } else {
                 console.error("Error fetching users:", usersResult.error);
                 toast({ title: "Erro", description: usersResult.error || "Não foi possível carregar os usuários.", variant: "destructive" });
                 setUsers([]);
              }
           }
        } catch (error) {
          if (isMounted) {
             console.error("Error fetching data:", error);
             toast({ title: "Erro", description: "Não foi possível carregar locais ou usuários.", variant: "destructive" });
             setLocations([]);
             setUsers([]);
          }
        } finally {
          if (isMounted) {
             setIsLoading(false);
          }
        }
      };
      fetchData();
    } else {
       form.reset();
       setLocations([]);
       setUsers([]);
       setIsSubmitting(false);
       setIsLoading(false);
    }

    return () => {
        isMounted = false;
    };
  }, [open, form, toast]);


  const onSubmit = async (values: JsaFormValues) => {
     setIsSubmitting(true);
     // Prepare data for the server action
     const dataToSend = {
        task: values.task,
        locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
        department: values.department || null,
        responsiblePersonId: values.responsiblePersonId ? parseInt(values.responsiblePersonId, 10) : undefined,
        teamMembers: values.teamMembers || null,
        requiredPpe: values.requiredPpe || null,
        status: values.status || 'Rascunho',
        reviewDate: values.reviewDate ? format(values.reviewDate, 'yyyy-MM-dd') : undefined,
        // Steps are not included in this simplified creation form
        steps: [], // Send empty array for steps
     }
     console.log("Submitting JSA Data:", dataToSend);

    try {
      // Call the actual addJsa server action
      const result = await addJsa(dataToSend, dataToSend.steps); // Pass empty steps array
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "JSA adicionada com sucesso. Adicione os passos na tela de edição.", // Updated message
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Adjusted width */}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Nova JSA</DialogTitle>
          <DialogDescription>
            Insira as informações básicas da tarefa. Os passos serão adicionados na edição.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
           {/* Scrollable form area with vertical layout */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
                   <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} defaultValue={field.value} disabled={isLoading} value={field.value || undefined}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o local (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {/* Add an explicit "None" option */}
                        <SelectItem value="none">Nenhum</SelectItem>
                        {locations && locations.length > 0 && locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.name}
                            </SelectItem>
                        ))}
                        {!isLoading && (!locations || locations.length === 0) && <SelectItem value="no-loc" disabled>Nenhum local cadastrado</SelectItem>}
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
                    <Input placeholder="Departamento envolvido (opcional)" {...field} value={field.value ?? ''}/>
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
                   <Select onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} defaultValue={field.value} disabled={isLoading} value={field.value || undefined}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o responsável (opcional)"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                         {/* Add an explicit "None" option */}
                        <SelectItem value="none">Nenhum</SelectItem>
                        {users && users.length > 0 && users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                            </SelectItem>
                        ))}
                         {!isLoading && (!users || users.length === 0) && <SelectItem value="no-user" disabled>Nenhum usuário cadastrado</SelectItem>}
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
                    <Textarea placeholder="Membros da equipe envolvidos (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Steps section removed for simplicity */}

             <FormField
              control={form.control}
              name="requiredPpe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EPIs Necessários</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Liste os EPIs requeridos (opcional)" {...field} value={field.value ?? ''}/>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="reviewDate"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Data Próxima Revisão</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
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
                    <FormMessage />
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
