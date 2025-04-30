
"use client";

import React from 'react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// --- Types for the chart data ---
interface TgDataPoint {
  period: string; // e.g., "Jan/24", "2024"
  TG: number;
}

interface TgChartProps {
  data: TgDataPoint[];
}

// --- Chart Configuration ---
const tgChartConfig = {
  TG: {
    label: "Taxa Gravidade",
    color: "hsl(var(--chart-2))", // Example: Use chart color 2 (Orange)
  },
} satisfies ChartConfig;

export default function TgChart({ data }: TgChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Sem dados disponíveis</div>;
  }

  return (
    <ChartContainer config={tgChartConfig} className="w-full h-full">
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
            // Consider adding label: label={{ value: 'TG', angle: -90, position: 'insideLeft' }}
          />
          <ChartTooltip
            cursor={true} // Show cursor line
            content={<ChartTooltipContent hideLabel={false} />} // Show label in tooltip
          />
          <ReLegend content={<ChartLegendContent />} verticalAlign="top" height={36}/>
          <Line
            dataKey="TG"
            type="monotone"
            stroke="var(--color-TG)"
            strokeWidth={2}
            dot={true} // Show dots on data points
            activeDot={{ r: 6 }} // Highlight active dot
          />
        </ReLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
