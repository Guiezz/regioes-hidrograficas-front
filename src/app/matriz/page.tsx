"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataState } from "@/components/data-state";
import { useReservoir } from "@/context/ReservoirContext";
import { getMatriz } from "@/services/api";
import { SelectRegionPrompt } from "@/components/layout/SelectRegionPrompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ClipboardList,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 5;

interface MatrizItem {
  id: number | string;
  tipo_matriz?: string;
  programa?: string;
  acoes_especificas?: string;
  instituicoes_envolvidas?: string;
  prioridade?: string;
}

export default function MatrizPage() {
  const { selectedReservoir } = useReservoir();

  const regionId = selectedReservoir?.id;
  const {
    data: rawData,
    status,
    retry,
  } = useAsyncData<MatrizItem[]>(regionId ? () => getMatriz(regionId) : null, [
    regionId,
  ]);
  const data = useMemo<MatrizItem[]>(
    () => (status === "ready" ? (rawData ?? []) : []),
    [status, rawData],
  );

  // Filtros e página; zerados ao trocar de região (ajuste durante a renderização)
  const [view, setView] = useState({
    regionId,
    tipo: "all",
    programa: "all",
    page: 1,
  });
  if (view.regionId !== regionId) {
    setView({ regionId, tipo: "all", programa: "all", page: 1 });
  }
  const filterTipo = view.tipo;
  const filterPrograma = view.programa;
  const currentPage = view.page;
  const setFilterTipo = (tipo: string) =>
    setView((v) => ({ ...v, tipo, page: 1 }));
  const setFilterPrograma = (programa: string) =>
    setView((v) => ({ ...v, programa, page: 1 }));
  const setCurrentPage = (fn: (prev: number) => number) =>
    setView((v) => ({ ...v, page: fn(v.page) }));

  const tiposMatriz = useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.tipo_matriz))).filter(
        (t): t is string => typeof t === "string" && t.trim() !== "",
      ),
    [data],
  );

  const programas = useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.programa))).filter(
        (p): p is string => typeof p === "string" && p.trim() !== "",
      ),
    [data],
  );

  const filteredData = data.filter((item) => {
    const matchTipo = filterTipo === "all" || item.tipo_matriz === filterTipo;
    const matchProg =
      filterPrograma === "all" || item.programa === filterPrograma;
    return matchTipo && matchProg;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getPriorityBadge = (priority?: string) => {
    const p = (priority ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (p.includes("alta"))
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Alta
        </Badge>
      );
    if (p.includes("med"))
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
          Média
        </Badge>
      );
    if (p.includes("baix"))
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Baixa
        </Badge>
      );
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
        Não informada
      </Badge>
    );
  };

  const clearFilters = () => {
    setFilterTipo("all");
    setFilterPrograma("all");
  };

  if (!selectedReservoir) {
    return <SelectRegionPrompt moduleName="Matriz de Ação" />;
  }

  const filtersActive = filterTipo !== "all" || filterPrograma !== "all";
  const dataStatus =
    status === "ready"
      ? data.length === 0
        ? "unavailable"
        : filteredData.length === 0 && filtersActive
          ? "empty"
          : "ready"
      : status === "error"
        ? "error"
        : "loading";

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
        {/* Header Editorial */}
        <header className="mb-16 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-sky-600">
              Planejamento Estratégico
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              Matriz de Ações
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm tracking-wide">
                {/* 5. Nome dinâmico */}
                {selectedReservoir?.name
                  ? `Região Hidrográfica do ${selectedReservoir.name}`
                  : "Carregando..."}
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed text-justify max-w-xs lg:max-w-xl">
            A matriz de ações define as prioridades operacionais para a gestão
            dos recursos hídricos, vinculando programas a ações específicas e
            seus responsáveis.
          </p>
        </header>

        {/* Filtros */}
        {dataStatus !== "unavailable" && (
          <section className="mb-12 mx-4 md:mx-0 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100 w-[calc(100%-2rem)] md:w-full items-end">
            {/* Filtro Tipo de Matriz */}
            <div className="space-y-2 w-full overflow-hidden">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Eixo
              </label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                {/* O [&>span]:truncate garante que o texto interno receba os "..." em vez de esticar o botão */}
                <SelectTrigger className="bg-white border-slate-200 w-full h-10 [&>span]:truncate">
                  <SelectValue placeholder="Selecione o eixo" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-100">
                  <SelectItem value="all">Todos os Eixos</SelectItem>
                  {tiposMatriz.map((tipo) => (
                    <SelectItem key={tipo} value={tipo} className="truncate">
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Programa */}
            <div className="space-y-2 w-full overflow-hidden">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ClipboardList className="w-3 h-3" /> Programa
              </label>
              <Select value={filterPrograma} onValueChange={setFilterPrograma}>
                <SelectTrigger className="bg-white border-slate-200 w-full h-10 [&>span]:truncate">
                  <SelectValue placeholder="Selecione o programa" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-100">
                  <SelectItem value="all">Todos os Programas</SelectItem>
                  {programas.map((prog) => (
                    <SelectItem key={prog} value={prog} className="truncate">
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão de Limpar Filtros */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 h-10 uppercase text-xs font-bold tracking-widest mt-2 lg:mt-0"
            >
              <X className="w-3 h-3 mr-2" /> Limpar Filtros
            </Button>
          </section>
        )}

        {/* Tabela com scroll responsivo travado na largura da tela */}
        <DataState
          status={dataStatus}
          onRetry={retry}
          onClearFilters={clearFilters}
          regionName={selectedReservoir.name}
          unavailableReason="A Matriz de Ação desta região ainda está sendo incorporada ao sistema a partir do plano oficial."
        >
          {/* @container: tabela só quando a área tem 672px (@2xl); abaixo, cards */}
          <div className="@container w-full mb-6">
          <div className="rounded-2xl border border-slate-200 shadow-sm bg-white flex flex-col w-full">
            {/* Cards (área estreita) */}
            <ul className="divide-y divide-slate-100 @2xl:hidden">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <li key={item.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[15px] font-semibold text-slate-800 leading-snug wrap-break-word hyphens-auto">
                        {item.acoes_especificas}
                      </p>
                      <div className="shrink-0">{getPriorityBadge(item.prioridade)}</div>
                    </div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider wrap-break-word">
                      {item.programa}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed wrap-break-word hyphens-auto">
                      {item.instituicoes_envolvidas}
                    </p>
                  </li>
                ))
              ) : (
                <li className="h-40 flex items-center justify-center text-center text-slate-500 italic">
                  Nenhuma ação encontrada.
                </li>
              )}
            </ul>

            {/* Tabela (área larga) */}
            <div className="hidden @2xl:block overflow-y-auto max-h-120 w-full">
              <Table className="w-full table-fixed">
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
                  <TableRow className="border-slate-200">
                    <TableHead className="w-[45%] py-4 px-5 text-xs font-black uppercase text-slate-500 tracking-widest">
                      Ação Específica
                    </TableHead>
                    <TableHead className="w-[35%] py-4 px-5 text-xs font-black uppercase text-slate-500 tracking-widest">
                      Responsáveis
                    </TableHead>
                    <TableHead className="w-[20%] py-4 px-5 text-xs font-black uppercase text-slate-500 tracking-widest text-center">
                      Prioridade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-blue-50/30 border-slate-100"
                      >
                        <TableCell className="px-5 py-5 align-top">
                          <div className="space-y-1">
                            <p className="text-[15px] font-semibold text-slate-800 leading-snug whitespace-normal wrap-break-word hyphens-auto">
                              {item.acoes_especificas}
                            </p>
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider whitespace-normal wrap-break-word">
                              {item.programa}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-5 align-top">
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-normal wrap-break-word hyphens-auto">
                            {item.instituicoes_envolvidas}
                          </p>
                        </TableCell>
                        <TableCell className="px-5 py-5 align-top text-center">
                          {getPriorityBadge(item.prioridade)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-40 text-center text-slate-500 italic"
                      >
                        Nenhuma ação encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-slate-500">
                Página <span className="font-medium">{currentPage}</span> de{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </DataState>

        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
        </footer>
      </div>
    </div>
  );
}
