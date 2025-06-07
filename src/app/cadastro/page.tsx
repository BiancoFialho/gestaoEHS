
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { registerAction } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react'; // Ícone para cadastro

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Registrando...' : 'Registrar'}
    </Button>
  );
}

export default function CadastroPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(registerAction, { success: false, message: '', errors: undefined });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Cadastro Enviado' : 'Erro no Cadastro',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        // Opcional: redirecionar para login ou mostrar mensagem para aguardar aprovação
        // Por enquanto, o usuário fica na página de cadastro e vê o toast.
      }
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
          <CardDescription>Preencha os campos para se registrar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" type="text" placeholder="Seu Nome Completo" required />
              {state.errors?.name && <p className="text-xs text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              {state.errors?.email && <p className="text-xs text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
              {state.errors?.password && <p className="text-xs text-destructive mt-1">{state.errors.password[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
              {state.errors?.confirmPassword && <p className="text-xs text-destructive mt-1">{state.errors.confirmPassword[0]}</p>}
            </div>
            {/* Mensagem de erro geral ou sucesso */}
            {state.message && !state.errors && !state.success && (
                 <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{state.message}</p>
            )}
            {state.message && state.success && (
                 <p className="text-sm text-green-600 text-center bg-green-500/10 p-2 rounded-md">{state.message}</p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
            <div className="text-sm text-muted-foreground">
             Já tem uma conta?{' '}
             <Link href="/login" className="font-medium text-primary hover:underline">
                Entrar
             </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
