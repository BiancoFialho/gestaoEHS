
import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Login Temporariamente Desativado</h1>
        <p className="text-muted-foreground mb-6">
          A funcionalidade de login está desativada no momento.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  );
}
