
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useFormState(loginAction, { success: false, message: '', errors: undefined });

  useEffect(() => {
    if (state.success === false && state.message) {
      toast({
        title: 'Erro no Login',
        description: state.message,
        variant: 'destructive',
      });
    }
    // O redirecionamento em caso de sucesso é feito pela server action com redirect()
    // Se precisasse ser feito aqui, seria:
    // if (state.success === true) {
    //   router.push('/');
    // }
  }, [state, toast, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Gestão EHS</CardTitle>
          <CardDescription>Acesse o painel de controle.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              {state.errors?.email && <p className="text-xs text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
              {state.errors?.password && <p className="text-xs text-destructive mt-1">{state.errors.password[0]}</p>}
            </div>
            {/* Mensagem de erro geral (não relacionada a campos específicos) */}
            {state.message && !state.errors && (
                 <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{state.message}</p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
            <div className="text-sm text-muted-foreground">
             Não tem uma conta?{' '}
             <Link href="/cadastro" className="font-medium text-primary hover:underline">
                Cadastre-se
             </Link>
            </div>
            <Link href="#" className="text-xs text-muted-foreground hover:underline">
             Esqueceu sua senha?
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
