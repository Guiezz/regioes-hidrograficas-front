import axios from "axios";

// 1. Configuração da instância do axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
});

// --- NOVAS INTERFACES PARA O PLANO FINANCEIRO ---

export interface CustoVariavel {
  descricao: string;
  valorUnitario: number;
}

export interface PeriodoAcao {
  intervalo: string;
  custoFixo: number;
  custosVariaveis: CustoVariavel[];
}

export interface EixoAcao {
  eixo: string;
  valorTotalProjetado: number;
  percentual: number;
  periodos: PeriodoAcao[];
}

export interface ResumoGeral {
  valorTotalPrevisto: number;
  percentual: number;
}

export interface PlanoAcaoResponse {
  resumoGeral: ResumoGeral;
  planoAcao: EixoAcao[];
}

// --- INTERFACES EXISTENTES ---

export interface ActionPlan {
  id: number;
  description: string;
  typology: string;
  source: string;
  budget: number;
  program?: {
    name: string;
    axis: {
      name: string;
    };
  };
  axis?: string;
  timeline: string;
  basin_id: number;
}

export interface ActionsFilters {
  eixo?: string;
  programa?: string;
  tipologia?: string;
}

export interface Basin {
  ID: number;
  Name: string;
}

export interface ReservoirData {
  id: number;
  name: string;
}

/**
 * Funções de Serviço
 */

export const getBasins = async () => {
  const response = await api.get<Basin[]>("/basins");
  return response.data;
};

export const getBasinById = async (id: string) => {
  const response = await api.get<Basin>(`/basins/${id}`);
  return response.data;
};

export async function getActions(basinId = 1, filters?: ActionsFilters) {
  const params: Record<string, string | number> = { basin_id: basinId };

  if (filters?.eixo && filters.eixo !== "todos") params.eixo = filters.eixo;
  if (filters?.programa && filters.programa !== "todos")
    params.programa = filters.programa;
  if (filters?.tipologia && filters.tipologia !== "todos")
    params.tipologia = filters.tipologia;

  const res = await api.get("/actions", { params });
  return res.data.data || res.data || [];
}

export const getReservoirs = async (): Promise<ReservoirData[]> => {
  const response = await api.get<ReservoirData[]>("/basins");
  return response.data;
};

export async function getRadarData(basinId = 1) {
  const res = await api.get("/dashboard/radar", {
    params: { basin_id: basinId },
  });
  return res.data;
}

export async function getConsolidated(basinId = 1) {
  const res = await api.get("/dashboard/consolidated", {
    params: { basin_id: basinId },
  });
  return res.data;
}

export async function getSections(basinId = 1) {
  const res = await api.get("/content", { params: { basin_id: basinId } });
  return res.data;
}

export const getMatriz = async (basinId?: number) => {
  const params = basinId ? { basin_id: basinId } : {};
  const response = await api.get("/financeiro/matriz", { params });
  return response.data?.data || response.data || [];
};

// Custos (Financeiro) - ATUALIZADO PARA O NOVO MODELO
export const getCustos = async (
  basinId?: number,
): Promise<PlanoAcaoResponse> => {
  const response = await api.get<PlanoAcaoResponse>("/financeiro/custos", {
    params: { basin_id: basinId },
  });
  return response.data;
};

export interface KPIItem {
  id: number;
  basin_id: number;
  tab: string;
  view_mode: string;
  value: string;
  unit: string;
  label: string;
  sublabel: string;
  icon: string;
  severity: string;
  order: number;
}

export type KPIResponse = Record<string, Record<string, KPIItem[]>>;

export async function getKpis(basinId = 1) {
  const res = await api.get<KPIResponse>("/kpis", {
    params: { basin_id: basinId },
  });
  return res.data;
}

export default api;
