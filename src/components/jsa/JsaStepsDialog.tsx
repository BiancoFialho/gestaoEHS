
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListChecks } from 'lucide-react';
import type { JsaStep } from '@/actions/dataFetchingActions';

interface JsaStepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  steps: JsaStep[];
}

const JsaStepsDialog: React.FC<JsaStepsDialogProps> = ({ open, onOpenChange, taskName, steps }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5" /> Etapas da JSA: {taskName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
          <div className="py-4 pr-2">
            {steps.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%] text-center">#</TableHead>
                    <TableHead className="w-[30%]">Descrição da Etapa</TableHead>
                    <TableHead className="w-[30%]">Perigos Identificados</TableHead>
                    <TableHead className="w-[35%]">Medidas de Controle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.map((step) => (
                    <TableRow key={step.id}>
                      <TableCell className="text-center font-medium">{step.step_order}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{step.description}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{step.hazards}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{step.controls}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Nenhuma etapa foi registrada para esta JSA no banco de dados.
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsaStepsDialog;
