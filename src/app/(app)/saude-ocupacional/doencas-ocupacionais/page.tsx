
import React from 'react';
import { Stethoscope, PlusCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'; // For status

// Placeholder Dialog Component (to be created)
// import DiseaseDialog from '@/components/doencas/DiseaseDialog';

export default function DoencasOcupacionaisPage() {
  // Placeholder state and functions for dialogs
  const [isDiseaseDialogOpen, setDiseaseDialogOpen] = React.useState(false);

  // Placeholder data for occupational diseases
  const diseases = [
    { id: 1, employee: "Carlos Dias", disease: "Tendinite no Ombro", cid: "M75", diagnosis_date: "2024-06-15", cat_issued: true, status: "Afastado" },
    { id: 2, employee: "Gabriela Lima", disease: "Perda Auditiva Induzida por Ruído (PAIR)", cid: "H91.0", diagnosis_date: "2024-03-20", cat_issued: true, status: "Confirmada" },
    { id: 3, employee: "João Mendes", disease: "Dermatite de Contato", cid: "L23", diagnosis_date: "2024-07-25", cat_issued: false, status: "Suspeita" },
    { id: 4, employee: "Maria Oliveira", disease: "LER/DORT - Punho", cid: "M65", diagnosis_date: "2023-12-01", cat_issued: true, status: "Retornado com Restrições" },
  ];

   const getStatusBadgeVariant = (status: string) => {
    if (status === 'Afastado' || status === 'Suspeita') return 'destructive';
    if (status.includes('Restrições')) return 'secondary';
    if (status === 'Confirmada') return 'default';
    return 'outline';
  };


  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Doenças Ocupacionais</h1>
              <p className="text-sm text-muted-foreground">Saúde Ocupacional</p>
            </div>
        </div>
         <Button onClick={() => setDiseaseDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Doença
         </Button>
      </div>

      {/* Search and Filters (Optional) */}
      <div className="mb-4">
        <Input placeholder="Buscar por funcionário, doença ou CID..." />
        {/* Add filter dropdowns for status, CAT issued */}
      </div>

      {/* Occupational Diseases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Doenças Ocupacionais</CardTitle>
          <CardDescription>Acompanhamento de casos suspeitos ou confirmados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Doença</TableHead>
                <TableHead>CID</TableHead>
                <TableHead>Data Diagnóstico</TableHead>
                 <TableHead>CAT Emitida?</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diseases.length > 0 ? (
                diseases.map((disease) => (
                  <TableRow key={disease.id}>
                    <TableCell className="font-medium">{disease.employee}</TableCell>
                    <TableCell>{disease.disease}</TableCell>
                    <TableCell>{disease.cid}</TableCell>
                    <TableCell>{disease.diagnosis_date}</TableCell>
                     <TableCell>
                        {disease.cat_issued ? <CheckCircle className="h-5 w-5 text-green-600"/> : <AlertTriangle className="h-5 w-5 text-yellow-500"/>}
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(disease.status)}>{disease.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Ver Detalhes</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum registro de doença ocupacional encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Placeholder for Dialog */}
      {/* <DiseaseDialog open={isDiseaseDialogOpen} onOpenChange={setDiseaseDialogOpen} /> */}
      <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground text-center">
         <p className="text-muted-foreground">Dialog para registrar/editar doenças ocupacionais será implementado aqui.</p>
      </div>
    </div>
  );
}