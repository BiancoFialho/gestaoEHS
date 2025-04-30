
"use client";

import type { MouseEvent } from 'react';
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react'; // Import an icon

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }).min(1, { message: "O e-mail é obrigatório." }), // Now strictly email
  password: z.string().min(1, { message: "A senha é obrigatória." }),
  manterLogado: z.boolean().default(false).optional(),
});

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted
    if (!isLoading && isAuthenticated) {
      router.push('/'); // Redirect if already authenticated
    }
  }, [isAuthenticated, router, isLoading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      manterLogado: false,
    },
  });

 async function onSubmit(values: z.infer<typeof formSchema>) {
    const loginSuccessful = await login(values.email, values.password); // Use await since login might be async
    if (loginSuccessful) {
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
        variant: "default",
      });
      router.push('/'); // Redirect to home page (dashboard) on successful login
    } else {
      toast({
        title: "Falha no Login",
        description: "E-mail ou senha inválidos.", // Updated message
        variant: "destructive",
      });
      form.resetField("password"); // Clear password field on failure
    }
  }


  const handleSignUpClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Implement sign-up navigation or modal logic here
    toast({
        title: "Função não implementada",
        description: "A funcionalidade de cadastro ainda não está disponível.",
        variant: "default",
    });
    // Example: router.push('/signup');
  };

  // Avoid rendering the form server-side or before hydration check
  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        {/* Optional: Add a loading spinner */}
        <p>Carregando...</p>
      </div>
    );
  }

  // If authenticated after loading, render null or a redirecting message
  if (isAuthenticated) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
         <p>Redirecionando...</p>
       </div>
     );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-lg border border-border">
        <CardHeader className="text-center pb-4 space-y-2">
           <div className="flex justify-center items-center gap-2">
             <LayoutDashboard className="h-8 w-8 text-primary" /> {/* Added Icon */}
             <CardTitle className="text-3xl font-bold text-primary">EHS Control</CardTitle>
          </div>
           <p className="text-sm text-muted-foreground">Faça login para continuar</p> {/* Added subtitle */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel> {/* Updated Label */}
                    <FormControl>
                      <Input placeholder="Digite seu e-mail" {...field} /> {/* Updated placeholder */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel> {/* Kept Label */}
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha" {...field} /> {/* Kept placeholder */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="manterLogado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal text-sm text-muted-foreground">
                        Manter-me logado
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'} {/* Changed button text */}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex flex-col items-center justify-center pt-4 pb-6 border-t border-border space-y-2">
             <span className="text-sm text-muted-foreground">Ainda não tem conta?</span>
             <Link href="#" onClick={handleSignUpClick} className="text-sm text-primary hover:underline font-medium px-2 py-1 rounded-sm transition-colors">
                Cadastre-se
             </Link>
             {/* Optional: Forgot password link */}
             {/* <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Esqueceu sua senha?
             </Link> */}
          </CardFooter>
      </Card>
    </div>
  );
}
