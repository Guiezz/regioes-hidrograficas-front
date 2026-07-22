"use client";

import { useEffect, useState, useCallback } from "react";
import { useReservoir } from "@/context/ReservoirContext";
import Image from "next/image";
import { getSections, getKpis } from "@/services/api";
import type { KPIItem, KPIResponse } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  MapPin,
  Building2,
  Activity,
  Waves,
  Scale,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Sprout,
  Factory,
  Thermometer,
  Construction,
  FlaskConical,
  Minimize2,
  type LucideIcon,
} from "lucide-react";

interface Section {
  id: number;
  number: string;
  title: string;
  content: string;
  level: number;
  image?: string;
}

const TAB_CONFIG = {
  infraestrutura: {
    chapter: "3",
    label: "Infraestrutura Hídrica",
    icon: Building2,
    color: "amber",
    sectionLabel: "Infraestrutura",
  },
  demanda: {
    chapter: "4",
    label: "Demanda Hídrica",
    icon: Activity,
    color: "rose",
    sectionLabel: "Demanda",
  },
  oferta: {
    chapter: "5",
    label: "Oferta Hídrica",
    icon: Waves,
    color: "cyan",
    sectionLabel: "Oferta",
  },
  balanco: {
    chapter: "6",
    label: "Balanço Hídrico",
    icon: Scale,
    color: "blue",
    sectionLabel: "Balanço",
  },
} as const;

type TabKey = keyof typeof TAB_CONFIG;

const ICON_MAP: Record<string, LucideIcon> = {
  dam: Building2,
  well: Droplets,
  pipe: Minimize2,
  droplets: Droplets,
  water: Waves,
  check: CheckCircle2,
  "test-tube": FlaskConical,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  cow: Users,
  users: Users,
  sprout: Sprout,
  factory: Factory,
  building: Building2,
  construction: Construction,
  thermometer: Thermometer,
};

const SEVERITY_STYLES = {
  positive: {
    bg: "bg-emerald-50/60",
    border: "border-emerald-100",
    text: "text-emerald-800",
    value: "text-emerald-600",
    icon: "text-emerald-500",
  },
  warning: {
    bg: "bg-amber-50/60",
    border: "border-amber-100",
    text: "text-amber-800",
    value: "text-amber-600",
    icon: "text-amber-500",
  },
  critical: {
    bg: "bg-red-50/60",
    border: "border-red-100",
    text: "text-red-800",
    value: "text-red-600",
    icon: "text-red-500",
  },
};

function KpiCard({ kpi }: { kpi: KPIItem }) {
  const styles = SEVERITY_STYLES[kpi.severity as keyof typeof SEVERITY_STYLES] || SEVERITY_STYLES.positive;
  const Icon = ICON_MAP[kpi.icon] || Droplets;

  return (
    <div className={`rounded-2xl p-5 border overflow-hidden ${styles.bg} ${styles.border} transition-all hover:shadow-md hover:shadow-${styles.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl bg-white/80 ${styles.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${styles.text}`}>
          {kpi.label}
        </span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${styles.value} leading-tight`}>
        {kpi.value}
        {kpi.unit && <span className="text-base font-medium ml-1 opacity-80">{kpi.unit}</span>}
      </div>
      {kpi.sublabel && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{kpi.sublabel}</p>
      )}
    </div>
  );
}

export default function SituacaoHidricaPage() {
  const { selectedReservoir } = useReservoir();
  const [kpis, setKpis] = useState<KPIResponse>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("infraestrutura");

  useEffect(() => {
    async function fetchData() {
      if (!selectedReservoir) return;
      setLoading(true);
      try {
        const [kpiData, sectionData] = await Promise.all([
          getKpis(selectedReservoir.id),
          getSections(selectedReservoir.id),
        ]);
        setKpis(kpiData);
        const sorted = sectionData.sort((a: Section, b: Section) =>
          a.number.localeCompare(b.number, undefined, { numeric: true })
        );
        setSections(sorted);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedReservoir]);

  const renderContent = useCallback((text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <p
        key={index}
        className="mb-6 text-slate-600 leading-[1.8] text-[1rem] md:text-[1.1rem] font-light text-justify [hyphens:auto]"
      >
        {line}
      </p>
    ));
  }, []);

  const getImageUrl = useCallback((imagePath: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:8080";
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  }, []);

  const config = TAB_CONFIG[activeTab];
  const currentKPIs = [
    ...(kpis[activeTab]?.atual || []),
    ...(kpis[activeTab]?.futuro || []),
  ];
  const tabSections = sections.filter((s) => s.number.startsWith(config.chapter));
  const mainTitle = tabSections.find((s) => s.level === 1);
  const topLevelSections = tabSections.filter((s) => s.level === 2);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase italic">
            Analisando Situação Hídrica
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
        <header className="mb-16 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-sky-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">
              Diagnóstico da Região Hidrográfica
            </span>
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              Situação Hídrica
            </h1>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm tracking-wide">
                {selectedReservoir?.name
                  ? `Região Hidrográfica do ${selectedReservoir.name}`
                  : "Carregando..."}
              </span>
            </div>
          </div>
        </header>

        {currentKPIs.length === 0 && topLevelSections.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>Nenhum dado encontrado para esta bacia.</p>
          </div>
        ) : (
          <>
            <div className="sticky top-4 z-20 mb-12 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as TabKey)}
                >
                  <TabsList className="bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm h-auto min-h-12 inline-flex flex-wrap w-full gap-1">
                    {(Object.entries(TAB_CONFIG) as [TabKey, typeof TAB_CONFIG[TabKey]][]).map(
                      ([key, cfg]) => (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="rounded-xl px-3 py-2.5 text-[11px] md:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <cfg.icon className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{cfg.label}</span>
                          <span className="md:hidden">{cfg.sectionLabel}</span>
                        </TabsTrigger>
                      ),
                    )}
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabKey)}
            >
              {(Object.keys(TAB_CONFIG) as TabKey[]).map((tabKey) => {
                const kpiList = [
                  ...(kpis[tabKey]?.atual || []),
                  ...(kpis[tabKey]?.futuro || []),
                ];
                return (
                  <TabsContent
                    key={tabKey}
                    value={tabKey}
                    className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 focus-visible:outline-none"
                  >
                    {kpiList.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kpiList.map((kpi) => (
                          <KpiCard key={kpi.id} kpi={kpi} />
                        ))}
                      </div>
                    )}

                    {mainTitle?.content && (
                      <div className="max-w-4xl pt-8 border-t border-slate-100">
                        <div className="text-lg md:text-2xl text-slate-500 font-light leading-relaxed text-justify">
                          {renderContent(mainTitle.content)}
                        </div>
                      </div>
                    )}

                    {topLevelSections.length > 0 && (
                      <div className="space-y-16">
                        {topLevelSections.map((section) => {
                          const children = tabSections.filter(
                            (s) => s.level === 3 && s.number.startsWith(section.number),
                          );
                          return (
                            <article key={section.id} className="space-y-8">
                              <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                                  {section.title}
                                </h2>
                              </div>
                              {section.image && (
                                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm mx-auto max-w-full">
                                  <Image
                                    src={getImageUrl(section.image)}
                                    alt={section.title}
                                    width={1200}
                                    height={600}
                                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <div className="max-w-none overflow-hidden">
                                {renderContent(section.content)}
                              </div>
                              {children.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {children.map((child) => {
                                    const subItems = tabSections.filter(
                                      (s) => s.level === 4 && s.number.startsWith(child.number),
                                    );
                                    return (
                                      <div
                                        key={child.id}
                                        className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
                                      >
                                        <h3 className="text-lg font-bold text-slate-800 mb-3">
                                          {child.title}
                                        </h3>
                                        <div className="text-slate-600 text-sm">
                                          {renderContent(child.content)}
                                        </div>
                                        {subItems.length > 0 && (
                                          <div className="mt-4 space-y-3">
                                            {subItems.map((sub) => (
                                              <div
                                                key={sub.id}
                                                className="p-4 rounded-xl bg-white border border-slate-100"
                                              >
                                                <h4 className="font-bold text-slate-700 mb-2 text-sm">
                                                  {sub.title}
                                                </h4>
                                                <div className="text-slate-500 text-sm">
                                                  {renderContent(sub.content)}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </>
        )}

        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
        </footer>
      </div>
    </div>
  );
}
