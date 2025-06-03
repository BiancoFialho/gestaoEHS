
"use client";

import React, { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addEmployee } from '@/actions/employeeActions';

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmployeeInitialData | null; // For editing
}

interface EmployeeInitialData {
    id?: number;
    name: string;
    role?: string | null;
    department?: string | null;
    hireDate?: string | null; // Expect YYYY-MM-DD from DB
    birthDate?: string | null; // Expect YYYY-MM-DD from DB
    rg?: string | null;
    cpf?: string | null;
    phone?: string | null;
    address?: string | null;
}

const DATE_FORMAT_DISPLAY = "dd/MM/yyyy";
const DATE_FORMAT_DB = "yyyy-MM-dd";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  role: z.string().optional(),
  department: z.string().optional(),
  hireDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  birthDateString: z.string().optional().nullable().refine((val) => {
    if (!val || val.trim() === "") return true;
    return isValid(parse(val, DATE_FORMAT_DISPLAY, new Date()));
  }, { message: `Data inválida. Use ${DATE_FORMAT_DISPLAY}` }),
  rg: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof formSchema>;

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onOpenChange, initialData }) => {
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      department: "",
      hireDateString: null,
      birthDateString: null,
      rg: "",
      cpf: "",
      phone: "",
      address: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData?.id;

  const onSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    console.log("[EmployeeDialog] onSubmit values:", values);

    let formattedHireDate: string | null = null;
    if (values.hireDateString && values.hireDateString.trim() !== "") {
        try {
            const parsed = parse(values.hireDateString, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsed)) throw new Error("Data de admissão inválida.");
            formattedHireDate = format(parsed, DATE_FORMAT_DB);
        } catch(e) {
            toast({ title: "Erro de Formato", description: (e as Error).message, variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
    }

    let formattedBirthDate: string | null = null;
    if (values.birthDateString && values.birthDateString.trim() !== "") {
        try {
            const parsed = parse(values.birthDateString, DATE_FORMAT_DISPLAY, new Date());
            if (!isValid(parsed)) throw new Error("Data de nascimento inválida.");
            formattedBirthDate = format(parsed, DATE_FORMAT_DB);
        } catch(e) {
            toast({ title: "Erro de Formato", description: (e as Error).message, variant: "destructive"});
            setIsSubmitting(false);
            return;
        }
    }

    try {
      const dataToSend = {
        name: values.name,
        role: values.role || null,
        department: values.department || null,
        hireDate: formattedHireDate,
        birthDate: formattedBirthDate,
        rg: values.rg || null,
        cpf: values.cpf || null,
        phone: values.phone || null,
        address: values.address || null,
      };
      console.log("[EmployeeDialog] Submitting Employee Data to Action:", dataToSend);

      // TODO: Implement updateEmployee action and use it here if isEditMode
      // For now, only addEmployee is used.
      const result = await addEmployee(dataToSend);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Funcionário ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso. ID: ${result.id}`,
        });
        form.reset();
        onOpenChange(false);
      } else {
         toast({
            title: "Erro",
            description: result.error || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} funcionário.`,
            variant: "destructive",
         });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} employee:`, error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (open) {
        if (isEditMode && initialData) {
            form.reset({
                name: initialData.name || "",
                role: initialData.role || "",
                department: initialData.department || "",
                hireDateString: initialData.hireDate ? format(parseISO(initialData.hireDate), DATE_FORMAT_DISPLAY) : null,
                birthDateString: initialData.birthDate ? format(parseISO(initialData.birthDate), DATE_FORMAT_DISPLAY) : null,
                rg: initialData.rg || "",
                cpf: initialData.cpf || "",
                phone: initialData.phone || "",
                address: initialData.address || "",
            });
        } else {
            form.reset({
                name: "", role: "", department: "",
                hireDateString: null, birthDateString: null,
                rg: "", cpf: "", phone: "", address: "",
            });
        }
    } else {
      setIsSubmitting(false);
    }
  }, [open, form, initialData, isEditMode]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Funcionário" : "Adicionar Novo Funcionário"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados do funcionário." : "Insira os dados do novo funcionário."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do funcionário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Técnico de Segurança" {...field} value={field.value ?? ''} />
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
                      <Input placeholder="Ex: Produção" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="hireDateString"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data Admissão ({DATE_FORMAT_DISPLAY})</FormLabel>
                    <FormControl>
                        <Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="birthDateString"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data Nascimento ({DATE_FORMAT_DISPLAY})</FormLabel>
                    <FormControl>
                        <Input placeholder={DATE_FORMAT_DISPLAY} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                        <Input placeholder="Número do RG" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                        <Input placeholder="Número do CPF" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(XX) XXXXX-XXXX" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Endereço completo" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-6 px-6 border-t">
                <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
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

export default EmployeeDialog;

    