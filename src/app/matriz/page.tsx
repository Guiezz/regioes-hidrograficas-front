"use client";

import { useEffect, useState, useMemo } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { getMatriz } from "@/services/api";
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
  Loader2,
  MapPin,
  ClipboardList,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function MatrizPage() {
  const { selectedReservoir } = useReservoir();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterPrograma, setFilterPrograma] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;

      setLoading(true);
      try {
        const res = await getMatriz(selectedReservoir.id);
        setData(res || []);
      } catch (error) {
        console.error("Erro ao carregar matriz:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedReservoir]);

  // Resetar página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTipo, filterPrograma]);

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

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase() || "";
    if (p.includes("alta"))
      return <Badge className="bg-red-500 hover:bg-red-600">Alta</Badge>;
    if (p.includes("méd") || p.includes("med"))
      return <Badge className="bg-amber-500 hover:bg-amber-600">Média</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600">Baixa</Badge>;
  };

  const clearFilters = () => {
    setFilterTipo("all");
    setFilterPrograma("all");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase italic">
            Carregando Matriz de Ações
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
        {/* Header Editorial */}
        <header className="mb-16 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">
              Planejamento Estratégico
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              Matriz de Ações
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
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
        <section className="mb-12 mx-4 md:mx-0 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100 w-[calc(100%-2rem)] md:w-full items-end">
          {/* Filtro Tipo de Matriz */}
          <div className="space-y-2 w-full overflow-hidden">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Filter className="w-3 h-3" /> Tipo de Matriz
            </label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              {/* O [&>span]:truncate garante que o texto interno receba os "..." em vez de esticar o botão */}
              <SelectTrigger className="bg-white border-slate-200 w-full h-10 [&>span]:truncate">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-100">
                <SelectItem value="all">Todos os Tipos</SelectItem>
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
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
            className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 h-10 uppercase text-[10px] font-bold tracking-widest mt-2 lg:mt-0"
          >
            <X className="w-3 h-3 mr-2" /> Limpar Filtros
          </Button>
        </section>

        {/* Tabela com scroll responsivo travado na largura da tela */}
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white flex flex-col w-full max-w-[calc(100vw-2rem)] md:max-w-full overflow-hidden mb-6">
          <div className="overflow-x-auto overflow-y-auto max-h-120 w-full">
            <Table className="w-full table-fixed min-w-225">
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
                <TableRow className="border-slate-200">
                  <TableHead className="w-[45%] py-4 px-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Ação Específica
                  </TableHead>
                  <TableHead className="w-[35%] py-4 px-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Responsáveis
                  </TableHead>
                  <TableHead className="w-[20%] py-4 px-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
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
                          <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wider whitespace-normal wrap-break-word">
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
                      className="h-40 text-center text-slate-400 italic"
                    >
                      Nenhuma ação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
        </footer>
      </div>
    </div>
  );
}
