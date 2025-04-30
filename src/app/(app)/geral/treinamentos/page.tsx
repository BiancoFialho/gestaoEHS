
"use client"; // Add "use client" directive

import React from 'react';
import { GraduationCap, BookOpen, CheckSquare, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // To switch between Courses and Records

// Import Dialog Components
import TrainingCourseDialog from '@/components/treinamentos/TrainingCourseDialog';
import TrainingRecordDialog from '@/components/treinamentos/TrainingRecordDialog';

export default function TreinamentosPage() {
  // State and functions for dialogs
  const [isCourseDialogOpen, setCourseDialogOpen] = React.useState(false);
  const [isRecordDialogOpen, setRecordDialogOpen] = React.useState(false);

  // Placeholder data (Fetch from DB later)
  const courses = [
    { id: 1, course_name: "NR-35 Trabalho em Altura", frequency_months: 24, provider: "Consultoria Segura" },
    { id: 2, course_name: "NR-33 Espaços Confinados (Vigia/Trabalhador)", frequency_months: 12, provider: "TreinaEHS" },
    { id: 3, course_name: "Primeiros Socorros Básico", frequency_months: 12, provider: "Interno - Téc. Enfermagem" },
    { id: 4, course_name: "Uso de EPIs Específicos", frequency_months: 0, provider: "Interno - Téc. Segurança" }, // Frequência 0 = treinamento único/reciclagem sob demanda
    { id: 5, course_name: "Operação de Empilhadeira", frequency_months: 12, provider: "Centro Logístico Treinamentos" },
  ];

  const records = [
    { id: 101, employee_name: "Alice Silva", training_name: "NR-35 Trabalho em Altura", completion_date: "2023-10-15", expiry_date: "2025-10-15" },
    { id: 102, employee_name: "Bruno Costa", training_name: "NR-33 Espaços Confinados (Vigia/Trabalhador)", completion_date: "2024-02-20", expiry_date: "2025-02-20" },
    { id: 103, employee_name: "Alice Silva", training_name: "Primeiros Socorros Básico", completion_date: "2024-05-01", expiry_date: "2025-05-01" },
    { id: 104, employee_name: "Carlos Dias", training_name: "Uso de EPIs Específicos", completion_date: "2024-01-10", expiry_date: null },
    { id: 105, employee_name: "Bruno Costa", training_name: "NR-35 Trabalho em Altura", completion_date: "2022-11-01", expiry_date: "2024-11-01" }, // Exemplo Vencendo
    { id: 106, employee_name: "Diana Souza", training_name: "Primeiros Socorros Básico", completion_date: "2023-04-10", expiry_date: "2024-04-10" }, // Exemplo Vencido
    { id: 107, employee_name: "Carlos Dias", training_name: "Operação de Empilhadeira", completion_date: "2023-09-01", expiry_date: "2024-09-01" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-foreground" />
          <div>
            <h1 className="text-2xl font-semibold ">Treinamentos</h1>
            <p className="text-sm text-muted-foreground">Geral</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => setCourseDialogOpen(true)} variant="outline">
                <BookOpen className="mr-2 h-4 w-4" /> Gerenciar Cursos
            </Button>
             <Button onClick={() => setRecordDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Registro
             </Button>
        </div>
      </div>

      <Tabs defaultValue="registros" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="registros"><CheckSquare className="mr-2 h-4 w-4" /> Registros</TabsTrigger>
          <TabsTrigger value="cursos"><BookOpen className="mr-2 h-4 w-4" /> Cursos</TabsTrigger>
        </TabsList>

        {/* Tab de Registros */}
        <TabsContent value="registros">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Treinamento</CardTitle>
              <CardDescription>Histórico de treinamentos realizados pelos funcionários.</CardDescription>
               <Input placeholder="Buscar por funcionário, curso ou data..." className="mt-2" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Data Conclusão</TableHead>
                    <TableHead>Data Vencimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length > 0 ? (
                    records.map((record) => (
                      <TableRow key={record.id} className={record.expiry_date && new Date(record.expiry_date) < new Date() ? 'bg-destructive/10' : ''}>
                        <TableCell className="font-medium">{record.employee_name}</TableCell>
                        <TableCell>{record.training_name}</TableCell>
                        <TableCell>{record.completion_date}</TableCell>
                        <TableCell>{record.expiry_date || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                          {/* Add view/delete buttons */}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum registro de treinamento encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Cursos */}
        <TabsContent value="cursos">
          <Card>
            <CardHeader>
              <CardTitle>Cursos de Treinamento</CardTitle>
              <CardDescription>Lista de cursos disponíveis e suas configurações.</CardDescription>
               <Input placeholder="Buscar por nome do curso ou fornecedor..." className="mt-2" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Curso</TableHead>
                    <TableHead>Periodicidade (Meses)</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.course_name}</TableCell>
                        <TableCell>{course.frequency_months && course.frequency_months > 0 ? course.frequency_months : "N/A"}</TableCell>
                        <TableCell>{course.provider}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                           {/* Add view/delete buttons */}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum curso encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Dialogs */}
      <TrainingCourseDialog open={isCourseDialogOpen} onOpenChange={setCourseDialogOpen} />
      <TrainingRecordDialog open={isRecordDialogOpen} onOpenChange={setRecordDialogOpen} />

    </div>
  );
}
