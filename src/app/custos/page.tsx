"use client";

import { useEffect, useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { getCustos, PlanoAcaoResponse } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Info,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";

/* ─── Keyframes injetados via <style> ─────────────────────────────────────── */
const globalStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .anim-fade-up   { animation: fadeUp  0.55s cubic-bezier(.22,.68,0,1.1) both; }
  .anim-fade-in   { animation: fadeIn  0.35s ease both; }
  .anim-line-grow { animation: lineGrow 0.55s cubic-bezier(.22,.68,0,1.1) both; transform-origin: left; }
`;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

/* Barra de progresso proporcional */
function PercentBar({ value }: { value: number }) {
  return (
    <div className="relative h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-400 to-blue-400 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${(value * 100).toFixed(1)}%` }}
      />
    </div>
  );
}

/* Card de KPI reutilizável */
function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "sky",
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: "sky" | "blue" | "slate";
  delay?: number;
}) {
  const styles: Record<string, string> = {
    sky: "border-l-sky-400   bg-gradient-to-br from-sky-50/70  to-white",
    blue: "border-l-blue-500  bg-gradient-to-br from-blue-50/50 to-white",
    slate: "border-l-slate-300 bg-gradient-to-br from-slate-50   to-white",
  };
  return (
    <div
      className={`anim-fade-up rounded-2xl border border-slate-100 border-l-4 ${styles[accent]} p-6
                  shadow-[0_2px_16px_0_rgba(0,0,0,0.04)]
                  hover:shadow-[0_6px_28px_0_rgba(0,0,0,0.09)]
                  transition-shadow duration-300`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
          {label}
        </span>
        <span className="text-slate-200">{icon}</span>
      </div>
      <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none break-words">
        {value}
      </p>
      {sub && (
        <p className="mt-2 text-[11px] text-slate-400 italic leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────────── */
export default function CustosPage() {
  const { selectedReservoir } = useReservoir();
  const [data, setData] = useState<PlanoAcaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEixo, setActiveEixo] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;
      setLoading(true);
      setReady(false);
      try {
        const res = await getCustos(selectedReservoir.id);
        setData(res);
        if (res?.planoAcao?.[0]) setActiveEixo(res.planoAcao[0].eixo);
      } catch (e) {
        console.error("Erro ao carregar custos:", e);
      } finally {
        setLoading(false);
        setTimeout(() => setReady(true), 60);
      }
    }
    fetchData();
  }, [selectedReservoir]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-sky-100 animate-ping opacity-50" />
            <Loader2 className="relative h-7 w-7 animate-spin text-sky-400" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.35em] text-slate-300 uppercase">
            Calculando Investimentos
          </span>
        </div>
      </div>
    );
  }

  if (!data?.planoAcao) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fafafa] text-slate-300 text-sm">
        Nenhum dado financeiro disponível.
      </div>
    );
  }

  const eixoAtual = data.planoAcao.find((e) => e.eixo === activeEixo);

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen bg-white selection:bg-sky-100 selection:text-sky-900">
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
          {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
          <header
            className={`mb-16 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          >
            {/* Eyebrow */}
            <div
              className="anim-fade-up flex items-center gap-3 mb-8"
              style={{ animationDelay: "0ms" }}
            >
              <div
                className="anim-line-grow h-px w-14 bg-sky-500"
                style={{ animationDelay: "100ms" }}
              />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-sky-500">
                Planejamento Financeiro
              </span>
            </div>

            {/* Título */}
            <div
              className="anim-fade-up mb-10"
              style={{ animationDelay: "80ms" }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
                Previsão de Custos
              </h1>
              <div className="flex items-center gap-2 text-slate-400 mt-4">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-xs tracking-wide font-medium truncate">
                  {selectedReservoir?.name
                    ? `Região Hidrográfica do ${selectedReservoir.name}`
                    : "Carregando..."}
                </span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 pt-10 border-t border-slate-100">
              {/* Investimento Total - 5 Colunas */}
              <div className="md:col-span-3">
                <KpiCard
                  label="Investimento Total"
                  value={fmtBRL(data.resumoGeral.valorTotalPrevisto)}
                  sub="Previsão consolidada até 2050"
                  icon={<DollarSign className="w-4 h-4" />}
                  accent="sky"
                  delay={200}
                />
              </div>

              {/* Eixos Estratégicos - 2 Colunas (O card que você queria diminuir) */}
              <div className="md:col-span-2">
                <KpiCard
                  label="Eixos"
                  value={String(data.planoAcao.length)}
                  sub="Atuação"
                  icon={<Layers className="w-4 h-4" />}
                  accent="blue"
                  delay={280}
                />
              </div>

              {/* Maior Aporte - 5 Colunas */}
              <div className="md:col-span-3">
                <KpiCard
                  label="Maior Aporte"
                  value={fmtBRL(
                    Math.max(
                      ...data.planoAcao.map((e) => e.valorTotalProjetado),
                    ),
                  )}
                  sub="Representatividade máxima"
                  icon={<TrendingUp className="w-4 h-4" />}
                  accent="slate"
                  delay={360}
                />
              </div>
            </div>

            {/* Aviso Informativo / Nota de Esclarecimento */}
            <div
              className="anim-fade-up mt-8 flex items-start gap-3.5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/70 via-amber-50/30 to-white p-4 sm:p-5 text-slate-600 shadow-[0_2px_12px_0_rgba(0,0,0,0.03)]"
              style={{ animationDelay: "420ms" }}
            >
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed space-y-0.5">
                <span className="font-semibold text-slate-800">
                  Nota sobre os valores apresentados:{" "}
                </span>
                <span className="text-slate-600">
                  Os valores e custos exibidos nesta página são estimativas de caráter especulativo e orientativo, servindo exclusivamente como base referencial para planejamento estratégico e modelagem de cenários. Não constituem valores concretos, fixos ou orçamentos executivos vinculantes, estando sujeitos a revisões periódicas, variações de mercado e detalhamentos técnicos em etapas posteriores.
                </span>
              </div>
            </div>
          </header>

          {/* ══ NAVEGAÇÃO ════════════════════════════════════════════════════════ */}

          {/* Mobile: Select */}
          <div className="block md:hidden mb-8">
            <Select value={activeEixo} onValueChange={setActiveEixo}>
              <SelectTrigger
                className="w-full rounded-2xl border-slate-200 bg-white h-12
                                        text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm"
              >
                <SelectValue placeholder="Selecione um eixo" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {data.planoAcao.map((e) => (
                  <SelectItem
                    key={e.eixo}
                    value={e.eixo}
                    className="text-xs font-bold uppercase tracking-widest"
                  >
                    {e.eixo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tabs */}
          <div className="hidden md:block mb-12">
            <Tabs value={activeEixo} onValueChange={setActiveEixo}>
              <TabsList
                className="bg-white border border-slate-100 shadow-[0_2px_14px_0_rgba(0,0,0,0.06)]
                                   p-1.5 rounded-2xl inline-flex gap-1"
              >
                {data.planoAcao.map((e) => (
                  <TabsTrigger
                    key={e.eixo}
                    value={e.eixo}
                    className="rounded-xl px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-widest
                               text-slate-400 hover:text-slate-700
                               data-[state=active]:bg-slate-900 data-[state=active]:text-white
                               data-[state=active]:shadow-md transition-all duration-200"
                  >
                    {e.eixo}
                  </TabsTrigger>
                ))}
              </TabsList>
              {data.planoAcao.map((e) => (
                <TabsContent key={e.eixo} value={e.eixo} className="hidden" />
              ))}
            </Tabs>
          </div>

          {/* ══ CONTEÚDO DO EIXO ═════════════════════════════════════════════════ */}
          {eixoAtual && (
            <div key={activeEixo} className="anim-fade-in space-y-14">
              {/* Banner do eixo ativo */}
              <div
                className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-10
                              shadow-[0_8px_48px_0_rgba(0,0,0,0.18)]"
              >
                {/* Blobs decorativos */}
                <div
                  className="pointer-events-none absolute -top-24 -right-24 w-72 h-72
                                rounded-full bg-sky-500/10 blur-3xl"
                />
                <div
                  className="pointer-events-none absolute -bottom-16 -left-12 w-52 h-52
                                rounded-full bg-blue-600/10 blur-2xl"
                />

                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-sky-400 mb-3 block">
                      Eixo Ativo
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      {eixoAtual.eixo}
                    </h2>
                    <div className="mt-5 flex items-center gap-3 max-w-xs">
                      <PercentBar value={eixoAtual.percentual} />
                      <span className="text-xs font-bold text-slate-400 shrink-0">
                        {(eixoAtual.percentual * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Aporte Total
                    </p>
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight break-words">
                      {fmtBRL(eixoAtual.valorTotalProjetado)}
                    </p>
                    <Badge className="mt-2 bg-sky-500/20 text-sky-300 border-sky-500/30 font-bold text-[10px] tracking-wider">
                      {eixoAtual.periodos.length} período
                      {eixoAtual.periodos.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Períodos */}
              <div className="space-y-12">
                {eixoAtual.periodos.map((periodo, pIdx) => (
                  <div key={periodo.intervalo} className="group">
                    {/* Separador numerado */}
                    <div className="flex items-center gap-4 mb-7">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full
                                      border border-slate-200 bg-white shadow-sm
                                      group-hover:border-sky-300 group-hover:bg-sky-50
                                      transition-all duration-300 shrink-0"
                      >
                        <span
                          className="text-[11px] font-extrabold text-slate-400
                                         group-hover:text-sky-500 transition-colors"
                        >
                          {String(pIdx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-700">
                        Período {periodo.intervalo}
                      </h4>
                      <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Card Custo Fixo */}
                      <div className="lg:col-span-1">
                        <div
                          className="h-full rounded-2xl border border-slate-100 bg-white p-6
                                        shadow-[0_2px_16px_0_rgba(0,0,0,0.04)]
                                        hover:shadow-[0_6px_28px_0_rgba(14,165,233,0.12)]
                                        hover:border-sky-100
                                        transition-all duration-300 flex flex-col justify-between gap-6"
                        >
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-slate-300 block mb-2">
                              Custo Fixo
                            </span>
                            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none break-words">
                              {fmtBRL(periodo.custoFixo)}
                            </p>
                          </div>
                          <div
                            className="self-start flex items-center gap-1.5 px-3 py-1.5
                                          rounded-full bg-sky-50 border border-sky-100"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <span className="text-[10px] font-bold text-sky-600">
                              Base garantida
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tabela Custos Variáveis */}
                      <div className="lg:col-span-2">
                        {periodo.custosVariaveis.length > 0 ? (
                          <div
                            className="rounded-2xl border border-slate-100 bg-white overflow-hidden
                                          shadow-[0_2px_16px_0_rgba(0,0,0,0.04)]
                                          hover:shadow-[0_6px_24px_0_rgba(0,0,0,0.08)]
                                          transition-shadow duration-300"
                          >
                            <div className="overflow-x-auto">
                              <Table className="min-w-[320px]">
                                <TableHeader>
                                  <TableRow className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                    <TableHead
                                      className="text-[9px] font-extrabold uppercase tracking-[0.22em]
                                                          text-slate-400 py-4 pl-6"
                                    >
                                      Métrica / Descrição
                                    </TableHead>
                                    <TableHead
                                      className="text-[9px] font-extrabold uppercase tracking-[0.22em]
                                                          text-slate-400 text-right py-4 pr-6 whitespace-nowrap"
                                    >
                                      Valor Unitário
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {periodo.custosVariaveis.map((cv, idx) => (
                                    <TableRow
                                      key={idx}
                                      className="border-b border-slate-50 last:border-0
                                                 hover:bg-sky-50/40 transition-colors duration-150 group/row"
                                    >
                                      <TableCell className="text-xs font-medium text-slate-600 py-4 pl-6 leading-snug">
                                        {cv.descricao}
                                      </TableCell>
                                      <TableCell
                                        className="text-right font-mono text-xs font-bold
                                                            text-slate-800 py-4 pr-6 whitespace-nowrap
                                                            group-hover/row:text-sky-600 transition-colors"
                                      >
                                        {cv.valorUnitario > 0 ? (
                                          fmtBRL(cv.valorUnitario)
                                        ) : (
                                          <span className="text-slate-300 font-normal">
                                            —
                                          </span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="h-full min-h-[100px] flex items-center justify-center
                                          rounded-2xl border border-dashed border-slate-200 bg-slate-50/40"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                              Sem métricas variáveis
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
          <footer
            className="mt-20 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.35em]">
                Sistema de Apoio à Decisão — Planejamento Hídrico
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Info className="w-3 h-3" />
              <span className="text-[10px] font-medium">
                Valores estimados · Sujeito a revisão
              </span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
