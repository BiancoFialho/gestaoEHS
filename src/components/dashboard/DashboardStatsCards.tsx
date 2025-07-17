
"use client";

import React from 'react';
import Link from 'next/link';
import { Users, ClipboardList, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  employeeCount: number;
  jsaCount: number;
  trainingCount: number;
}

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats }) => {
  const statsList = [
    {
      title: "Colaboradores Ativos",
      value: stats.employeeCount,
      icon: Users,
      href: "/geral/cadastros",
      color: "text-blue-500",
    },
    {
      title: "JSAs Cadastradas",
      value: stats.jsaCount,
      icon: ClipboardList,
      href: "/seguranca-trabalho/inventario-jsa",
      color: "text-orange-500",
    },
    {
      title: "Cursos de Treinamento",
      value: stats.trainingCount,
      icon: GraduationCap,
      href: "/geral/treinamentos",
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statsList.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <Link href={stat.href} className="text-xs text-muted-foreground hover:underline">
              Ver detalhes
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStatsCards;
