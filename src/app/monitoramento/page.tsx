"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { getActions } from "@/services/api";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataState } from "@/components/data-state";
import axios from "axios";
import { SelectRegionPrompt } from "@/components/layout/SelectRegionPrompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
  Target,
  LayoutList,
} from "lucide-react";

interface Measurement {
  id?: number;
  measured_at?: string;
  execution_perc?: number;
  iea_relativo?: number;
}
interface ActionItem {
  id: number;
  axis_name?: string;
  description?: string;
  typology?: string;
  start_year: number;
  end_year: number;
  measurements?: Measurement[];
}
interface FiltersData {
  eixos: string[];
  tipologias: string[];
}

const PRAZOS = {
  curto: { inicio: 2024, fim: 2033 },
  medio: { inicio: 2034, fim: 2043 },
  longo: { inicio: 2044, fim: 2053 },
};

const intersects = (
  start: number,
  end: number,
  rangeStart: number,
  rangeEnd: number,
) => {
  return end >= rangeStart && start <= rangeEnd;
};

export default function MonitoramentoPage() {
  const { selectedReservoir } = useReservoir();

  const [filtersData, setFiltersData] = useState<FiltersData>({
    eixos: [],
    tipologias: [],
  });

  const regionId = selectedReservoir?.id;

  // Filtros e página; zerados ao trocar de região (ajuste durante a renderização)
  const [view, setView] = useState({
    regionId,
    eixo: "todos",
    tipo: "todos",
    crono: "todos",
    page: 1,
  });
  if (view.regionId !== regionId) {
    setView({ regionId, eixo: "todos", tipo: "todos", crono: "todos", page: 1 });
  }
  const selectedEixo = view.eixo;
  const selectedTipo = view.tipo;
  const selectedCrono = view.crono;
  const setSelectedEixo = (eixo: string) =>
    setView((v) => ({ ...v, eixo, page: 1 }));
  const setSelectedTipo = (tipo: string) =>
    setView((v) => ({ ...v, tipo, page: 1 }));
  const setSelectedCrono = (crono: string) =>
    setView((v) => ({ ...v, crono, page: 1 }));
  const setCurrentPage = (fn: (prev: number) => number) =>
    setView((v) => ({ ...v, page: fn(v.page) }));
  const itemsPerPage = 7;

  useEffect(() => {
    if (!regionId) return;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    let cancelled = false;
    axios
      .get(`${baseUrl}/actions/filters?basin_id=${regionId}`)
      .then((res) => {
        if (!cancelled) setFiltersData(res.data);
      })
      .catch((error) => {
        console.error("Erro ao carregar filtros:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [regionId]);

  const {
    data: actionsData,
    status,
    retry,
  } = useAsyncData<ActionItem[]>(
    regionId
      ? async () => {
          const res = await getActions(regionId, {
            eixo: selectedEixo === "todos" ? "" : selectedEixo,
            tipologia: selectedTipo === "todos" ? "" : selectedTipo,
          });
          const rawList: ActionItem[] = Array.isArray(res) ? res : (res as { data?: ActionItem[] })?.data || [];
          return rawList.filter((item: ActionItem) => {
            if (selectedCrono === "todos") return true;
            const start = item.start_year || 0;
            const end = item.end_year || start;
            const range =
              selectedCrono === "Curto Prazo"
                ? PRAZOS.curto
                : selectedCrono === "Médio Prazo"
                  ? PRAZOS.medio
                  : selectedCrono === "Longo Prazo"
                    ? PRAZOS.longo
                    : null;
            return range ? intersects(start, end, range.inicio, range.fim) : true;
          });
        }
      : null,
    [regionId, selectedEixo, selectedTipo, selectedCrono],
  );

  // Região inteira, sem filtros: decide o aviso de "sem medições".
  const { data: allActions, status: allStatus } = useAsyncData<ActionItem[]>(
    regionId
      ? async () => {
          const res = await getActions(regionId);
          return Array.isArray(res) ? res : (res as { data?: ActionItem[] })?.data || [];
        }
      : null,
    [regionId],
  );
  const noMeasurementsYet =
    allStatus === "ready" &&
    !!allActions &&
    !allActions.some((a: ActionItem) => (a.measurements?.length ?? 0) > 0);

  const actions: ActionItem[] = status === "ready" && actionsData ? actionsData : [];

  const hasActiveFilters =
    selectedEixo !== "todos" ||
    selectedTipo !== "todos" ||
    selectedCrono !== "todos";
  const clearFilters = () => {
    setView((v) => ({ ...v, eixo: "todos", tipo: "todos", crono: "todos", page: 1 }));
  };

  const getExecutionStatus = (
    item: ActionItem,
  ): {
    label: "Sem medição registrada" | "Não iniciada" | "Em andamento" | "Concluída";
    perc: number | null;
  } => {
    const last = getLatestMeasurement(item);
    if (!last) return { label: "Sem medição registrada", perc: null };
    const frac = Number(last.execution_perc) || 0;
    const perc = frac * 100;
    if (frac === 0) return { label: "Não iniciada", perc: 0 };
    if (frac >= 1) return { label: "Concluída", perc: 100 };
    return { label: "Em andamento", perc };
  };

  const getLatestMeasurement = (item: ActionItem): Measurement | null => {
    const ms = item.measurements;
    if (!ms || ms.length === 0) return null;
    return ms.reduce((best, m) => {
      const tb = best.measured_at ? Date.parse(best.measured_at) : 0;
      const tm = m.measured_at ? Date.parse(m.measured_at) : 0;
      if (tm !== tb) return tm > tb ? m : best;
      return (m.id ?? 0) > (best.id ?? 0) ? m : best;
    });
  };

  const getLatestIEARel = (item: ActionItem) => {
    const last = getLatestMeasurement(item);
    return last ? last.iea_relativo || 0 : null;
  };

  const formatDecimal = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    if (val > 0 && val < 0.01) return "< 0,01";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getTimelineLabel = (start: number, end: number) => {
    if (!start) return "N/A";
    const labels: string[] = [];
    if (intersects(start, end, PRAZOS.curto.inicio, PRAZOS.curto.fim))
      labels.push("Curto");
    if (intersects(start, end, PRAZOS.medio.inicio, PRAZOS.medio.fim))
      labels.push("Médio");
    if (intersects(start, end, PRAZOS.longo.inicio, PRAZOS.longo.fim))
      labels.push("Longo");
    return labels.join(" / ") + " Prazo";
  };

  const totalPages = Math.ceil(actions.length / itemsPerPage);
  const currentPage = Math.min(Math.max(view.page, 1), totalPages || 1);
  const currentItems = actions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (!selectedReservoir) {
    return <SelectRegionPrompt moduleName="Monitoramento" />;
  }

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
        <header className="mb-16 space-y-8 px-6">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 text-emerald-700 bg-emerald-50/50 px-4 py-1"
          >
            <Activity className="w-3 h-3 mr-2" /> Gestão & Acompanhamento
          </Badge>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div className="space-y-4">
              <h1               className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[0.95]">
                Monitoramento
              </h1>
              <div className="flex items-center gap-2 text-slate-500">
                <Target className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium italic">
                  {selectedReservoir?.name
                    ? `Região Hidrográfica do ${selectedReservoir.name}`
                    : "Carregando..."}
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed text-justify max-w-xs lg:max-w-xl">
              Acompanhamento detalhado da execução dos Planos de Ação,
              permitindo a visualização de índices de desempenho e status
              atualizado das iniciativas estratégicas da região.
            </p>
          </div>
        </header>

        {noMeasurementsYet && (
          <div
            role="note"
            className="mb-6 rounded-xl border border-sky-100 bg-sky-50/60 px-5 py-4 text-sm leading-relaxed text-slate-600"
          >
            O acompanhamento da execução destas ações ainda não começou. As
            ações e prazos abaixo são os previstos no plano; o status de cada
            uma aparecerá aqui quando as medições forem registradas.
          </div>
        )}

        {/* Filtros */}
        <section className="mb-8 p-4 md:p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-end">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">
                <LayoutList className="w-3 h-3 inline mr-1 mb-0.5" />
                Eixo Estratégico
              </label>
              <Select
                value={selectedEixo}
                onValueChange={(v) => {
                  setSelectedEixo(v);
                }}
              >
                <SelectTrigger className="bg-white w-full border-emerald-100 focus:ring-emerald-200 h-10">
                  <SelectValue placeholder="Selecione o Eixo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Eixos</SelectItem>
                  {filtersData.eixos?.map((opt: string) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">
                Cronograma
              </label>
              <Select
                value={selectedCrono}
                onValueChange={(v) => {
                  setSelectedCrono(v);
                }}
              >
                <SelectTrigger className="bg-white w-full border-emerald-100 focus:ring-emerald-200 h-10">
                  <SelectValue placeholder="Selecione o Prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Prazos</SelectItem>
                  <SelectItem value="Curto Prazo">Curto (até 2033)</SelectItem>
                  <SelectItem value="Médio Prazo">Médio (2034-2043)</SelectItem>
                  <SelectItem value="Longo Prazo">Longo (pós 2043)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-1">
                Tipologia da Ação
              </label>
              <Select
                value={selectedTipo}
                onValueChange={(v) => {
                  setSelectedTipo(v);
                }}
              >
                <SelectTrigger className="bg-white w-full border-emerald-100 focus:ring-emerald-200 h-10">
                  <SelectValue placeholder="Selecione a Tipologia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Tipologias</SelectItem>
                  {filtersData.tipologias?.map((opt: string) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-dashed border-slate-300 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 h-10 uppercase text-xs font-bold tracking-widest"
            >
              <X className="w-3 h-3 mr-2" /> Limpar Filtros
            </Button>
          </div>
        </section>

        {/* Tabela com scroll responsivo */}
        {status === "loading" || status === "idle" ? (
          <div className="mb-16"><DataState status="loading" /></div>
        ) : status === "error" ? (
          <div className="mb-16"><DataState status="error" onRetry={retry} /></div>
        ) : actions.length === 0 ? (
          <div className="mb-16"><DataState status="empty" onClearFilters={hasActiveFilters ? clearFilters : undefined} /></div>
        ) : (
        <div className="rounded-xl border border-slate-200 shadow-xl shadow-slate-200/20 bg-white flex flex-col w-full max-w-[calc(100vw-3rem)] md:max-w-full overflow-hidden mb-16">
          <div className="overflow-x-auto overflow-y-auto max-h-120 w-full">
            <Table className="w-full table-fixed min-w-230">
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
                <TableRow className="border-slate-100">
                  <TableHead className="w-[30%] py-4 px-5 text-xs font-black uppercase text-slate-500 tracking-widest">
                    Ação Estratégica / Descrição
                  </TableHead>
                  <TableHead className="w-[16%] py-4 px-3 text-xs font-black uppercase text-slate-500 tracking-widest">
                    Classificação
                  </TableHead>
                  <TableHead className="w-[16%] py-4 px-3 text-xs font-black uppercase text-slate-500 tracking-widest text-center">
                    Prazo
                  </TableHead>
                  <TableHead className="w-[10%] py-4 px-2 text-xs font-black uppercase text-emerald-600 tracking-widest text-center">
                    IEA Rel.
                  </TableHead>
                  <TableHead className="w-[28%] py-4 px-5 text-xs font-black uppercase text-slate-500 tracking-widest text-right">
                    Status Execução
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => {
                    const exec = getExecutionStatus(item);
                    const ieaRel = exec.perc === null ? null : getLatestIEARel(item);
                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors border-slate-100"
                      >
                        <TableCell className="px-5 py-5 align-top whitespace-normal">
                          <div className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2 wrap-break-word hyphens-auto">
                            {item.axis_name}
                          </div>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed text-justify whitespace-normal wrap-break-word hyphens-auto">
                            {item.description}
                          </p>
                        </TableCell>

                        <TableCell className="px-3 py-5 align-top">
                          <Badge
                            variant="outline"
                            className="font-bold text-xs border-slate-200 bg-slate-50 text-slate-600 whitespace-normal text-center wrap-break-word hyphens-auto"
                          >
                            {item.typology}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-3 py-5 align-top text-center whitespace-normal">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-black uppercase text-slate-500">
                              {getTimelineLabel(item.start_year, item.end_year)}
                            </span>
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                              {item.start_year} - {item.end_year}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-2 py-5 align-top text-center">
                          {ieaRel !== null ? (
                            <div className="inline-flex items-center justify-center min-w-12 py-1 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-sm border border-emerald-100 shadow-sm">
                              {formatDecimal(ieaRel)}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-5 align-top text-right whitespace-normal">
                          {exec.label === "Em andamento" ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                                Em andamento
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.round(exec.perc ?? 0)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-500">
                                  {Math.round(exec.perc ?? 0)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span
                              className={`text-xs uppercase font-bold tracking-wider ${
                                exec.label === "Concluída"
                                  ? "text-emerald-600"
                                  : exec.label === "Não iniciada"
                                    ? "text-slate-500"
                                    : "text-slate-500"
                              }`}
                            >
                              {exec.label}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-slate-500 italic bg-slate-50/30"
                    >
                      Nenhuma ação encontrada para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">
              Pág. {currentPage} / {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        )}
        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
        </footer>
      </div>
    </div>
  );
}
