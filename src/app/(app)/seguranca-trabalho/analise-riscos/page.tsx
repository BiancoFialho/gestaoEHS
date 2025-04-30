
"use client"; // Add "use client" directive

import React from 'react';
import { AlertTriangle, PlusCircle, ListFilter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status and risk level

// Placeholder Dialog Component (to be created)
// import RiskDialog from '@/components/riscos/RiskDialog';

export default function AnaliseRiscosPage() {
  // Placeholder state and functions for dialogs
  const [isRiskDialogOpen, setRiskDialogOpen] = React.useState(false);

  // Placeholder data for risk list
  const risks = [
    { id: 1, description: "Queda de altura durante manutenção de telhado", location: "Fábrica - Telhado", probability: 3, severity: 5, risk_level: 15, status: "Controlado" },
    { id: 2, description: "Exposição a ruído acima do limite", location: "Produção A - Máquina X", probability: 4, severity: 3, risk_level: 12, status: "Em Andamento" },
    { id: 3, description: "Contato com produto químico corrosivo", location: "Laboratório", probability: 2, severity: 4, risk_level: 8, status: "Controlado" },
    { id: 4, description: "Lesão ergonômica por movimento repetitivo", location: "Escritório", probability: 3, severity: 2, risk_level: 6, status: "Aberto" },
    { id: 5, description: "Atropelamento por empilhadeira", location: "Armazém", probability: 2, severity: 5, risk_level: 10, status: "Em Andamento" },
  ];

   const getRiskLevelBadge = (level: number) => {
        if (level >= 15) return <Badge variant="destructive">Alto ({level})</Badge>;
        if (level >= 9) return <Badge variant="secondary" className="bg-yellow-500 text-black hover:bg-yellow-600">Médio ({level})</Badge>;
        if (level >= 5) return <Badge className="bg-blue-500 hover:bg-blue-600">Baixo ({level})</Badge>;
        return <Badge variant="outline">Trivial ({level})</Badge>;
   }

   const getStatusBadgeVariant = (status: string) => {
       if (status === 'Aberto') return 'destructive';
       if (status === 'Em Andamento') return 'secondary'; // Yellowish or similar
       if (status === 'Controlado' || status === 'Mitigado') return 'default'; // Greenish
       return 'outline';
   }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
         <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Análise de Riscos</h1>
              <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
            </div>
         </div>
         <Button onClick={() => setRiskDialogOpen(true)}>
             <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Risco
         </Button>
      </div>

        {/* Search and Filters (Optional) */}
       <div className="flex gap-2 mb-4">
           <Input placeholder="Buscar por descrição, local ou perigo..." className="flex-grow" />
            <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
           {/* Add specific filter dropdowns: location, status, risk level */}
       </div>

      {/* Risk List Table */}
       <Card>
        <CardHeader>
          <CardTitle>Matriz/Lista de Riscos</CardTitle>
          <CardDescription>Riscos identificados, avaliados e seus controles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição do Risco</TableHead>
                <TableHead>Local</TableHead>
                 {/* <TableHead>Prob.</TableHead>
                 <TableHead>Sev.</TableHead> */}
                <TableHead>Nível Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length > 0 ? (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium max-w-xs truncate">{risk.description}</TableCell>
                    <TableCell>{risk.location}</TableCell>
                    {/* <TableCell>{risk.probability}</TableCell>
                    <TableCell>{risk.severity}</TableCell> */}
                    <TableCell>{getRiskLevelBadge(risk.risk_level)}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(risk.status)}>{risk.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm">Detalhes</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                       {/* Add link to action plan if exists */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground"> {/* Adjusted colspan */}
                    Nenhum risco encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           {/* TODO: Add pagination */}
           {/* TODO: Consider adding a visual Risk Matrix view */}
        </CardContent>
      </Card>


      {/* Placeholder for Dialog */}
      {/* <RiskDialog open={isRiskDialogOpen} onOpenChange={setRiskDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar riscos e visualizar matriz será implementado aqui.</p>
      </div>
    </div>
  );
}
