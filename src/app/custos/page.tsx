"use client";

import { useState } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import { getCustos } from "@/services/api";
import { useAsyncData } from "@/hooks/use-async-data";
import { DataState } from "@/components/data-state";
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
  MapPin,
  Info,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";
import { SelectRegionPrompt } from "@/components/layout/SelectRegionPrompt";
import { formatBRL, formatBRLResumido } from "@/lib/format";

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
  exact,
  sub,
  icon,
  accent = "sky",
  delay = 0,
}: {
  label: string;
  value: string;
  exact?: string;
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
      className={`anim-fade-up h-full rounded-2xl border border-slate-100 border-l-4 ${styles[accent]} p-6
                  shadow-[0_2px_16px_0_rgba(0,0,0,0.04)]
                  hover:shadow-[0_6px_28px_0_rgba(0,0,0,0.09)]
                  transition-shadow duration-300`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
        <span className="text-slate-200">{icon}</span>
      </div>
      <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none break-words">
        {value}
      </p>
      {exact && (
        <p className="mt-1.5 text-xs text-slate-500 tabular-nums">{exact}</p>
      )}
      {sub && (
        <p className="mt-2 text-xs text-slate-500 italic leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Componente Principal ─────────────────────────────────────────────────── */
export default function CustosPage() {
  const { selectedReservoir } = useReservoir();
  const regionId = selectedReservoir?.id;

  // Eixo selecionado; zerado ao trocar de região (ajuste durante a renderização)
  const [eixoView, setEixoView] = useState({ regionId, eixo: "" });
  if (eixoView.regionId !== regionId) {
    setEixoView({ regionId, eixo: "" });
  }
  const setActiveEixo = (eixo: string) => setEixoView((v) => ({ ...v, eixo }));

  const { data, status, retry } = useAsyncData(
    regionId ? () => getCustos(regionId) : null,
    [regionId],
  );

  if (!selectedReservoir) {
    return <SelectRegionPrompt moduleName="Previsão de Custos" />;
  }

  const planoAcao = status === "ready" ? (data?.planoAcao ?? []) : [];
  const activeEixo = planoAcao.some((e) => e.eixo === eixoView.eixo)
    ? eixoView.eixo
    : (planoAcao[0]?.eixo ?? "");
  const eixoAtual = planoAcao.find((e) => e.eixo === activeEixo);
  const maiorAporte = Math.max(0, ...planoAcao.map((e) => e.valorTotalProjetado));

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen bg-white selection:bg-sky-100 selection:text-sky-900">
        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
          {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
          <header>
            {/* Eyebrow */}
            <div
              className="anim-fade-up flex items-center gap-3 mb-8"
              style={{ animationDelay: "0ms" }}
            >
              <div
                className="anim-line-grow h-px w-14 bg-sky-500"
                style={{ animationDelay: "100ms" }}
              />
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-sky-600">
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
              <div className="flex items-center gap-2 text-slate-500 mt-4">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-xs tracking-wide font-medium truncate">
                  {selectedReservoir?.name
                    ? `Região Hidrográfica do ${selectedReservoir.name}`
                    : "Carregando..."}
                </span>
              </div>
            </div>

          </header>

          {status === "loading" || status === "idle" ? (
            <DataState status="loading" />
          ) : status === "error" ? (
            <DataState status="error" onRetry={retry} />
          ) : planoAcao.length === 0 ? (
            <DataState
              status="unavailable"
              regionName={selectedReservoir.name}
              unavailableReason="A previsão de custos desta região ainda não foi incorporada ao sistema."
            />
          ) : (
          <>
          <div className="mb-16">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 pt-10 border-t border-slate-100">
              {/* Investimento Total - 5 Colunas */}
              <div className="md:col-span-3">
                <KpiCard
                  label="Investimento Total"
                  value={formatBRLResumido(data?.resumoGeral?.valorTotalPrevisto ?? 0)}
                  exact={formatBRL(data?.resumoGeral?.valorTotalPrevisto ?? 0)}
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
                  value={String(planoAcao.length)}
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
                  value={formatBRLResumido(maiorAporte)}
                  exact={formatBRL(maiorAporte)}
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
          </div>

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
                {planoAcao.map((e) => (
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
                {planoAcao.map((e) => (
                  <TabsTrigger
                    key={e.eixo}
                    value={e.eixo}
                    className="rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest
                               text-slate-500 hover:text-slate-700
                               data-[state=active]:bg-slate-900 data-[state=active]:text-white
                               data-[state=active]:shadow-md transition-all duration-200"
                  >
                    {e.eixo}
                  </TabsTrigger>
                ))}
              </TabsList>
              {planoAcao.map((e) => (
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
                    <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-sky-400 mb-3 block">
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Aporte Total
                    </p>
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight break-words">
                      {formatBRLResumido(eixoAtual.valorTotalProjetado)}
                    </p>
                    <p className="mt-1 text-xs text-slate-300 tabular-nums">
                      {formatBRL(eixoAtual.valorTotalProjetado)}
                    </p>
                    <Badge className="mt-2 bg-sky-500/20 text-sky-300 border-sky-500/30 font-bold text-xs tracking-wider">
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
                          className="text-xs font-extrabold text-slate-500
                                         group-hover:text-sky-600 transition-colors"
                        >
                          {String(pIdx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-700">
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
                            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 block mb-2">
                              Custo Fixo
                            </span>
                            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none break-words">
                              {formatBRLResumido(periodo.custoFixo)}
                            </p>
                            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
                              {formatBRL(periodo.custoFixo)}
                            </p>
                          </div>
                          <div
                            className="self-start flex items-center gap-1.5 px-3 py-1.5
                                          rounded-full bg-sky-50 border border-sky-100"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            <span className="text-xs font-bold text-sky-600">
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
                            <div className="@container">
                            <ul className="divide-y divide-slate-100 @md:hidden">
                              {periodo.custosVariaveis.map((cv, idx) => (
                                <li key={idx} className="px-5 py-4 space-y-1">
                                  <p className="text-sm text-slate-700 leading-snug">
                                    {cv.descricao}
                                  </p>
                                  <p className="font-mono text-sm font-bold text-slate-800">
                                    {cv.valorUnitario > 0 ? (
                                      formatBRL(cv.valorUnitario)
                                    ) : (
                                      <span className="text-slate-500 font-normal">
                                        —
                                      </span>
                                    )}
                                  </p>
                                </li>
                              ))}
                            </ul>
                            <div className="hidden @md:block overflow-x-auto">
                              <Table className="min-w-[320px]">
                                <TableHeader>
                                  <TableRow className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                                    <TableHead
                                      className="text-xs font-extrabold uppercase tracking-[0.12em]
                                                          text-slate-500 py-4 pl-6"
                                    >
                                      Métrica / Descrição
                                    </TableHead>
                                    <TableHead
                                      className="text-xs font-extrabold uppercase tracking-[0.12em]
                                                          text-slate-500 text-right py-4 pr-6 whitespace-nowrap"
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
                                          formatBRL(cv.valorUnitario)
                                        ) : (
                                          <span className="text-slate-500 font-normal">
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
                          </div>
                        ) : (
                          <div
                            className="h-full min-h-[100px] flex items-center justify-center
                                          rounded-2xl border border-dashed border-slate-200 bg-slate-50/40"
                          >
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
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

          </>
          )}

          {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
          <footer
            className="mt-20 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.12em]">
                Sistema de Apoio à Decisão — Planejamento Hídrico
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Info className="w-3 h-3" />
              <span className="text-xs font-medium">
                Valores estimados · Sujeito a revisão
              </span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
