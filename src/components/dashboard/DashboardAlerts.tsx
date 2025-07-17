
"use client";

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, CalendarClock, GraduationCap, Folder } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ExpiringDocument {
  id: number;
  title: string;
  review_date: string; // YYYY-MM-DD
}

interface ExpiringTraining {
  id: number;
  employee_name: string;
  course_name: string;
  expiry_date: string; // YYYY-MM-DD
}

interface DashboardAlertsProps {
  expiringDocuments: ExpiringDocument[];
  expiringTrainings: ExpiringTraining[];
}

const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ expiringDocuments, expiringTrainings }) => {
  const today = new Date();

  const calculateDaysRemaining = (dateStr: string) => {
    const diffTime = new Date(dateStr + 'T00:00:00').getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" /> Alertas
        </CardTitle>
        <CardDescription>Itens que exigem atenção nos próximos 30 dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {/* Alertas de Treinamentos */}
            <div>
              <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Treinamentos Vencendo
              </h4>
              {expiringTrainings.length > 0 ? (
                expiringTrainings.map((training, index) => (
                  <React.Fragment key={training.id}>
                    <div className="flex items-start justify-between text-sm">
                      <div className="flex-1 truncate pr-4">
                        <p className="font-medium truncate">{training.course_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{training.employee_name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-destructive">
                        <CalendarClock className="h-4 w-4" />
                        <span>{format(new Date(training.expiry_date + 'T00:00:00'), 'dd/MM/yy')}</span>
                      </div>
                    </div>
                    {index < expiringTrainings.length - 1 && <Separator className="my-2" />}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">Nenhum treinamento vencendo.</p>
              )}
            </div>

            <Separator />

            {/* Alertas de Documentos */}
            <div>
                <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Documentos a Revisar
                </h4>
                 {expiringDocuments.length > 0 ? (
                expiringDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <div className="flex items-start justify-between text-sm">
                      <div className="flex-1 truncate pr-4">
                        <p className="font-medium truncate">{doc.title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-600">
                        <CalendarClock className="h-4 w-4" />
                        <span>{format(new Date(doc.review_date + 'T00:00:00'), 'dd/MM/yy')}</span>
                      </div>
                    </div>
                    {index < expiringDocuments.length - 1 && <Separator className="my-2" />}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">Nenhum documento a ser revisado.</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default DashboardAlerts;
