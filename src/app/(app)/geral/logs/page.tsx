
import React from 'react';
import { FileText as FileTextIcon, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button'; // For potential filtering actions

// Placeholder function to fetch logs (replace with actual data fetching)
async function fetchLogs() {
  // Simulate fetching data
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, timestamp: "2024-08-24 10:30:15", user: "admin", action: "CREATE_RISK", details: "Novo risco 'Queda de altura' adicionado para Local 'Fábrica'." },
    { id: 2, timestamp: "2024-08-24 09:15:00", user: "user_A", action: "UPDATE_INCIDENT", details: "Incidente ID 12 atualizado: Status alterado para 'Em Investigação'." },
    { id: 3, timestamp: "2024-08-23 16:45:22", user: "admin", action: "LOGIN_SUCCESS", details: "Login bem-sucedido do IP 192.168.1.10." },
    { id: 4, timestamp: "2024-08-23 14:05:10", user: "manager_B", action: "APPROVE_PERMIT", details: "Permissão de Trabalho ID 5 (Trabalho a Quente) aprovada." },
    { id: 5, timestamp: "2024-08-22 11:00:30", user: "user_C", action: "UPLOAD_DOCUMENT", details: "Documento 'Procedimento de Bloqueio' (v1.1) carregado." },
  ];
}


export default async function LogsPage() {
  const logs = await fetchLogs();

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-6">
         <div className="flex items-center gap-2">
            <FileTextIcon className="h-6 w-6 text-foreground" />
            <div>
              <h1 className="text-2xl font-semibold ">Logs de Atividades</h1>
              <p className="text-sm text-muted-foreground">Geral</p>
            </div>
         </div>
         {/* Potential Filter Button */}
         <Button variant="outline" size="sm">
             <Filter className="mr-2 h-4 w-4" /> Filtrar Logs
         </Button>
      </div>

       {/* Search Input */}
       <div className="mb-4">
           <Input placeholder="Buscar por usuário, ação ou detalhes..." />
       </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
          <CardDescription>Logs de atividades realizadas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                       <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{log.action}</span>
                    </TableCell>
                    <TableCell className="text-sm">{log.details}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum log encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* TODO: Add pagination if logs list is long */}
        </CardContent>
      </Card>
    </div>
  );
}