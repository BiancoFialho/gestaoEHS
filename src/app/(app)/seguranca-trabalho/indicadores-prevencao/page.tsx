
import React from 'react';
import { ListChecks, Search, ClipboardCheck, GraduationCap, CheckSquare, Users, Eye, Percent } from 'lucide-react'; // Using relevant icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"; // For visualizing percentages

// Placeholder function to fetch prevention indicators
async function fetchPreventionIndicators() {
    // Simulate fetching data
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        inspectionsCompleted: 45, // Example for the period
        auditsCompleted: 8, // Example
        trainingsCompleted: 25, // Example
        nonConformitiesDetected: 12, // Example open/detected in period
        actionsImplemented: 35, // Example actions completed from plans
        ppeAdherenceRate: 92, // Example percentage
        ddsParticipationRate: 78, // Example percentage
        behavioralObservations: 150, // Example count
        hazardsControlledRate: 85, // Example percentage
    };
}

export default async function IndicadoresPrevencaoPage() {
    const indicators = await fetchPreventionIndicators();

    return (
        <div>
            <div className="flex items-center gap-2 mb-6">
                <ListChecks className="h-6 w-6 text-foreground" />
                <div>
                    <h1 className="text-2xl font-semibold ">Indicadores de Prevenção (Proativos)</h1>
                    <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Card 1: Nº Inspeções Realizadas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" /> Inspeções Realizadas
                        </CardTitle>
                        <CardDescription>Número de inspeções de segurança completas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.inspectionsCompleted}</div>
                        <p className="text-xs text-muted-foreground mt-2">No último mês</p> {/* Example period */}
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Relatórios</Button>
                    </CardContent>
                </Card>

                 {/* Card 2: Nº Auditorias Completas */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" /> Auditorias Completas
                        </CardTitle>
                        <CardDescription>Número de auditorias (internas/externas) realizadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold">{indicators.auditsCompleted}</div>
                         <p className="text-xs text-muted-foreground mt-2">No último trimestre</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Auditorias</Button>
                    </CardContent>
                </Card>

                 {/* Card 3: Nº Treinamentos Realizados */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" /> Treinamentos Realizados
                        </CardTitle>
                        <CardDescription>Número de sessões de treinamento concluídas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.trainingsCompleted}</div>
                         <p className="text-xs text-muted-foreground mt-2">No último mês</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Registros</Button>
                    </CardContent>
                </Card>

                 {/* Card 4: Nº Não Conformidades Detectadas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-destructive" /> NCs Detectadas
                        </CardTitle>
                        <CardDescription>Não conformidades identificadas (Auditorias/Inspeções).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.nonConformitiesDetected}</div>
                        <p className="text-xs text-muted-foreground mt-2">Abertas no período</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver NCs</Button>
                    </CardContent>
                </Card>

                 {/* Card 5: Nº Ações Implementadas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-green-600" /> Ações Implementadas
                        </CardTitle>
                        <CardDescription>Ações de planos (corretivas/preventivas) concluídas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.actionsImplemented}</div>
                        <p className="text-xs text-muted-foreground mt-2">No último mês</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Plano de Ação</Button>
                    </CardContent>
                </Card>

                {/* Card 6: Adesão EPI */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Percent className="h-5 w-5" /> Adesão EPI (%)
                        </CardTitle>
                        <CardDescription>Percentual de conformidade no uso de EPIs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold mb-2">{indicators.ppeAdherenceRate}%</div>
                         <Progress value={indicators.ppeAdherenceRate} className="w-full h-2" />
                         <p className="text-xs text-muted-foreground mt-2">Baseado em observações/auditorias</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Detalhes</Button>
                    </CardContent>
                </Card>

                {/* Card 7: Participação DDS */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" /> Participação DDS (%)
                        </CardTitle>
                        <CardDescription>Percentual de participação nos Diálogos de Segurança.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold mb-2">{indicators.ddsParticipationRate}%</div>
                          <Progress value={indicators.ddsParticipationRate} className="w-full h-2" />
                         <p className="text-xs text-muted-foreground mt-2">Média mensal</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Registros</Button>
                    </CardContent>
                </Card>

                {/* Card 8: Observações Comportamentais */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" /> Obs. Comportamentais
                        </CardTitle>
                        <CardDescription>Número de observações de comportamento registradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.behavioralObservations}</div>
                        <p className="text-xs text-muted-foreground mt-2">No último mês</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Observações</Button>
                    </CardContent>
                </Card>

                 {/* Card 9: Perigos Controlados (%) */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Percent className="h-5 w-5" /> Perigos Controlados (%)
                        </CardTitle>
                        <CardDescription>Percentual de perigos identificados que foram eliminados/controlados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold mb-2">{indicators.hazardsControlledRate}%</div>
                          <Progress value={indicators.hazardsControlledRate} className="w-full h-2" />
                         <p className="text-xs text-muted-foreground mt-2">Status atual</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Análise de Riscos</Button>
                    </CardContent>
                </Card>

            </div>

             {/* TODO: Add specific charts, tables, and data visualizations */}
             {/* - Filters for period, location, department */}
             {/* - Comparison with targets */}
        </div>
    );
}