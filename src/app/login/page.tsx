
"use client";

import type { MouseEvent } from 'react';
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';

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
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }).min(1, { message: "O e-mail é obrigatório." }),
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Use email for login check
    if (login(values.email, values.password)) {
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
        variant: "default",
      });
      router.push('/'); // Redirect to home page on successful login
    } else {
      toast({
        title: "Falha no Login",
        description: "E-mail ou senha inválidos.",
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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        {/* Optional: Add a loading spinner */}
        <p>Carregando...</p>
      </div>
    );
  }

  // If authenticated after loading, render null or a redirecting message
  if (isAuthenticated) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
         <p>Redirecionando...</p>
       </div>
     );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-lg border border-primary/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-primary">Login</CardTitle>
          {/* Optional: Add a subtle line if desired */}
          {/* <hr className="border-primary/30 mt-2" /> */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu e-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
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
                    <FormLabel>Sua senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="" {...field} />
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
                {form.formState.isSubmitting ? 'Entrando...' : 'Logar'}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex justify-center items-center pt-4 pb-6 border-t border-border">
             <span className="text-sm text-muted-foreground mr-2">Ainda não tem conta?</span>
             <Link href="#" onClick={handleSignUpClick} className="text-sm text-primary hover:underline font-medium px-2 py-1 rounded-sm bg-accent/20 hover:bg-accent/30 transition-colors">
                Cadastre-se
             </Link>
          </CardFooter>
      </Card>
    </div>
  );
}

