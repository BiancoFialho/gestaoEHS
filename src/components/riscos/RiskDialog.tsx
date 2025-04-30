
"use client";

import React from 'react';
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
import { addRisk } from '@/actions/riskActions'; // Import server action
import { getAllLocations, getAllUsers } from '@/lib/db'; // Fetch related data

interface RiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // TODO: Add 'initialData' prop for editing
}

// Zod schema for validation
const formSchema = z.object({
  description: z.string().min(5, { message: "Descrição deve ter pelo menos 5 caracteres." }),
  locationId: z.string().optional(),
  activity: z.string().optional(),
  hazardType: z.string().optional(),
  probability: z.coerce.number().int().min(1).max(5).optional().nullable(),
  severity: z.coerce.number().int().min(1).max(5).optional().nullable(),
  controlMeasures: z.string().optional(),
  responsiblePersonId: z.string().optional(),
  status: z.string().optional().default('Aberto'),
  reviewDate: z.date().optional().nullable(),
});

type RiskFormValues = z.infer<typeof formSchema>;

interface Location { id: number; name: string; }
interface User { id: number; name: string; }

const RiskDialog: React.FC<RiskDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RiskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      locationId: "",
      activity: "",
      hazardType: "",
      probability: null,
      severity: null,
      controlMeasures: "",
      responsiblePersonId: "",
      status: "Aberto",
      reviewDate: null,
    },
  });

   // Fetch locations and users when the dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Direct DB calls (consider implications)
          const [fetchedLocations, fetchedUsers] = await Promise.all([
            getAllLocations(),
            getAllUsers(), // Assuming getAllUsers excludes sensitive info like password_hash
          ]);
          setLocations(fetchedLocations as Location[]);
          setUsers(fetchedUsers as User[]);
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


  const onSubmit = async (values: RiskFormValues) => {
     setIsSubmitting(true);
    const dataToSend = {
        ...values,
        locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
        responsiblePersonId: values.responsiblePersonId ? parseInt(values.responsiblePersonId, 10) : undefined,
        probability: values.probability ?? undefined, // Send undefined if null
        severity: values.severity ?? undefined, // Send undefined if null
        reviewDate: values.reviewDate ? format(values.reviewDate, 'yyyy-MM-dd') : undefined,
    }
    console.log("Submitting Risk Data:", dataToSend);

    try {
      const result = await addRisk(dataToSend);
       if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Risco adicionado com sucesso.",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao adicionar risco.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding risk:", error);
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
          <DialogTitle>Adicionar Novo Risco</DialogTitle>
          <DialogDescription>
            Descreva o risco, avalie-o e defina controles.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4"> {/* Scrollable form */}
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Descrição *</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Descreva o risco potencial..." {...field} />
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
                         <SelectItem value="">Nenhum</SelectItem> {/* Option for no location */}
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
              name="activity"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Atividade</FormLabel>
                  <FormControl className="col-span-3">
                    <Input placeholder="Atividade relacionada (opcional)" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="hazardType"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Tipo Perigo</FormLabel>
                  <FormControl className="col-span-3">
                     <Input placeholder="Físico, Químico, Ergonômico..." {...field} value={field.value ?? ''}/>
                     {/* Could be a Select if types are predefined */}
                  </FormControl>
                   <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Probab. (1-5)</FormLabel>
                        <FormControl>
                           <Input type="number" min="1" max="5" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 items-center gap-4">
                        <FormLabel className="text-right">Severid. (1-5)</FormLabel>
                         <FormControl>
                           <Input type="number" min="1" max="5" {...field} value={field.value ?? ''}/>
                         </FormControl>
                         <FormMessage className="col-span-2 text-right" />
                        </FormItem>
                    )}
                    />
            </div>

            {/* Display calculated risk level (optional) */}
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Nível Risco</Label>
                <div className="col-span-3 text-sm">
                    {(form.watch('probability') && form.watch('severity'))
                        ? (form.watch('probability')! * form.watch('severity')!)
                        : 'N/A (Preencha Prob. e Sev.)'
                    }
                </div>
            </div>

             <FormField
              control={form.control}
              name="controlMeasures"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-start gap-4 pt-2">
                  <FormLabel className="text-right pt-2">Controles</FormLabel>
                  <FormControl className="col-span-3">
                    <Textarea placeholder="Medidas de controle existentes ou propostas..." {...field} value={field.value ?? ''}/>
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
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Controlado">Controlado</SelectItem>
                       <SelectItem value="Mitigado">Mitigado</SelectItem>
                       <SelectItem value="Cancelado">Cancelado</SelectItem>
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

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t"> {/* Sticky footer */}
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

export default RiskDialog;
