
import React from 'react';
import { Gavel, PlusCircle, Scale } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status

// Placeholder Dialog Component (to be created)
// import LegalActionDialog from '@/components/acoes/LegalActionDialog';

export default function AcoesTrabalhistasPage() {
  // Placeholder state and functions for dialogs
  const [isLegalActionDialogOpen, setLegalActionDialogOpen] = React.useState(false);

  // Placeholder data for legal actions
  const actions = [
    { id: 1, case_number: "001/2024", claimant: "Funcionário A", subject: "Insalubridade", status: "Em Andamento", filed_date: "2024-03-10", estimated_cost: 15000.00 },
    { id: 2, case_number: "125/2023", claimant: "Ex-Funcionário B", subject: "Acidente de Trabalho", status: "Acordo", filed_date: "2023-09-20", estimated_cost: 50000.00, final_cost: 45000.00 },
    { id: 3, case_number: "340/2024", claimant: "Funcionário C", subject: "Doença Ocupacional (LER)", status: "Em Perícia", filed_date: "2024-05-05", estimated_cost: 30000.00 },
    { id: 4, case_number: "055/2022", claimant: "Ex-Funcionário D", subject: "Horas Extras", status: "Arquivado", filed_date: "2022-11-15", estimated_cost: 5000.00, final_cost: 0.00 },
  ];

  const formatCurrency = (value?: number | null) => {
    if (value == null) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

   const getStatusBadgeVariant = (status: string) => {
    if (status === 'Acordo' || status === 'Arquivado') return 'secondary';
    if (status.includes('Perícia') || status.includes('Andamento')) return 'default'; // Use default or another color like blue
    return 'outline';
  };

  return (
    <div>
       <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
                <Gavel className="h-6 w-6 text-foreground" />
                <div>
                    <h1 className="text-2xl font-semibold ">Ações Trabalhistas</h1>
                    <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
                </div>
            </div>
            <Button onClick={() => setLegalActionDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ação
            </Button>
        </div>

        {/* Search and Filters (Optional) */}
       <div className="mb-4">
           <Input placeholder="Buscar por nº do processo, reclamante ou assunto..." />
           {/* Add filter dropdowns for status, year */}
       </div>

      {/* Legal Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ações Trabalhistas</CardTitle>
          <CardDescription>Acompanhamento de processos judiciais relacionados a EHS.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Processo</TableHead>
                <TableHead>Reclamante</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Custo Estimado</TableHead>
                <TableHead>Custo Final</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.length > 0 ? (
                actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.case_number}</TableCell>
                    <TableCell>{action.claimant}</TableCell>
                    <TableCell>{action.subject}</TableCell>
                    <TableCell>{action.filed_date}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(action.status)}>{action.status}</Badge>
                    </TableCell>
                     <TableCell>{formatCurrency(action.estimated_cost)}</TableCell>
                     <TableCell>{formatCurrency(action.final_cost)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                         <Scale className="mr-1 h-4 w-4" /> Detalhes
                      </Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhuma ação trabalhista encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <LegalActionDialog open={isLegalActionDialogOpen} onOpenChange={setLegalActionDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para adicionar/editar ações trabalhistas será implementado aqui.</p>
      </div>
    </div>
  );
}