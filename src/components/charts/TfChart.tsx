
"use client";

import React from 'react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// --- Types for the chart data ---
interface TfDataPoint {
  period: string; // e.g., "Jan/24", "2024"
  TF: number;
}

interface TfChartProps {
  data: TfDataPoint[];
}

// --- Chart Configuration ---
const tfChartConfig = {
  TF: {
    label: "Taxa Frequência",
    color: "hsl(var(--chart-1))", // Example: Use chart color 1 (Red)
  },
} satisfies ChartConfig;

export default function TfChart({ data }: TfChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Sem dados disponíveis</div>;
  }

  return (
    <ChartContainer config={tfChartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }} // Adjusted margins
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            // Consider angle if labels overlap: angle={-35} textAnchor="end"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            // Optional: domain={['auto', 'auto']} or specify min/max
          />
          <ChartTooltip
            cursor={true} // Show cursor line
            content={<ChartTooltipContent hideLabel={false} />} // Show label in tooltip
          />
          <ReLegend content={<ChartLegendContent />} verticalAlign="top" height={36}/>
          <Line
            dataKey="TF"
            type="monotone"
            stroke="var(--color-TF)"
            strokeWidth={2}
            dot={true} // Show dots on data points
            activeDot={{ r: 6 }} // Highlight active dot
          />
        </ReLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
