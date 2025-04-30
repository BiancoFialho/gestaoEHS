
import React from 'react';
import { Activity, Trash2, Droplet, Zap, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Example for visualization

// Placeholder function to fetch environmental indicators
async function fetchEnvironmentalIndicators() {
    // Simulate fetching data
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        wasteGenerated: 15.2, // Example tons/month
        recyclingRate: 65, // Example percentage
        hazardousWaste: 1.5, // Example tons/month
        waterConsumption: 1200, // Example m³/month
        energyConsumption: 55000, // Example kWh/month
        ghgEmissions: 25.8, // Example tCO₂e/month
    };
}

export default async function MeioAmbienteIndicadoresPage() {
    const indicators = await fetchEnvironmentalIndicators();

    return (
        <div>
            <div className="flex items-center gap-2 mb-6">
                <Activity className="h-6 w-6 text-foreground" />
                <div>
                    <h1 className="text-2xl font-semibold ">Indicadores</h1>
                    <p className="text-sm text-muted-foreground">Meio Ambiente</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Geração de Resíduos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5" /> Geração de Resíduos
                        </CardTitle>
                        <CardDescription>Total gerado e taxa de reciclagem (mensal).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{indicators.wasteGenerated} t</div>
                        <p className="text-sm text-muted-foreground mb-3">Total Gerado</p>
                        <div className="text-2xl font-bold mb-1">{indicators.recyclingRate}%</div>
                        <Progress value={indicators.recyclingRate} className="w-full h-2 mb-1" />
                        <p className="text-sm text-muted-foreground mb-3">Taxa de Reciclagem</p>
                         <div className="text-lg font-semibold text-destructive">{indicators.hazardousWaste} t</div>
                        <p className="text-sm text-muted-foreground">Resíduos Perigosos</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Detalhes</Button>
                    </CardContent>
                </Card>

                 {/* Card 2: Consumo de Água */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Droplet className="h-5 w-5 text-blue-500" /> Consumo de Água
                        </CardTitle>
                        <CardDescription>Consumo total mensal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold">{indicators.waterConsumption} m³</div>
                         <p className="text-xs text-muted-foreground mt-2">Referente ao último mês</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Histórico</Button>
                    </CardContent>
                </Card>

                 {/* Card 3: Consumo de Energia */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" /> Consumo de Energia
                        </CardTitle>
                        <CardDescription>Consumo total mensal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.energyConsumption.toLocaleString()} kWh</div>
                         <p className="text-xs text-muted-foreground mt-2">Referente ao último mês</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Histórico</Button>
                    </CardContent>
                </Card>

                {/* Card 4: Emissões de GEE */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cloud className="h-5 w-5 text-gray-500" /> Emissões de GEE
                        </CardTitle>
                        <CardDescription>Emissões totais mensais (CO₂e).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.ghgEmissions} tCO₂e</div>
                        <p className="text-xs text-muted-foreground mt-2">Referente ao último mês (Escopos 1 e 2)</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Inventário</Button>
                    </CardContent>
                </Card>

                 {/* Card 5 & 6: Placeholders for other indicators like Spills, Infractions etc. */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" /> Derrames / Vazamentos
                        </CardTitle>
                        <CardDescription>Número de ocorrências no período.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex items-center justify-center h-[100px] text-muted-foreground">
                         {/* Placeholder */}
                        <p>Dados de derrames aqui...</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" /> Autos de Infração
                        </CardTitle>
                        <CardDescription>Número de autos recebidos no período.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex items-center justify-center h-[100px] text-muted-foreground">
                         {/* Placeholder */}
                        <p>Dados de infrações aqui...</p>
                    </CardContent>
                </Card>

            </div>
            {/* TODO: Add specific charts, tables, and data visualizations */}
            {/* - Filters for period, location, waste type etc. */}
            {/* - Comparison with targets/limits */}
        </div>
    );
}