"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, BarChart3, Layers } from "lucide-react";

export interface ConsolidatedData {
  indice_global: number;
  iea_max: number;
  indice_atual: number;
  total_actions: number;
}

export function ConsolidatedCards({ data }: { data: ConsolidatedData | null }) {
  if (!data) return null; // Ou um Skeleton loading

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Índice Global</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(data.indice_global * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Desempenho geral da bacia
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_actions}</div>
          <p className="text-xs text-muted-foreground">Ações monitoradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Potencial (IEA Max)
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.iea_max.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Soma total dos pesos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Execução Atual</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.indice_atual.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground">Pontos realizados</p>
        </CardContent>
      </Card>
    </div>
  );
}
