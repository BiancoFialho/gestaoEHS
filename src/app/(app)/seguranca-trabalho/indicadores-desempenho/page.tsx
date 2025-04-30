
import React from 'react';
import { BarChartBig, TrendingDown, AlertTriangle, Thermometer, CalendarX, DollarSign } from 'lucide-react'; // Using relevant icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import TfChart from '@/components/charts/TfChart'; // Import the new chart component
import TgChart from '@/components/charts/TgChart'; // Import the TG chart component (assuming it exists or will be created)

// Placeholder function to fetch performance indicators
async function fetchPerformanceIndicators() {
    // Simulate fetching data
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        accidentsWithLostTime: 2, // Example for the period
        accidentsWithoutLostTime: 5, // Example
        frequencyRate: 4.5, // Example TF
        severityRate: 80.2, // Example TG
        lostDays: 35, // Example
        fatalities: 0, // Example
        incidenceRate: 1.5, // Example TI %
        accidentCost: 25000.00, // Example R$
        // Sample data for charts
        tfTrendData: [
            { period: "Jan/24", TF: 5.1 },
            { period: "Fev/24", TF: 4.8 },
            { period: "Mar/24", TF: 5.5 },
            { period: "Abr/24", TF: 4.2 },
            { period: "Mai/24", TF: 4.0 },
            { period: "Jun/24", TF: 4.5 },
            { period: "Jul/24", TF: 3.8 },
            { period: "Ago/24", TF: 4.1 },
        ],
        tgTrendData: [ // Sample TG data
            { period: "Jan/24", TG: 90.5 },
            { period: "Fev/24", TG: 85.1 },
            { period: "Mar/24", TG: 110.0 },
            { period: "Abr/24", TG: 70.3 },
            { period: "Mai/24", TG: 65.8 },
            { period: "Jun/24", TG: 80.2 },
            { period: "Jul/24", TG: 55.0 },
            { period: "Ago/24", TG: 68.9 },
        ]
    };
}


export default async function IndicadoresDesempenhoPage() {
    const indicators = await fetchPerformanceIndicators();

    return (
        <div>
            <div className="flex items-center gap-2 mb-6">
                <BarChartBig className="h-6 w-6 text-foreground" />
                <div>
                    <h1 className="text-2xl font-semibold ">Indicadores de Desempenho (Reativos)</h1>
                    <p className="text-sm text-muted-foreground">Segurança do Trabalho</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Nº Acidentes c/ Afastamento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" /> Acidentes c/ Afastamento
                        </CardTitle>
                        <CardDescription>Número de acidentes que resultaram em afastamento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.accidentsWithLostTime}</div>
                        <p className="text-xs text-muted-foreground mt-2">No último trimestre</p> {/* Example period */}
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Incidentes</Button>
                    </CardContent>
                </Card>

                 {/* Card 2: Nº Acidentes s/ Afastamento */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" /> Acidentes s/ Afastamento
                        </CardTitle>
                        <CardDescription>Número de acidentes sem afastamento do trabalho.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold">{indicators.accidentsWithoutLostTime}</div>
                         <p className="text-xs text-muted-foreground mt-2">No último trimestre</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Incidentes</Button>
                    </CardContent>
                </Card>

                {/* Card 3: Taxa de Frequência (TF) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" /> Taxa de Frequência (TF)
                        </CardTitle>
                        <CardDescription>Nº acid. c/ afast. por milhão de horas trabalhadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.frequencyRate.toFixed(2)}</div>
                         <p className="text-xs text-muted-foreground mt-2">Acumulado Anual</p>
                         <Button variant="link" size="sm" className="mt-2 px-0">Ver Cálculo</Button>
                    </CardContent>
                </Card>

                {/* Card 4: Taxa de Gravidade (TG) */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Thermometer className="h-5 w-5" /> Taxa de Gravidade (TG)
                        </CardTitle>
                        <CardDescription>Nº dias perdidos por milhão de horas trabalhadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.severityRate.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-2">Acumulado Anual</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Cálculo</Button>
                    </CardContent>
                </Card>

                 {/* Card 5: Dias Perdidos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarX className="h-5 w-5" /> Dias Perdidos
                        </CardTitle>
                        <CardDescription>Total de dias de trabalho perdidos por acidentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.lostDays}</div>
                        <p className="text-xs text-muted-foreground mt-2">Acumulado Anual</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Incidentes</Button>
                    </CardContent>
                </Card>

                 {/* Card 6: Fatalidades */}
                <Card className={indicators.fatalities > 0 ? "border-destructive bg-destructive/10" : ""}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" /> Fatalidades
                        </CardTitle>
                        <CardDescription>Número de acidentes fatais.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${indicators.fatalities > 0 ? 'text-destructive' : ''}`}>{indicators.fatalities}</div>
                        <p className="text-xs text-muted-foreground mt-2">Acumulado Anual</p>
                         {indicators.fatalities > 0 && <Button variant="link" size="sm" className="mt-2 px-0 text-destructive">Ver Incidentes</Button>}
                    </CardContent>
                </Card>

                {/* Card 7: Taxa de Incidência (TI) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChartBig className="h-5 w-5" /> Taxa de Incidência (TI)
                        </CardTitle>
                        <CardDescription>Nº acidentes por 100 empregados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.incidenceRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-2">Acumulado Anual</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Cálculo</Button>
                    </CardContent>
                </Card>

                {/* Card 8: Custo dos Acidentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" /> Custo Acidentes
                        </CardTitle>
                        <CardDescription>Custo total estimado dos acidentes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{indicators.accidentCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <p className="text-xs text-muted-foreground mt-2">Acumulado Anual</p>
                        <Button variant="link" size="sm" className="mt-2 px-0">Ver Detalhes</Button>
                    </CardContent>
                </Card>


            </div>

             {/* Charts Section */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Evolução Taxa de Frequência (TF)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {/* Render the TfChart component, passing the data */}
                        <TfChart data={indicators.tfTrendData} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Evolução Taxa de Gravidade (TG)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                         {/* Render the TgChart component, passing the data */}
                         <TgChart data={indicators.tgTrendData} />
                    </CardContent>
                </Card>
            </div>

            {/* TODO: Add filters for period, location, department */}
        </div>
    );
}
