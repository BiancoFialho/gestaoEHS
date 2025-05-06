
"use client";

import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale'; // Import locale pt-BR
import { Calendar as CalendarIcon, Paperclip } from "lucide-react"; // Added Paperclip

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
// Import the actual server action that handles FormData
import { addJsaWithAttachment } from '@/actions/jsaActions';
import { fetchLocations, fetchUsers } from '@/actions/dataFetchingActions';
import { Label } from '@/components/ui/label'; // Import Label

interface JsaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation - Keep basic client-side validation
// File validation is better handled on the server or with custom client logic
const formSchema = z.object({
  task: z.string().min(5, { message: "Tarefa deve ter pelo menos 5 caracteres." }),
  locationId: z.string().optional(),
  department: z.string().optional(), // Could be useful
  responsiblePersonId: z.string().optional(),
  teamMembers: z.string().optional(), // Text area for members
  requiredPpe: z.string().optional(),
  status: z.string().optional().default('Rascunho'),
  reviewDate: z.date().optional().nullable(),
  attachment: z.any().optional(), // For file input type checking if needed client-side
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null); // Ref for the form element


  const form = useForm<JsaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      locationId: "",
      department: "",
      responsiblePersonId: "",
      teamMembers: "",
      requiredPpe: "",
      status: "Rascunho",
      reviewDate: null,
      attachment: undefined,
    },
  });

   // Fetch locations and users
  useEffect(() => {
     let isMounted = true;

    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        console.log("Fetching locations and users...");
        try {
           const [locationsResult, usersResult] = await Promise.all([
            fetchLocations(),
            fetchUsers(),
          ]);

           if (isMounted) {
              if (locationsResult.success && locationsResult.data) {
                 console.log("Locations fetched:", locationsResult.data);
                 setLocations(locationsResult.data);
              } else {
                console.error("Error fetching locations:", locationsResult.error);
                toast({ title: "Erro ao Carregar", description: locationsResult.error || "Não foi possível carregar os locais.", variant: "destructive" });
                setLocations([]);
              }

              if (usersResult.success && usersResult.data) {
                 console.log("Users fetched:", usersResult.data);
                 setUsers(usersResult.data);
              } else {
                 console.error("Error fetching users:", usersResult.error);
                 toast({ title: "Erro ao Carregar", description: usersResult.error || "Não foi possível carregar os usuários.", variant: "destructive" });
                 setUsers([]);
              }
           }
        } catch (error) {
          if (isMounted) {
             console.error("Error fetching data:", error);
             toast({ title: "Erro ao Carregar", description: "Não foi possível carregar locais ou usuários.", variant: "destructive" });
             setLocations([]);
             setUsers([]);
          }
        } finally {
          if (isMounted) {
             console.log("Finished fetching data.");
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
       setIsCalendarOpen(false);
    }

    return () => {
        isMounted = false;
    };
  }, [open, form, toast]);


  // Updated onSubmit to handle FormData
  const onSubmit = async (values: JsaFormValues) => {
     setIsSubmitting(true);
     if (!formRef.current) return; // Ensure form ref is available

     const formData = new FormData(formRef.current); // Create FormData from form element

     // Format the reviewDate if it exists before appending
     if (values.reviewDate) {
        formData.set('reviewDate', format(values.reviewDate, 'yyyy-MM-dd'));
     } else {
        formData.delete('reviewDate'); // Remove if null/undefined
     }

     // Ensure locationId and responsiblePersonId are correctly handled if empty
     if (!values.locationId) formData.delete('locationId');
     if (!values.responsiblePersonId) formData.delete('responsiblePersonId');


     console.log("Submitting JSA FormData:");
     for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
     }


    try {
      // Call the server action that accepts FormData
      const result = await addJsaWithAttachment(formData);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "JSA adicionada com sucesso. Edição e visualização de passos pendente.",
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Nova JSA</DialogTitle>
          <DialogDescription>
            Insira as informações básicas e anexe o arquivo Excel (opcional).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Use a form element ref */}
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
                      name={field.name} // Add name attribute for FormData
                      onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                      value={field.value || ''} // Use empty string for controlled component when no value
                      disabled={isLoading}
                    >
                        <FormControl>
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
                        {!isLoading && locations.length === 0 && <SelectItem value="no-loc" disabled>Nenhum local cadastrado</SelectItem>}
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
                   <Select
                       name={field.name} // Add name attribute for FormData
                       onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                       value={field.value || ''} // Use empty string for controlled component when no value
                       disabled={isLoading}
                    >
                        <FormControl>
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
                         {!isLoading && users.length === 0 && <SelectItem value="no-user" disabled>Nenhum usuário cadastrado</SelectItem>}
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

            {/* File Attachment Input */}
             <FormField
                control={form.control}
                name="attachment"
                render={({ field: { onChange, value, ...restField }}) => ( // Destructure field to handle FileList
                    <FormItem>
                        <FormLabel>Anexar JSA (Excel, PDF)</FormLabel>
                        <FormControl>
                             <Input
                                type="file"
                                accept=".xlsx, .xls, .pdf"
                                onChange={(e) => onChange(e.target.files)} // RHF expects FileList
                                {...restField}
                                name="attachment" // Ensure name attribute for FormData
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
                  <Select
                    name={field.name} // Add name attribute for FormData
                    onValueChange={field.onChange}
                    value={field.value} // RHF manages default value
                   >
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
                     <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione data (opcional)</span>}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                             onSelect={(date) => {
                                field.onChange(date || null);
                                setIsCalendarOpen(false); // Close calendar on date select
                            }}
                            initialFocus
                            locale={ptBR}
                        />
                         <div className="p-2 flex justify-end">
                            <Button size="sm" onClick={() => {field.onChange(null); setIsCalendarOpen(false);}}>Limpar</Button>
                            <Button size="sm" onClick={() => setIsCalendarOpen(false)} className="ml-2">Fechar</Button>
                         </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                 {/* Change button type to submit to trigger form submission */}
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

